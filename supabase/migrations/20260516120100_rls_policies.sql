-- PaddockME - row-level security policies
--
-- Baseline policies covering the day-one access patterns:
--   * Profiles are publicly readable (marketplace trust signals) but
--     each user can only write their own row.
--   * Paddocks and agistment_requests are publicly readable for the
--     marketplace; each user can only mutate their own.
--   * Matches are readable by either the requester or the paddock
--     owner - no third party can poke around in someone else's
--     shortlist.
--   * Agreements are only readable / writable by the two parties on
--     the agreement (livestock owner and landowner). This is the
--     hard invariant that day-one persistence needs to enforce - the
--     driver-visibility rule for transport will extend it once we
--     model transport jobs.
--
-- Every policy uses DROP POLICY IF EXISTS ... so the migration is
-- safe to re-apply.


-- profiles ------------------------------------------------------------------

drop policy if exists "Profiles: read all" on public.profiles;
create policy "Profiles: read all"
  on public.profiles
  for select
  using (true);

drop policy if exists "Profiles: insert own" on public.profiles;
create policy "Profiles: insert own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "Profiles: update own" on public.profiles;
create policy "Profiles: update own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- paddocks ------------------------------------------------------------------
-- Publicly readable so livestock owners can discover them. Only the
-- owner can write.

drop policy if exists "Paddocks: read all" on public.paddocks;
create policy "Paddocks: read all"
  on public.paddocks
  for select
  using (true);

drop policy if exists "Paddocks: insert own" on public.paddocks;
create policy "Paddocks: insert own"
  on public.paddocks
  for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Paddocks: update own" on public.paddocks;
create policy "Paddocks: update own"
  on public.paddocks
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Paddocks: delete own" on public.paddocks;
create policy "Paddocks: delete own"
  on public.paddocks
  for delete
  using (auth.uid() = owner_id);


-- agistment_requests --------------------------------------------------------
-- Publicly readable (landowners need to see what stock is looking
-- for paddocks). Only the requester can write.

drop policy if exists "Requests: read all" on public.agistment_requests;
create policy "Requests: read all"
  on public.agistment_requests
  for select
  using (true);

drop policy if exists "Requests: insert own" on public.agistment_requests;
create policy "Requests: insert own"
  on public.agistment_requests
  for insert
  with check (auth.uid() = requester_id);

drop policy if exists "Requests: update own" on public.agistment_requests;
create policy "Requests: update own"
  on public.agistment_requests
  for update
  using (auth.uid() = requester_id)
  with check (auth.uid() = requester_id);

drop policy if exists "Requests: delete own" on public.agistment_requests;
create policy "Requests: delete own"
  on public.agistment_requests
  for delete
  using (auth.uid() = requester_id);


-- matches -------------------------------------------------------------------
-- A match is the candidate pairing between a request and a paddock.
-- Both parties on the candidate pair can read it; nobody else can.

drop policy if exists "Matches: read for parties" on public.matches;
create policy "Matches: read for parties"
  on public.matches
  for select
  using (
    exists (
      select 1
      from public.agistment_requests r
      where r.id = matches.request_id
        and r.requester_id = auth.uid()
    )
    or exists (
      select 1
      from public.paddocks p
      where p.id = matches.paddock_id
        and p.owner_id = auth.uid()
    )
  );

-- Matches are normally written by server-side functions (the
-- matching engine), not directly by users. Service-role inserts
-- bypass RLS, so we don't need a permissive insert policy here.


-- agreements ----------------------------------------------------------------
-- Only the two parties on the agreement can read or write it. This
-- is the hard contract-privacy boundary - drivers and the public
-- never see the agreement table.

drop policy if exists "Agreements: read for parties" on public.agreements;
create policy "Agreements: read for parties"
  on public.agreements
  for select
  using (
    auth.uid() = livestock_owner_id
    or auth.uid() = landowner_id
  );

drop policy if exists "Agreements: insert for parties" on public.agreements;
create policy "Agreements: insert for parties"
  on public.agreements
  for insert
  with check (
    auth.uid() = livestock_owner_id
    or auth.uid() = landowner_id
  );

drop policy if exists "Agreements: update for parties" on public.agreements;
create policy "Agreements: update for parties"
  on public.agreements
  for update
  using (
    auth.uid() = livestock_owner_id
    or auth.uid() = landowner_id
  )
  with check (
    auth.uid() = livestock_owner_id
    or auth.uid() = landowner_id
  );

drop policy if exists "Agreements: delete for parties" on public.agreements;
create policy "Agreements: delete for parties"
  on public.agreements
  for delete
  using (
    auth.uid() = livestock_owner_id
    or auth.uid() = landowner_id
  );
