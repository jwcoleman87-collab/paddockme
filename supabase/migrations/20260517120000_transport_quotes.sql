-- PaddockME - transport quotes (Build 03 step 2)
--
-- Introduces the second privacy wall: the landowner-visibility rule.
--
-- The Build 02 driver-visibility wall excludes drivers from agreements -
-- a driver running SELECT rate_per_head_week FROM agreements returns
-- zero rows because the row itself is invisible to them.
--
-- Build 03 mirrors this for the transport commercial side. transport_quotes
-- carries the rate negotiated between Farmer A (livestock owner, pays for
-- the haul) and the driver (paid). Farmer B is on the transport job for
-- logistics coordination but is NOT a commercial party to the transport
-- rate, so they never appear in the SELECT scope of this table.
--
-- Same idempotent guarantees: CREATE ... IF NOT EXISTS, DROP POLICY ...
-- IF EXISTS, safe to re-apply against a partially-migrated schema.


-- transport_quotes ----------------------------------------------------------

create table if not exists public.transport_quotes (
  id uuid primary key default extensions.uuid_generate_v4(),
  transport_job_id uuid not null references public.transport_jobs(id) on delete cascade,
  -- The party who proposed this rate. Must be either the livestock_owner_id
  -- or the driver_id of the parent transport job. Enforced by the insert
  -- policy below.
  proposed_by uuid not null references public.profiles(id) on delete cascade,
  basis text not null check (basis in ('per_head', 'per_km', 'flat')),
  amount numeric not null check (amount >= 0),
  currency text not null default 'AUD',
  payment_terms text,
  status text not null default 'pending' check (
    status in ('pending', 'accepted', 'rejected', 'countered')
  ),
  -- Links a counter-offer to the quote it replaced. Null for the first
  -- quote in the chain.
  previous_quote_id uuid references public.transport_quotes(id) on delete set null,
  accepted_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transport_quotes_job_idx
  on public.transport_quotes(transport_job_id, created_at);
create index if not exists transport_quotes_status_idx
  on public.transport_quotes(status);

alter table public.transport_quotes enable row level security;

drop trigger if exists transport_quotes_set_updated_at on public.transport_quotes;
create trigger transport_quotes_set_updated_at
  before update on public.transport_quotes
  for each row execute function public.set_updated_at();


-- transport_jobs.accepted_quote_id ------------------------------------------
-- Pointer to the active commercial deal for this job. Nullable - a job can
-- exist (logistics scheduled) before any quote is accepted, and a job can
-- have a quote chain (proposed / countered / countered) before one is
-- accepted.

alter table public.transport_jobs
  add column if not exists accepted_quote_id uuid
    references public.transport_quotes(id) on delete set null;

create index if not exists transport_jobs_accepted_quote_idx
  on public.transport_jobs(accepted_quote_id);


-- transport_quotes policies -------------------------------------------------
-- The landowner-visibility wall.
--
-- A quote row is readable ONLY by:
--   * The livestock_owner_id on the parent transport_jobs row
--   * The driver_id on the parent transport_jobs row
--
-- The landowner_id is intentionally NOT in this list. Farmer B sees pickup,
-- route, delivery (logistics) via the transport_jobs policy from
-- migration 20260516120200, but never sees the rate.

drop policy if exists "Quotes: read for commercial parties" on public.transport_quotes;
create policy "Quotes: read for commercial parties"
  on public.transport_quotes
  for select
  using (
    exists (
      select 1
      from public.transport_jobs t
      where t.id = transport_quotes.transport_job_id
        and (t.livestock_owner_id = auth.uid() or t.driver_id = auth.uid())
    )
  );

-- Insert: only a commercial party can propose, and the proposed_by id must
-- match the inserting user (no proposing on someone else's behalf).
drop policy if exists "Quotes: insert as commercial party" on public.transport_quotes;
create policy "Quotes: insert as commercial party"
  on public.transport_quotes
  for insert
  with check (
    proposed_by = auth.uid()
    and exists (
      select 1
      from public.transport_jobs t
      where t.id = transport_quotes.transport_job_id
        and (t.livestock_owner_id = auth.uid() or t.driver_id = auth.uid())
    )
  );

-- Update: accept / reject / counter actions. Either commercial party can
-- write. The application layer is responsible for the state machine
-- (e.g. only the recipient of a pending quote can accept it).
drop policy if exists "Quotes: update for commercial parties" on public.transport_quotes;
create policy "Quotes: update for commercial parties"
  on public.transport_quotes
  for update
  using (
    exists (
      select 1
      from public.transport_jobs t
      where t.id = transport_quotes.transport_job_id
        and (t.livestock_owner_id = auth.uid() or t.driver_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.transport_jobs t
      where t.id = transport_quotes.transport_job_id
        and (t.livestock_owner_id = auth.uid() or t.driver_id = auth.uid())
    )
  );
