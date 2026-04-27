-- ===========================================================================
-- LocalPilot AI · Migration 0002 · services-Tabelle
-- ===========================================================================
-- Code-Session 38 · 2026-04-27
--
-- Eine Leistung gehört genau zu einem Betrieb (FK auf businesses.id).
-- Sortierung über `sort_order` (Public-Site erwartet aufsteigend).
-- `tags` als TEXT[] statt JSONB — Postgres kann TEXT[] effizient
-- indizieren und matchen, JSONB wäre Overkill für eine flache Liste.
--
-- RLS-Strategie (read-only Phase, identisch zu Migration 0001):
--   - Public-Read auf aktive Services veröffentlichter Betriebe.
--   - INSERT/UPDATE/DELETE bleiben blockiert bis Auth-Session 40.
-- ===========================================================================

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category text,
  title text not null,
  short_description text not null default '',
  long_description text not null default '',
  price_label text,
  duration_label text,
  image_url text,
  icon text,
  tags text[] not null default '{}'::text[],
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- FK-Spalten in Postgres MÜSSEN für gute Join-Performance indiziert sein.
create index if not exists services_business_id_idx on public.services (business_id);
create index if not exists services_active_sort_idx
  on public.services (business_id, sort_order)
  where is_active = true;
create index if not exists services_featured_idx
  on public.services (business_id)
  where is_featured = true;

-- updated_at-Trigger (Funktion existiert seit Migration 0001).
drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
  before update on public.services
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.services enable row level security;

-- Public-Read: anon darf aktive Services SELECTen, sofern der zugehörige
-- Betrieb veröffentlicht ist. Die `exists`-Sub-Query wird von PostgREST
-- pro Query nur einmal evaluiert, nicht pro Row.
drop policy if exists "Allow public read of active services on published businesses"
  on public.services;
create policy "Allow public read of active services on published businesses"
  on public.services
  for select
  to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1
      from public.businesses b
      where b.id = services.business_id
        and b.is_published = true
    )
  );

comment on table public.services is
  'LocalPilot AI: Leistungen pro Betrieb. Code-Session 38, read-only.';
