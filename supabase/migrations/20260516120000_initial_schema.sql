-- PaddockME - initial database schema
--
-- Creates the five core tables matching src/lib/types/database.ts:
--   profiles, paddocks, agistment_requests, matches, agreements.
--
-- Foreign-key relationships are wired here. Row-level security is
-- enabled on every public table; the policies themselves land in
-- 20260516120100_rls_policies.sql so this file can be re-applied
-- safely against a fresh project without policy clashes.
--
-- All statements use CREATE TABLE IF NOT EXISTS / CREATE INDEX IF
-- NOT EXISTS so the migration is idempotent against a database
-- that already has some of the schema applied.

create extension if not exists "uuid-ossp" with schema extensions;


-- profiles ------------------------------------------------------------------
-- Mirrors auth.users via id, plus PaddockME-specific identity and
-- verification fields. Created on signup via a trigger (defined below).

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  abn text,
  abn_verified boolean default false,
  id_verified boolean default false,
  property_verified boolean default false,
  account_types text[] not null default array[]::text[],
  regions text[] not null default array[]::text[],
  stock_types text[] not null default array[]::text[],
  rating numeric,
  successful_matches integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;


-- paddocks ------------------------------------------------------------------

create table if not exists public.paddocks (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  region text not null,
  state text not null,
  acres numeric not null,
  capacity_head integer,
  capacity_stock_type text,
  pasture_type text,
  water_type text[] not null default array[]::text[],
  shelter boolean default false,
  yards boolean default false,
  loading_ramp boolean default false,
  available_from date,
  min_duration_months integer,
  rate_per_head_week numeric,
  photos text[] not null default array[]::text[],
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists paddocks_owner_id_idx on public.paddocks(owner_id);
create index if not exists paddocks_region_idx on public.paddocks(region);
create index if not exists paddocks_status_idx on public.paddocks(status);

alter table public.paddocks enable row level security;


-- agistment_requests --------------------------------------------------------

create table if not exists public.agistment_requests (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  stock_type text not null,
  breed text,
  head_count integer not null,
  duration text not null,
  preferred_regions text[] not null default array[]::text[],
  urgency text,
  required_pasture text,
  required_water boolean default false,
  required_shelter boolean default false,
  required_yards boolean default false,
  required_ramp boolean default false,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agistment_requests_requester_id_idx
  on public.agistment_requests(requester_id);
create index if not exists agistment_requests_status_idx
  on public.agistment_requests(status);

alter table public.agistment_requests enable row level security;


-- matches -------------------------------------------------------------------

create table if not exists public.matches (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null references public.agistment_requests(id) on delete cascade,
  paddock_id uuid not null references public.paddocks(id) on delete cascade,
  match_score numeric not null,
  match_reasons jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create unique index if not exists matches_request_paddock_idx
  on public.matches(request_id, paddock_id);
create index if not exists matches_request_id_idx on public.matches(request_id);
create index if not exists matches_paddock_id_idx on public.matches(paddock_id);

alter table public.matches enable row level security;


-- agreements ----------------------------------------------------------------

create table if not exists public.agreements (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references public.matches(id) on delete cascade,
  livestock_owner_id uuid not null references public.profiles(id) on delete cascade,
  landowner_id uuid not null references public.profiles(id) on delete cascade,
  head_count integer,
  duration_months integer,
  start_date date,
  rate_per_head_week numeric,
  transport_required boolean default false,
  alignment_state jsonb,
  status text not null default 'Draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agreements_livestock_owner_idx
  on public.agreements(livestock_owner_id);
create index if not exists agreements_landowner_idx
  on public.agreements(landowner_id);
create index if not exists agreements_match_idx on public.agreements(match_id);
create index if not exists agreements_status_idx on public.agreements(status);

alter table public.agreements enable row level security;


-- updated_at trigger function -----------------------------------------------
-- One shared trigger function bumps updated_at on every row mutation
-- across the four tables that carry it.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists paddocks_set_updated_at on public.paddocks;
create trigger paddocks_set_updated_at
  before update on public.paddocks
  for each row execute function public.set_updated_at();

drop trigger if exists agistment_requests_set_updated_at on public.agistment_requests;
create trigger agistment_requests_set_updated_at
  before update on public.agistment_requests
  for each row execute function public.set_updated_at();

drop trigger if exists agreements_set_updated_at on public.agreements;
create trigger agreements_set_updated_at
  before update on public.agreements
  for each row execute function public.set_updated_at();


-- auth.users -> profiles trigger -------------------------------------------
-- Create a public.profiles row automatically whenever a new
-- auth.users entry shows up. full_name and phone are populated from
-- raw_user_meta_data if the signup flow set them.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    coalesce(new.phone, null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
