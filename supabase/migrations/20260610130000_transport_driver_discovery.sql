-- PaddockME - transport driver discovery
--
-- Problem: "Transport: read for parties" only lets the livestock owner,
-- landowner, and the ALREADY-ASSIGNED driver read a transport job. An
-- unassigned transport provider browsing for work could not see any
-- 'available' job, so RFTs raised from agreements were invisible to every
-- driver and the farmer -> driver loop never closed.
--
-- Fix: transport providers may read jobs that are still available
-- (driver_id is null). The table carries no agistment rates or contract
-- terms by design, so this exposes route/load/timing only. The existing
-- "Transport: driver accepts available jobs" update policy then lets them
-- accept, which assigns driver_id and flips status.

drop policy if exists "Transport: available jobs visible to transport providers"
  on public.transport_jobs;
create policy "Transport: available jobs visible to transport providers"
  on public.transport_jobs
  for select
  using (
    status = 'available'
    and driver_id is null
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and 'Transport Provider' = any(p.account_types)
    )
  );
