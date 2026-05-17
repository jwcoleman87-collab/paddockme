-- PaddockME - transport capacity (Build 03 step 3)
--
-- Driver-side capacity publishing. Today drivers are passively assigned to
-- transport jobs; this table lets Wayne (single-truck) and Sharon (multi-
-- truck dispatch) publish available runs so farmers can find them on a
-- new /transport/available browse surface.
--
-- Privacy: this is a public marketplace surface. SELECT is open to all
-- authenticated users (mirrors paddocks). Writes are gated to the owning
-- driver only.
--
-- Profile-carries-the-difference: the schema is identical for Wayne and
-- Sharon. The volume difference (1 row vs many) lives in the data, not
-- the surface.


-- transport_capacity --------------------------------------------------------

create table if not exists public.transport_capacity (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  -- Optional truck identifier. Single-truck operators leave null; multi-
  -- truck businesses use it to tag the specific vehicle the capacity belongs
  -- to so they can publish multiple rows in parallel.
  truck_label text,
  origin_region text not null,
  destination_region text not null,
  earliest_date date not null,
  latest_date date not null,
  head_capacity integer not null check (head_capacity > 0),
  stock_types text[] not null default array[]::text[],
  -- Indicative rate. The actual agreed price lives on the eventual
  -- transport_quotes chain; this is just so farmers can filter on
  -- ballpark cost when browsing.
  rate_basis text check (rate_basis in ('per_head', 'per_km', 'flat')),
  rate_amount numeric check (rate_amount >= 0),
  notes text,
  status text not null default 'published' check (
    status in ('published', 'booked', 'withdrawn', 'expired')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transport_capacity_date_window
    check (latest_date >= earliest_date)
);

create index if not exists transport_capacity_driver_idx
  on public.transport_capacity(driver_id);
create index if not exists transport_capacity_origin_idx
  on public.transport_capacity(origin_region);
create index if not exists transport_capacity_destination_idx
  on public.transport_capacity(destination_region);
create index if not exists transport_capacity_status_idx
  on public.transport_capacity(status);
create index if not exists transport_capacity_date_idx
  on public.transport_capacity(earliest_date, latest_date);

alter table public.transport_capacity enable row level security;

drop trigger if exists transport_capacity_set_updated_at on public.transport_capacity;
create trigger transport_capacity_set_updated_at
  before update on public.transport_capacity
  for each row execute function public.set_updated_at();


-- transport_capacity policies -----------------------------------------------
-- Read: public marketplace - anyone authenticated can browse. Matches the
-- paddocks "read all" policy.
--
-- Write: only the owning driver can insert / update / delete / withdraw
-- their own capacity rows.

drop policy if exists "Capacity: read all" on public.transport_capacity;
create policy "Capacity: read all"
  on public.transport_capacity for select
  using (true);

drop policy if exists "Capacity: insert own" on public.transport_capacity;
create policy "Capacity: insert own"
  on public.transport_capacity for insert
  with check (auth.uid() = driver_id);

drop policy if exists "Capacity: update own" on public.transport_capacity;
create policy "Capacity: update own"
  on public.transport_capacity for update
  using (auth.uid() = driver_id)
  with check (auth.uid() = driver_id);

drop policy if exists "Capacity: delete own" on public.transport_capacity;
create policy "Capacity: delete own"
  on public.transport_capacity for delete
  using (auth.uid() = driver_id);
