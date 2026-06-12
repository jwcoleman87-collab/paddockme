-- Remove Codex browser-verification carrier accounts from the visible product.
--
-- The auth users may still exist in Supabase Auth, but the production app must
-- not show them as transport providers or keep old RFTs assigned to them.

with removed_profiles as (
  select id
  from public.profiles
  where full_name ilike 'Codex Carrier%'
    or full_name ilike 'Removed test account%'
)
update public.transport_jobs
set
  driver_id = null,
  accepted_quote_id = null,
  status = 'available',
  updated_at = now()
where driver_id in (select id from removed_profiles);

update public.profiles
set
  full_name = 'Removed test account',
  account_types = array[]::text[],
  updated_at = now()
where full_name ilike 'Codex Carrier%'
  or full_name ilike 'Removed test account%';

delete from public.transport_capacity
where driver_id in (
  select id
  from public.profiles
  where full_name = 'Removed test account'
);
