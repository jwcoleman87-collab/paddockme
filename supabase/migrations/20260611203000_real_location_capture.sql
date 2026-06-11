-- Real location capture for the production core loop.
--
-- Geography columns already exist. These fields preserve the human-readable
-- address/place chosen by the customer so agreements and RFTs can show real
-- pickup/drop-off text instead of broad region placeholders.

alter table public.agistment_requests
  add column if not exists origin_address text,
  add column if not exists origin_place_id text;

alter table public.paddocks
  add column if not exists address text,
  add column if not exists place_id text;

alter table public.agreements
  add column if not exists pickup_address text,
  add column if not exists destination_address text;

