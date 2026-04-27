-- ===========================================================================
-- LocalPilot AI · Migration 0001 · businesses-Tabelle
-- ===========================================================================
-- Code-Session 37 · 2026-04-27
--
-- Erstes Tabellen-Schema. `businesses` ist die zentrale Entität, an der
-- alle weiteren Tabellen in späteren Sessions (services, leads, reviews,
-- faqs) per FK hängen werden.
--
-- Hybrid-Ansatz:
--   - Top-Level-Felder (für WHERE/ORDER): eigene Spalten.
--   - Geschachtelte Strukturen (Adresse, Kontakt, Öffnungszeiten): JSONB.
--     Form ist im TypeScript-Code (`BusinessSchema`) verbindlich, die DB
--     speichert nur „freie" JSONB-Werte.
--
-- RLS-Strategie für Code-Session 37 (read-only, Public-Site-Use-Case):
--   - RLS aktiv (Pflicht laut Supabase-Best-Practices 2026).
--   - Eine einzige Policy "Allow public read" für SELECT.
--   - INSERT/UPDATE/DELETE bleiben blockiert — kommen mit Session 38+
--     (Multi-Tenant-Auth via auth.uid() + business_owner-Tabelle).
--
-- Ausführen:
--   - Supabase-Dashboard → SQL Editor → diese Datei einfügen → Run.
--   - Oder via Supabase-CLI: `supabase db push` (Migration-Workflow).
-- ===========================================================================

create extension if not exists pgcrypto;

create table if not exists public.businesses (
  -- Identität
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,

  -- Stammdaten
  name text not null,
  industry_key text not null,
  package_tier text not null check (package_tier in ('bronze','silber','gold','platin')),
  locale text not null default 'de',
  tagline text not null,
  description text not null,

  -- Branding
  logo_url text,
  cover_image_url text,
  theme_key text not null,
  primary_color text,
  secondary_color text,
  accent_color text,

  -- Geschachtelte Strukturen (TS-Schema validiert, DB akzeptiert nur valides JSONB)
  address jsonb not null,
  contact jsonb not null default '{}'::jsonb,
  opening_hours jsonb not null default '[]'::jsonb,

  -- Status
  is_published boolean not null default false,

  -- Zeitstempel
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indizes für die häufigsten Zugriffsmuster
create index if not exists businesses_slug_idx on public.businesses (slug);
create index if not exists businesses_published_idx on public.businesses (is_published) where is_published = true;
create index if not exists businesses_industry_idx on public.businesses (industry_key);

-- Auto-Update updated_at bei jedem UPDATE
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
  before update on public.businesses
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: Pflicht-Aktivierung (Supabase-Best-Practice 2026)
-- ---------------------------------------------------------------------------
alter table public.businesses enable row level security;

-- Public-Read: jeder anon-Key darf veröffentlichte Betriebe SELECTen.
-- (Public-Site soll ohne Auth funktionieren.)
drop policy if exists "Allow public read of published businesses"
  on public.businesses;
create policy "Allow public read of published businesses"
  on public.businesses
  for select
  to anon, authenticated
  using (is_published = true);

-- Authenticated-Read: spätere Multi-Tenant-Owner sehen auch ihre
-- unveröffentlichten Betriebe. Vorerst Stub — `auth.uid()` matcht
-- nichts, weil noch keine `business_owner`-Tabelle existiert.
-- Wird in Session 38+ schärfer gesetzt.

-- INSERT/UPDATE/DELETE: explizit KEINE Policy → komplett blockiert.
-- Session 37 ist read-only.

comment on table public.businesses is
  'LocalPilot AI: zentrale Betriebs-Entität. Code-Session 37, read-only.';
