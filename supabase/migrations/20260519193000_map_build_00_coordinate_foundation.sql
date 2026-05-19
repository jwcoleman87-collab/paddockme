-- PaddockME - Map Build 00 coordinate foundation
--
-- Adds the durable geospatial substrate for the future operational map.
-- This does not change the user journey or widen visibility. Location data
-- lives on existing RLS-protected tables, so the same Dale/Brett/Wayne
-- privacy boundaries continue to apply.

create extension if not exists postgis with schema extensions;


-- core locations ------------------------------------------------------------

alter table public.profiles
  add column if not exists location extensions.geography(Point, 4326);

alter table public.paddocks
  add column if not exists location extensions.geography(Point, 4326);

alter table public.agistment_requests
  add column if not exists location extensions.geography(Point, 4326);

alter table public.agreements
  add column if not exists pickup_location extensions.geography(Point, 4326),
  add column if not exists destination_location extensions.geography(Point, 4326);

alter table public.transport_jobs
  add column if not exists pickup_location extensions.geography(Point, 4326),
  add column if not exists destination_location extensions.geography(Point, 4326),
  add column if not exists current_location extensions.geography(Point, 4326);


-- spatial indexes -----------------------------------------------------------

create index if not exists profiles_location_gix
  on public.profiles using gist (location);

create index if not exists paddocks_location_gix
  on public.paddocks using gist (location);

create index if not exists agistment_requests_location_gix
  on public.agistment_requests using gist (location);

create index if not exists agreements_pickup_location_gix
  on public.agreements using gist (pickup_location);

create index if not exists agreements_destination_location_gix
  on public.agreements using gist (destination_location);

create index if not exists transport_jobs_pickup_location_gix
  on public.transport_jobs using gist (pickup_location);

create index if not exists transport_jobs_destination_location_gix
  on public.transport_jobs using gist (destination_location);

create index if not exists transport_jobs_current_location_gix
  on public.transport_jobs using gist (current_location);


-- tiny deterministic backfill for current MVP/demo-shaped rows ---------------

update public.profiles
set location = extensions.ST_SetSRID(extensions.ST_MakePoint(148.6970, -33.8350), 4326)::extensions.geography
where location is null
  and (full_name ilike '%Dale%' or regions && array['Central West NSW', 'Central West']::text[]);

update public.profiles
set location = extensions.ST_SetSRID(extensions.ST_MakePoint(148.1050, -35.0660), 4326)::extensions.geography
where location is null
  and (full_name ilike '%Brett%' or regions && array['Southern NSW']::text[]);

update public.profiles
set location = extensions.ST_SetSRID(extensions.ST_MakePoint(147.3670, -35.1150), 4326)::extensions.geography
where location is null
  and (full_name ilike '%Wayne%' or regions && array['Riverina NSW']::text[]);

update public.profiles
set location = extensions.ST_SetSRID(extensions.ST_MakePoint(150.3060, -28.5460), 4326)::extensions.geography
where location is null
  and (full_name ilike '%Sharon%' or regions && array['Goondiwindi QLD', 'Darling Downs QLD']::text[]);

update public.paddocks
set location = case
  when title ilike '%Glenbarra%' or region ilike '%Southern NSW%'
    then extensions.ST_SetSRID(extensions.ST_MakePoint(148.1050, -35.0660), 4326)::extensions.geography
  when title ilike '%Wattle%' or region ilike '%Central West%'
    then extensions.ST_SetSRID(extensions.ST_MakePoint(148.6970, -33.8350), 4326)::extensions.geography
  when title ilike '%Hillview%' or region ilike '%Gippsland%'
    then extensions.ST_SetSRID(extensions.ST_MakePoint(147.6300, -37.8250), 4326)::extensions.geography
  else location
end
where location is null;

update public.agistment_requests
set location = case
  when preferred_regions && array['Central West NSW', 'Central West']::text[]
    then extensions.ST_SetSRID(extensions.ST_MakePoint(148.6970, -33.8350), 4326)::extensions.geography
  when preferred_regions && array['Northern NSW', 'Northern Tablelands NSW']::text[]
    then extensions.ST_SetSRID(extensions.ST_MakePoint(151.6650, -30.5140), 4326)::extensions.geography
  else location
end
where location is null;

update public.agreements a
set
  pickup_location = coalesce(a.pickup_location, r.location),
  destination_location = coalesce(a.destination_location, p.location)
from public.matches m
join public.agistment_requests r on r.id = m.request_id
join public.paddocks p on p.id = m.paddock_id
where a.match_id = m.id
  and (a.pickup_location is null or a.destination_location is null);

update public.transport_jobs t
set
  pickup_location = coalesce(t.pickup_location, a.pickup_location),
  destination_location = coalesce(t.destination_location, a.destination_location),
  current_location = coalesce(t.current_location, a.pickup_location)
from public.agreements a
where t.agreement_id = a.id
  and (t.pickup_location is null or t.destination_location is null or t.current_location is null);
