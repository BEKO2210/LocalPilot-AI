-- ===========================================================================
-- LocalPilot AI · Migration 0005 · leads-Tabelle
-- ===========================================================================
-- Code-Session 39 · 2026-04-27
--
-- Eine Lead-Anfrage gehört zu einem Betrieb. **Asymmetrische** RLS:
--   - INSERT-Policy für anon: jede Person darf eine Anfrage senden,
--     aber NUR mit Pflicht-Consent + nur an einen veröffentlichten
--     Betrieb. Damit funktioniert das Public-Lead-Form ohne Login,
--     aber niemand kann Leads ohne Consent einschmuggeln.
--   - SELECT-Policy: NUR authenticated. Anon darf seinen eigenen
--     INSERT NICHT zurücklesen — sonst würde ein Lead-Form-Skript
--     fremde Leads abgreifen können.
--   - UPDATE/DELETE: explizit blockiert (kommen mit Auth-Session 40).
--
-- DSGVO-Audit-Trail: `consent` ist Pflicht (NOT NULL CHECK). Form:
--   { "givenAt": "<ISO-Timestamp>", "policyVersion": "v1-2026-04" }
-- Bei späterer inhaltlicher Änderung der Datenschutzerklärung
-- wandert `policyVersion` mit, bestehende Leads behalten ihren Stand
-- (Audit-Trail nach DSGVO Art. 7 Abs. 1). `givenAt` wird im
-- Application-Layer gesetzt — nicht in der DB —, damit die
-- Einwilligungs-Zeit der Submit-Zeit auf dem Client entspricht.
-- ===========================================================================

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,

  -- Identitäts-Stammdaten der anfragenden Person
  source text not null default 'website_form'
    check (source in ('website_form','phone','whatsapp','email','walk_in','referral','social','other')),
  name text not null,
  phone text,
  email text,

  -- Inhalt
  message text not null default '',
  requested_service_id uuid references public.services(id) on delete set null,
  preferred_date text,
  preferred_time text,

  -- Branchenspezifische Zusatzfelder (LeadFormField + Wert)
  extra_fields jsonb not null default '{}'::jsonb,

  -- Verarbeitungs-Status
  status text not null default 'new'
    check (status in ('new','contacted','qualified','won','lost','archived')),
  notes text not null default '',

  -- DSGVO-Audit-Trail (Pflicht!)
  consent jsonb not null,

  -- Zeitstempel
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Mind. eine Kontaktmöglichkeit muss da sein (analog zum Zod-`refine`).
  constraint leads_phone_or_email_required check (phone is not null or email is not null),

  -- Consent-Pflichtform: muss givenAt + policyVersion enthalten.
  constraint leads_consent_shape check (
    consent ? 'givenAt' and consent ? 'policyVersion'
  )
);

create index if not exists leads_business_id_idx on public.leads (business_id);
create index if not exists leads_status_created_idx
  on public.leads (business_id, status, created_at desc);

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.leads enable row level security;

-- INSERT: anon darf einreichen, aber nur an veröffentlichte Betriebe
-- und nur mit gültigem Consent-Stempel. WITH CHECK greift nach
-- Anwendung der Default-Werte und CHECK-Constraints.
drop policy if exists "Allow anon insert with consent on published businesses"
  on public.leads;
create policy "Allow anon insert with consent on published businesses"
  on public.leads
  for insert
  to anon, authenticated
  with check (
    consent ? 'givenAt'
    and consent ? 'policyVersion'
    and (consent->>'policyVersion') is not null
    and exists (
      select 1
      from public.businesses b
      where b.id = leads.business_id
        and b.is_published = true
    )
  );

-- SELECT: nur authenticated. Anon-Submitter sieht NICHT mal seinen
-- eigenen Lead zurück — der Form-Erfolgs-Pfad muss ohne Re-Read
-- auskommen. Mit Multi-Tenant-Auth (Session 40+) wird die Policy
-- noch gegen die Owner-Tabelle verschärft.
drop policy if exists "Allow authenticated read of all leads (temp)"
  on public.leads;
create policy "Allow authenticated read of all leads (temp)"
  on public.leads
  for select
  to authenticated
  using (true);

-- UPDATE / DELETE: explizit keine Policy → blockiert. Folgt mit Auth.

comment on table public.leads is
  'LocalPilot AI: Kundenanfragen mit DSGVO-Consent-Audit-Trail. Code-Session 39.';
