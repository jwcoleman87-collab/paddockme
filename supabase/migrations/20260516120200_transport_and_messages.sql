-- PaddockME - transport jobs + messages
--
-- Models the BUILD_02 step 3 surfaces that the initial schema
-- didn't cover:
--   * transport_jobs - the 3-party logistics surface that the
--     driver participates in. Sits alongside agreements rather than
--     inside them, so the agreement's contract detail (rate, terms)
--     can never leak into the transport room.
--   * messages - real persistence for the workspace + transport
--     chat surfaces. Threaded by either an agreement id or a
--     transport job id so the same shape covers both.
--
-- The driver-visibility rule is enforced by RLS rather than the UI
-- alone: a driver has SELECT access to transport_jobs they're on
-- (logistics only - no rate column exists on this table), and zero
-- SELECT access to agreements (the 2-party policy excludes them).
-- Querying rate_per_head_week as a driver returns no rows because
-- the agreement row itself is invisible.


-- transport_jobs ------------------------------------------------------------

create table if not exists public.transport_jobs (
  id uuid primary key default extensions.uuid_generate_v4(),
  agreement_id uuid not null references public.agreements(id) on delete cascade,
  livestock_owner_id uuid not null references public.profiles(id) on delete cascade,
  landowner_id uuid not null references public.profiles(id) on delete cascade,
  -- Nullable: a transport room can be drafted before a driver is
  -- invited. Once a driver accepts the job, this populates and they
  -- gain SELECT access via the RLS policy below.
  driver_id uuid references public.profiles(id) on delete set null,
  pickup_address text,
  destination_address text,
  livestock_count text,
  preferred_date date,
  route_summary text,
  status text not null default 'Booked',
  /*
   * Section-level coordination state (pickup, manifest, route,
   * delivery, return) plus the per-party confirmations and the
   * derived timeline live as JSONB on the row. Splitting them into
   * separate tables is a later step; for the prototype this keeps
   * the schema lean while still letting RLS gate the whole surface.
   */
  coordination_state jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transport_jobs_agreement_idx
  on public.transport_jobs(agreement_id);
create index if not exists transport_jobs_driver_idx
  on public.transport_jobs(driver_id);
create index if not exists transport_jobs_livestock_owner_idx
  on public.transport_jobs(livestock_owner_id);
create index if not exists transport_jobs_landowner_idx
  on public.transport_jobs(landowner_id);
create index if not exists transport_jobs_status_idx
  on public.transport_jobs(status);

alter table public.transport_jobs enable row level security;

drop trigger if exists transport_jobs_set_updated_at on public.transport_jobs;
create trigger transport_jobs_set_updated_at
  before update on public.transport_jobs
  for each row execute function public.set_updated_at();


-- messages ------------------------------------------------------------------

create table if not exists public.messages (
  id uuid primary key default extensions.uuid_generate_v4(),
  /*
   * A message belongs to either an agreement (workspace chat - 2
   * parties) or a transport job (transport room chat - 3 parties).
   * Exactly one of agreement_id / transport_job_id must be set; the
   * check constraint enforces that XOR shape.
   */
  agreement_id uuid references public.agreements(id) on delete cascade,
  transport_job_id uuid references public.transport_jobs(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  /*
   * Optional anchor to a section in the agreement / transport room.
   * Stored as a free-text id (e.g. "paddock", "manifest") because
   * the section list lives in code, not as its own table.
   */
  section_id text,
  body text not null,
  created_at timestamptz not null default now(),
  constraint messages_thread_xor check (
    (agreement_id is not null and transport_job_id is null)
    or (agreement_id is null and transport_job_id is not null)
  )
);

create index if not exists messages_agreement_idx
  on public.messages(agreement_id, created_at);
create index if not exists messages_transport_idx
  on public.messages(transport_job_id, created_at);
create index if not exists messages_sender_idx on public.messages(sender_id);

alter table public.messages enable row level security;


-- transport_jobs policies ---------------------------------------------------
-- Visible to all three parties on the job: livestock owner,
-- landowner, and (when assigned) driver. The driver-visibility rule
-- is satisfied here by design: the table has no rate / contract
-- columns. Pricing stays in agreements, where the driver has zero
-- SELECT access via the 2-party policy.

drop policy if exists "Transport: read for parties" on public.transport_jobs;
create policy "Transport: read for parties"
  on public.transport_jobs
  for select
  using (
    auth.uid() = livestock_owner_id
    or auth.uid() = landowner_id
    or auth.uid() = driver_id
  );

drop policy if exists "Transport: insert for parties" on public.transport_jobs;
create policy "Transport: insert for parties"
  on public.transport_jobs
  for insert
  with check (
    auth.uid() = livestock_owner_id
    or auth.uid() = landowner_id
  );

drop policy if exists "Transport: update for parties" on public.transport_jobs;
create policy "Transport: update for parties"
  on public.transport_jobs
  for update
  using (
    auth.uid() = livestock_owner_id
    or auth.uid() = landowner_id
    or auth.uid() = driver_id
  )
  with check (
    auth.uid() = livestock_owner_id
    or auth.uid() = landowner_id
    or auth.uid() = driver_id
  );


-- messages policies ---------------------------------------------------------
-- A message is readable / writable by whoever is on the thread:
--   * Workspace messages (agreement_id set) -> the two parties on
--     the parent agreement.
--   * Transport messages (transport_job_id set) -> the three parties
--     on the parent transport job, including the driver.
-- Senders can only insert messages where they are themselves the
-- sender_id.

drop policy if exists "Messages: read for thread parties" on public.messages;
create policy "Messages: read for thread parties"
  on public.messages
  for select
  using (
    (
      agreement_id is not null and exists (
        select 1
        from public.agreements a
        where a.id = messages.agreement_id
          and (a.livestock_owner_id = auth.uid() or a.landowner_id = auth.uid())
      )
    )
    or (
      transport_job_id is not null and exists (
        select 1
        from public.transport_jobs t
        where t.id = messages.transport_job_id
          and (
            t.livestock_owner_id = auth.uid()
            or t.landowner_id = auth.uid()
            or t.driver_id = auth.uid()
          )
      )
    )
  );

drop policy if exists "Messages: insert as sender" on public.messages;
create policy "Messages: insert as sender"
  on public.messages
  for insert
  with check (
    sender_id = auth.uid()
    and (
      (
        agreement_id is not null and exists (
          select 1
          from public.agreements a
          where a.id = messages.agreement_id
            and (a.livestock_owner_id = auth.uid() or a.landowner_id = auth.uid())
        )
      )
      or (
        transport_job_id is not null and exists (
          select 1
          from public.transport_jobs t
          where t.id = messages.transport_job_id
            and (
              t.livestock_owner_id = auth.uid()
              or t.landowner_id = auth.uid()
              or t.driver_id = auth.uid()
            )
        )
      )
    )
  );
