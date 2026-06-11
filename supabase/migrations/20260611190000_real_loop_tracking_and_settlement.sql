-- PaddockME - real loop tracking and direct settlement
--
-- Adds data-backed transport milestones and makes the no-Stripe-yet
-- settlement path explicit. Stripe Connect is still the provider target;
-- until credentials are live the app records agistment settlement directly
-- without implying card capture or payout.

-- transport_milestones ------------------------------------------------------

create table if not exists public.transport_milestones (
  id uuid primary key default extensions.uuid_generate_v4(),
  transport_job_id uuid not null references public.transport_jobs(id) on delete cascade,
  label text not null,
  description text not null,
  sort_order integer not null,
  status text not null default 'pending' check (
    status in ('pending', 'passed')
  ),
  passed_at timestamptz,
  passed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (transport_job_id, sort_order)
);

create index if not exists transport_milestones_job_idx
  on public.transport_milestones(transport_job_id, sort_order);

alter table public.transport_milestones enable row level security;

drop trigger if exists transport_milestones_set_updated_at on public.transport_milestones;
create trigger transport_milestones_set_updated_at
  before update on public.transport_milestones
  for each row execute function public.set_updated_at();

drop policy if exists "Transport milestones: read for transport parties" on public.transport_milestones;
create policy "Transport milestones: read for transport parties"
  on public.transport_milestones
  for select
  using (
    exists (
      select 1 from public.transport_jobs t
      where t.id = transport_milestones.transport_job_id
        and (
          t.livestock_owner_id = auth.uid()
          or t.landowner_id = auth.uid()
          or t.driver_id = auth.uid()
        )
    )
  );

drop policy if exists "Transport milestones: update by assigned driver" on public.transport_milestones;
create policy "Transport milestones: update by assigned driver"
  on public.transport_milestones
  for update
  using (
    exists (
      select 1 from public.transport_jobs t
      where t.id = transport_milestones.transport_job_id
        and t.driver_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.transport_jobs t
      where t.id = transport_milestones.transport_job_id
        and t.driver_id = auth.uid()
    )
  );

-- Milestones are initially created by trusted server/service code or by the
-- transport-job creator through the repository layer; updates are driver-only.
drop policy if exists "Transport milestones: insert as transport party" on public.transport_milestones;
create policy "Transport milestones: insert as transport party"
  on public.transport_milestones
  for insert
  with check (
    exists (
      select 1 from public.transport_jobs t
      where t.id = transport_milestones.transport_job_id
        and (
          t.livestock_owner_id = auth.uid()
          or t.landowner_id = auth.uid()
          or t.driver_id = auth.uid()
        )
    )
  );

-- payment direct-settlement support ----------------------------------------

create unique index if not exists payables_agistment_agreement_unique_idx
  on public.payables(agreement_id, kind)
  where kind = 'agistment';
