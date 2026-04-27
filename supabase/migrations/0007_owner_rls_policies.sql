-- ===========================================================================
-- LocalPilot AI · Migration 0007 · Owner-scoped RLS-Policies
-- ===========================================================================
-- Code-Session 41 · 2026-04-27
--
-- Erweitert die RLS auf businesses/services/reviews/faqs/leads um
-- Owner-scoped Policies. Public-Read-Policies aus 0001–0005 bleiben
-- unverändert — diese Migration **fügt nur hinzu**, mit einer
-- Ausnahme: die "Allow authenticated read of all leads (temp)"-Policy
-- aus 0005 wird durch eine Owner-scoped ersetzt.
--
-- Idempotent: alle Policies via `drop policy if exists` zuerst weg,
-- dann neu. Mehrfaches Ausführen schadet nicht.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- businesses: Owner darf seine eigenen Betriebe ändern und löschen
-- ---------------------------------------------------------------------------
drop policy if exists "Allow owner to update own business"
  on public.businesses;
create policy "Allow owner to update own business"
  on public.businesses
  for update
  to authenticated
  using (public.is_business_owner(id))
  with check (public.is_business_owner(id));

drop policy if exists "Allow owner to delete own business"
  on public.businesses;
create policy "Allow owner to delete own business"
  on public.businesses
  for delete
  to authenticated
  using (public.is_business_owner(id));

-- INSERT für businesses bleibt **explizit blockiert** — neue Betriebe
-- werden über einen Onboarding-Service-Role-Pfad angelegt, der die
-- erste Zeile in business_owners sofort mit erstellt. Sonst gibt es
-- ein Henne-Ei-Problem (kein Owner = kein Insert-Recht).

-- Owner darf auch unveröffentlichte Betriebe sehen (für Editor-Vorschau).
drop policy if exists "Allow owner to read own business including drafts"
  on public.businesses;
create policy "Allow owner to read own business including drafts"
  on public.businesses
  for select
  to authenticated
  using (public.is_business_owner(id));

-- ---------------------------------------------------------------------------
-- services: Owner darf alle CRUD-Aktionen pro eigenem Betrieb
-- ---------------------------------------------------------------------------
drop policy if exists "Allow owner to insert services"
  on public.services;
create policy "Allow owner to insert services"
  on public.services
  for insert
  to authenticated
  with check (public.is_business_owner(business_id));

drop policy if exists "Allow owner to update services"
  on public.services;
create policy "Allow owner to update services"
  on public.services
  for update
  to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

drop policy if exists "Allow owner to delete services"
  on public.services;
create policy "Allow owner to delete services"
  on public.services
  for delete
  to authenticated
  using (public.is_business_owner(business_id));

drop policy if exists "Allow owner to read services including inactive"
  on public.services;
create policy "Allow owner to read services including inactive"
  on public.services
  for select
  to authenticated
  using (public.is_business_owner(business_id));

-- ---------------------------------------------------------------------------
-- reviews: gleiches Schema wie services
-- ---------------------------------------------------------------------------
drop policy if exists "Allow owner to insert reviews"
  on public.reviews;
create policy "Allow owner to insert reviews"
  on public.reviews
  for insert
  to authenticated
  with check (public.is_business_owner(business_id));

drop policy if exists "Allow owner to update reviews"
  on public.reviews;
create policy "Allow owner to update reviews"
  on public.reviews
  for update
  to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

drop policy if exists "Allow owner to delete reviews"
  on public.reviews;
create policy "Allow owner to delete reviews"
  on public.reviews
  for delete
  to authenticated
  using (public.is_business_owner(business_id));

drop policy if exists "Allow owner to read reviews including drafts"
  on public.reviews;
create policy "Allow owner to read reviews including drafts"
  on public.reviews
  for select
  to authenticated
  using (public.is_business_owner(business_id));

-- ---------------------------------------------------------------------------
-- faqs: gleiches Schema wie services
-- ---------------------------------------------------------------------------
drop policy if exists "Allow owner to insert faqs"
  on public.faqs;
create policy "Allow owner to insert faqs"
  on public.faqs
  for insert
  to authenticated
  with check (public.is_business_owner(business_id));

drop policy if exists "Allow owner to update faqs"
  on public.faqs;
create policy "Allow owner to update faqs"
  on public.faqs
  for update
  to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

drop policy if exists "Allow owner to delete faqs"
  on public.faqs;
create policy "Allow owner to delete faqs"
  on public.faqs
  for delete
  to authenticated
  using (public.is_business_owner(business_id));

drop policy if exists "Allow owner to read faqs including inactive"
  on public.faqs;
create policy "Allow owner to read faqs including inactive"
  on public.faqs
  for select
  to authenticated
  using (public.is_business_owner(business_id));

-- ---------------------------------------------------------------------------
-- leads: ASYMMETRISCH — anon-INSERT bleibt (Public-Form), aber
-- die SELECT-Policy aus 0005 ("Allow authenticated read of all leads (temp)")
-- wird durch eine Owner-scoped ersetzt. Damit sehen Owner ihre
-- eigenen Leads, aber nicht die anderer Betriebe.
-- ---------------------------------------------------------------------------

-- Alte temporäre Policy explizit weg.
drop policy if exists "Allow authenticated read of all leads (temp)"
  on public.leads;

-- Owner-scoped SELECT (alle Rollen — owner, editor, viewer)
drop policy if exists "Allow business members to read own leads"
  on public.leads;
create policy "Allow business members to read own leads"
  on public.leads
  for select
  to authenticated
  using (public.has_business_access(business_id));

-- Owner-scoped UPDATE (nur owner/editor — Status ändern, Notizen pflegen)
drop policy if exists "Allow owner or editor to update own leads"
  on public.leads;
create policy "Allow owner or editor to update own leads"
  on public.leads
  for update
  to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

-- Owner-scoped DELETE (nur owner — DSGVO-Löschung)
drop policy if exists "Allow owner to delete own leads"
  on public.leads;
create policy "Allow owner to delete own leads"
  on public.leads
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.business_owners bo
      where bo.business_id = leads.business_id
        and bo.user_id = auth.uid()
        and bo.role = 'owner'
    )
  );

-- INSERT-Policy aus 0005 (anon mit Consent) bleibt unverändert.

-- ---------------------------------------------------------------------------
-- Hinweis: Diese Migration aktiviert die Owner-Pfade strukturell —
-- solange business_owners leer ist (Magic-Link-Auth folgt in 42),
-- ändert sich für anonyme Public-Site-Besucher nichts. Die
-- bestehenden Public-Read-Policies aus 0001–0004 bleiben aktiv.
-- ---------------------------------------------------------------------------

comment on schema public is
  'LocalPilot AI: Multi-Tenant-Schema. Owner-Bindung über business_owners + is_business_owner()/has_business_access(). Code-Session 41.';
