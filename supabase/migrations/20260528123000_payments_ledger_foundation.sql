-- PaddockME - payments ledger foundation (Milestone 1)
--
-- This creates the provider-independent accounting spine for payments.
-- No Stripe, escrow, payout, refund, or dispute automation is implied here.
-- The app can record what is owed, by whom, to whom, for which workflow,
-- before any real payment rail is connected.


-- payables ------------------------------------------------------------------

create table if not exists public.payables (
  id uuid primary key default extensions.uuid_generate_v4(),
  agreement_id uuid references public.agreements(id) on delete cascade,
  transport_job_id uuid references public.transport_jobs(id) on delete cascade,
  accepted_quote_id uuid references public.transport_quotes(id) on delete set null,
  payer_profile_id uuid not null references public.profiles(id) on delete cascade,
  payee_profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (
    kind in ('transport', 'agistment', 'deposit', 'bond', 'platform_fee')
  ),
  status text not null default 'draft' check (
    status in (
      'draft',
      'awaiting_payment',
      'payment_recorded',
      'ready_to_release',
      'released',
      'refunded',
      'disputed',
      'cancelled'
    )
  ),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'AUD',
  due_at timestamptz,
  description text not null,
  provider text,
  provider_payment_id text,
  provider_checkout_session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payables_distinct_parties check (payer_profile_id <> payee_profile_id),
  constraint payables_has_workflow_context check (
    agreement_id is not null or transport_job_id is not null
  ),
  constraint payables_transport_context check (
    kind <> 'transport'
    or (transport_job_id is not null and accepted_quote_id is not null)
  )
);

create index if not exists payables_agreement_idx
  on public.payables(agreement_id);
create index if not exists payables_transport_job_idx
  on public.payables(transport_job_id);
create index if not exists payables_payer_idx
  on public.payables(payer_profile_id);
create index if not exists payables_payee_idx
  on public.payables(payee_profile_id);
create index if not exists payables_status_idx
  on public.payables(status);
create unique index if not exists payables_accepted_quote_unique_idx
  on public.payables(accepted_quote_id)
  where accepted_quote_id is not null;

alter table public.payables enable row level security;

drop trigger if exists payables_set_updated_at on public.payables;
create trigger payables_set_updated_at
  before update on public.payables
  for each row execute function public.set_updated_at();

create or replace function public.validate_transport_payable()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  quote_row record;
begin
  if new.kind <> 'transport' then
    return new;
  end if;

  select
    q.transport_job_id,
    q.status,
    t.livestock_owner_id,
    t.driver_id
  into quote_row
  from public.transport_quotes q
  join public.transport_jobs t on t.id = q.transport_job_id
  where q.id = new.accepted_quote_id;

  if not found then
    raise exception 'Transport payable requires an existing accepted quote';
  end if;

  if quote_row.transport_job_id is distinct from new.transport_job_id then
    raise exception 'Transport payable quote must belong to the payable transport job';
  end if;

  if quote_row.status <> 'accepted' then
    raise exception 'Transport payable quote must be accepted';
  end if;

  if quote_row.livestock_owner_id is distinct from new.payer_profile_id then
    raise exception 'Transport payable payer must be the livestock owner';
  end if;

  if quote_row.driver_id is distinct from new.payee_profile_id then
    raise exception 'Transport payable payee must be the driver';
  end if;

  return new;
end;
$$;

drop trigger if exists payables_validate_transport on public.payables;
create trigger payables_validate_transport
  before insert or update of kind, transport_job_id, accepted_quote_id, payer_profile_id, payee_profile_id
  on public.payables
  for each row execute function public.validate_transport_payable();


-- payment_events ------------------------------------------------------------

create table if not exists public.payment_events (
  id uuid primary key default extensions.uuid_generate_v4(),
  payable_id uuid not null references public.payables(id) on delete cascade,
  event_type text not null,
  from_status text,
  to_status text,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  provider text,
  provider_event_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists payment_events_payable_idx
  on public.payment_events(payable_id, created_at);
create index if not exists payment_events_type_idx
  on public.payment_events(event_type);
create unique index if not exists payment_events_provider_event_unique_idx
  on public.payment_events(provider, provider_event_id)
  where provider is not null and provider_event_id is not null;

alter table public.payment_events enable row level security;


-- payables policies ---------------------------------------------------------
-- Transport commercial privacy mirrors transport_quotes:
-- livestock owner and driver see transport payables; the landowner does not.
-- Future agistment payables use explicit payer/payee ids so the two financial
-- parties can see their own records without opening the whole agreement table.

drop policy if exists "Payables: read for payer or payee" on public.payables;
create policy "Payables: read for payer or payee"
  on public.payables
  for select
  using (
    auth.uid() = payer_profile_id
    or auth.uid() = payee_profile_id
  );

-- Payables are written by server-side code or trusted jobs. Service-role
-- calls bypass RLS, so users do not receive broad insert/update policies here.


-- payment_events policies ---------------------------------------------------

drop policy if exists "Payment events: read through payable" on public.payment_events;
create policy "Payment events: read through payable"
  on public.payment_events
  for select
  using (
    exists (
      select 1
      from public.payables p
      where p.id = payment_events.payable_id
        and (p.payer_profile_id = auth.uid() or p.payee_profile_id = auth.uid())
    )
  );

-- Payment events are append-only from trusted server-side code/webhooks.
