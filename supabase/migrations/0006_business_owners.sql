-- ===========================================================================
-- LocalPilot AI · Migration 0006 · business_owners-Tabelle
-- ===========================================================================
-- Code-Session 41 · 2026-04-27
--
-- Multi-Tenant-Bindung: ein User kann Owner / Editor / Viewer von 0..n
-- Betrieben sein, ein Betrieb hat 1..n zugehörige Owner. M:N-Verknüpfung
-- via Junction-Table. FK auf `auth.users(id)` — Supabase pflegt diese
-- Tabelle automatisch via Magic-Link-Sign-Up (kommt in Code-Session 42).
--
-- Helper-Funktion `is_business_owner` ist `security definer` — damit
-- bypassen RLS-Aufrufe aus anderen Policies die RLS auf
-- business_owners selbst. Andernfalls drehen sich Policies, die
-- business_owners abfragen, um sich selbst (Recursion-Risiko bei
-- nicht-trivialen Checks).
-- ===========================================================================

create table if not exists public.business_owners (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner'
    check (role in ('owner','editor','viewer')),
  created_at timestamptz not null default now(),
  -- Ein User-Business-Paar nur einmal.
  unique (business_id, user_id)
);

create index if not exists business_owners_user_id_idx
  on public.business_owners (user_id);
create index if not exists business_owners_business_id_idx
  on public.business_owners (business_id);

-- ---------------------------------------------------------------------------
-- Helper: kann der aktuelle (oder gegebene) User schreiben?
-- ---------------------------------------------------------------------------
-- `security definer` läuft mit den Rechten des Funktions-Owners und
-- ignoriert RLS auf business_owners. Damit vermeiden wir Recursion in
-- nachgelagerten RLS-Policies, die diese Funktion aufrufen.
-- `stable` erlaubt dem Planner, die Funktion pro-Statement zu cachen
-- statt pro-Zeile auszuwerten.
create or replace function public.is_business_owner(
  p_business_id uuid,
  p_user_id uuid default auth.uid()
) returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.business_owners
    where business_id = p_business_id
      and user_id = p_user_id
      and role in ('owner','editor')
  );
$$;

comment on function public.is_business_owner(uuid, uuid) is
  'Liefert true, wenn User Owner oder Editor des Betriebs ist. SECURITY DEFINER, damit aus nachgelagerten RLS-Policies aufrufbar.';

-- Optional: viewer-Variante für Lese-Pfade, falls wir Read-Only-Mitarbeiter
-- brauchen. Aktuell decken die Public-Read-Policies die Public-Site ab,
-- viewer wird also erst relevant bei privaten Daten (Leads, Drafts).
create or replace function public.has_business_access(
  p_business_id uuid,
  p_user_id uuid default auth.uid()
) returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.business_owners
    where business_id = p_business_id
      and user_id = p_user_id
  );
$$;

comment on function public.has_business_access(uuid, uuid) is
  'Liefert true für jede Rolle (owner/editor/viewer). Nützlich für Lese-Pfade auf private Daten wie Leads.';

-- ---------------------------------------------------------------------------
-- RLS auf business_owners SELBST
-- ---------------------------------------------------------------------------
alter table public.business_owners enable row level security;

-- SELECT: ein User darf sehen, an welchen Betrieben er Mitglied ist —
-- aber nicht, wer sonst noch Mitglied dieses Betriebs ist (würde Owner-
-- Listen-Fishing erlauben, wenn ein einziges Konto kompromittiert ist).
drop policy if exists "Allow user read of own membership rows"
  on public.business_owners;
create policy "Allow user read of own membership rows"
  on public.business_owners
  for select
  to authenticated
  using (user_id = auth.uid());

-- INSERT: nur ein bestehender Owner darf weitere Owner/Editor/Viewer
-- hinzufügen. Ausnahme: bei einem komplett neuen Betrieb gibt es noch
-- keinen Owner — der Initial-Insert kommt deshalb über einen
-- service-role-Pfad (Onboarding-Skript). Anon hat nichts hier zu suchen.
drop policy if exists "Allow existing owner to add members"
  on public.business_owners;
create policy "Allow existing owner to add members"
  on public.business_owners
  for insert
  to authenticated
  with check (
    public.is_business_owner(business_id)
  );

-- UPDATE: nur Owner darf Rollen umschreiben.
drop policy if exists "Allow owner to update memberships"
  on public.business_owners;
create policy "Allow owner to update memberships"
  on public.business_owners
  for update
  to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

-- DELETE: nur Owner darf Mitglieder entfernen. User darf sich auch
-- selbst entfernen (Self-Service-Verlassen).
drop policy if exists "Allow owner or self to delete membership"
  on public.business_owners;
create policy "Allow owner or self to delete membership"
  on public.business_owners
  for delete
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_business_owner(business_id)
  );

comment on table public.business_owners is
  'LocalPilot AI: Multi-Tenant-Bindung User ↔ Betrieb. Code-Session 41.';
