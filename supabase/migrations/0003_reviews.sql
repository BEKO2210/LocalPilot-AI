-- ===========================================================================
-- LocalPilot AI · Migration 0003 · reviews-Tabelle
-- ===========================================================================
-- Code-Session 38 · 2026-04-27
--
-- Eine Bewertung gehört zu einem Betrieb (FK auf businesses.id).
-- `source` ist ein Enum-Lookalike via CHECK; sobald wir mehr als
-- google/internal/facebook brauchen, wandern wir auf Postgres-Enum.
--
-- RLS:
--   - Public-Read auf veröffentlichte Reviews bei veröffentlichten Betrieben.
--   - Schreib-Policies kommen mit Auth (Session 40+).
-- ===========================================================================

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  text text not null,
  source text not null default 'internal'
    check (source in ('google','facebook','internal')),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_business_id_idx on public.reviews (business_id);
create index if not exists reviews_published_idx
  on public.reviews (business_id, created_at desc)
  where is_published = true;

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
  before update on public.reviews
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.reviews enable row level security;

drop policy if exists "Allow public read of published reviews on published businesses"
  on public.reviews;
create policy "Allow public read of published reviews on published businesses"
  on public.reviews
  for select
  to anon, authenticated
  using (
    is_published = true
    and exists (
      select 1
      from public.businesses b
      where b.id = reviews.business_id
        and b.is_published = true
    )
  );

comment on table public.reviews is
  'LocalPilot AI: Bewertungen pro Betrieb. Code-Session 38, read-only.';
