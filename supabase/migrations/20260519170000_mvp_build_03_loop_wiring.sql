-- PaddockME - MVP Build 03 loop wiring policies
--
-- Allows the browser MVP loop to create match rows and lets a driver accept
-- an available unassigned transport job. This keeps the current UI flow while
-- preserving the agreement privacy wall.

drop policy if exists "Matches: insert by request or paddock party" on public.matches;
create policy "Matches: insert by request or paddock party"
  on public.matches
  for insert
  with check (
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

drop policy if exists "Transport: driver accepts available jobs" on public.transport_jobs;
create policy "Transport: driver accepts available jobs"
  on public.transport_jobs
  for update
  using (
    status = 'available'
    and driver_id is null
  )
  with check (
    driver_id = auth.uid()
    and status in ('accepted', 'loading', 'in_transit', 'arrived', 'completed')
  );
