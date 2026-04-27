-- ===========================================================================
-- LocalPilot AI · Migration 0004 · faqs-Tabelle
-- ===========================================================================
-- Code-Session 39 · 2026-04-27
--
-- Eine FAQ gehört zu einem Betrieb. Read-only-RLS analog zu services
-- (Migration 0002): aktive FAQs veröffentlichter Betriebe sind public.
-- ===========================================================================

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  question text not null,
  answer text not null,
  category text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faqs_business_id_idx on public.faqs (business_id);
create index if not exists faqs_active_sort_idx
  on public.faqs (business_id, sort_order)
  where is_active = true;

drop trigger if exists faqs_set_updated_at on public.faqs;
create trigger faqs_set_updated_at
  before update on public.faqs
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.faqs enable row level security;

drop policy if exists "Allow public read of active faqs on published businesses"
  on public.faqs;
create policy "Allow public read of active faqs on published businesses"
  on public.faqs
  for select
  to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1
      from public.businesses b
      where b.id = faqs.business_id
        and b.is_published = true
    )
  );

comment on table public.faqs is
  'LocalPilot AI: FAQs pro Betrieb. Code-Session 39, read-only.';
