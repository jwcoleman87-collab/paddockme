-- PaddockME - MVP Build 02 Supabase foundation
--
-- Extends the existing schema toward the closed-loop MVP without replacing
-- the localStorage prototype path:
--   * section-level agreement persistence
--   * durable artefacts for agreement and transport rooms
--   * transport status event timeline
--   * transport job statuses aligned to the local MVP prototype
--
-- Privacy invariants:
--   * agreements and agreement_sections remain visible only to Farmer A/B
--   * drivers can see available/assigned transport jobs
--   * drivers never get agreement rows or private agistment pricing


-- transport_jobs status alignment ------------------------------------------

alter table public.transport_jobs
  alter column status set default 'available';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transport_jobs_status_mvp_check'
  ) then
    alter table public.transport_jobs
      add constraint transport_jobs_status_mvp_check
      check (
        status in (
          'available',
          'accepted',
          'loading',
          'in_transit',
          'arrived',
          'completed',
          'cancelled',
          'Booked',
          'Loading',
          'In Transit',
          'Arrived'
        )
      ) not valid;
  end if;
end $$;


-- agreement_sections --------------------------------------------------------

create table if not exists public.agreement_sections (
  id uuid primary key default uuid_generate_v4(),
  agreement_id uuid not null references public.agreements(id) on delete cascade,
  section_key text not null,
  label text not null,
  farmer_a_value jsonb not null default '{}'::jsonb,
  farmer_b_value jsonb not null default '{}'::jsonb,
  agreed_by_a boolean not null default false,
  agreed_by_b boolean not null default false,
  status text not null default 'pending' check (
    status in ('agreed', 'pending', 'needs_attention', 'intentionally_accepted')
  ),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agreement_id, section_key)
);

create index if not exists agreement_sections_agreement_idx
  on public.agreement_sections(agreement_id, sort_order);
create index if not exists agreement_sections_status_idx
  on public.agreement_sections(status);

alter table public.agreement_sections enable row level security;

drop trigger if exists agreement_sections_set_updated_at on public.agreement_sections;
create trigger agreement_sections_set_updated_at
  before update on public.agreement_sections
  for each row execute function public.set_updated_at();


-- agreement_artefacts -------------------------------------------------------

create table if not exists public.agreement_artefacts (
  id uuid primary key default uuid_generate_v4(),
  agreement_id uuid not null references public.agreements(id) on delete cascade,
  section_key text,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  kind text not null check (kind in ('photo', 'document', 'map')),
  description text,
  storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agreement_artefacts_agreement_idx
  on public.agreement_artefacts(agreement_id, created_at);
create index if not exists agreement_artefacts_uploader_idx
  on public.agreement_artefacts(uploaded_by);

alter table public.agreement_artefacts enable row level security;

drop trigger if exists agreement_artefacts_set_updated_at on public.agreement_artefacts;
create trigger agreement_artefacts_set_updated_at
  before update on public.agreement_artefacts
  for each row execute function public.set_updated_at();


-- transport_artefacts -------------------------------------------------------

create table if not exists public.transport_artefacts (
  id uuid primary key default uuid_generate_v4(),
  transport_job_id uuid not null references public.transport_jobs(id) on delete cascade,
  section_key text,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  kind text not null check (kind in ('photo', 'document', 'map')),
  description text,
  storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transport_artefacts_job_idx
  on public.transport_artefacts(transport_job_id, created_at);
create index if not exists transport_artefacts_uploader_idx
  on public.transport_artefacts(uploaded_by);

alter table public.transport_artefacts enable row level security;

drop trigger if exists transport_artefacts_set_updated_at on public.transport_artefacts;
create trigger transport_artefacts_set_updated_at
  before update on public.transport_artefacts
  for each row execute function public.set_updated_at();


-- transport_status_events ---------------------------------------------------

create table if not exists public.transport_status_events (
  id uuid primary key default uuid_generate_v4(),
  transport_job_id uuid not null references public.transport_jobs(id) on delete cascade,
  from_status text,
  to_status text not null check (
    to_status in (
      'available',
      'accepted',
      'loading',
      'in_transit',
      'arrived',
      'completed',
      'cancelled',
      'Booked',
      'Loading',
      'In Transit',
      'Arrived'
    )
  ),
  changed_by uuid not null references public.profiles(id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists transport_status_events_job_idx
  on public.transport_status_events(transport_job_id, created_at);
create index if not exists transport_status_events_changed_by_idx
  on public.transport_status_events(changed_by);

alter table public.transport_status_events enable row level security;


-- agreement_sections policies ----------------------------------------------

drop policy if exists "Agreement sections: read for agreement parties" on public.agreement_sections;
create policy "Agreement sections: read for agreement parties"
  on public.agreement_sections
  for select
  using (
    exists (
      select 1 from public.agreements a
      where a.id = agreement_sections.agreement_id
        and (a.livestock_owner_id = auth.uid() or a.landowner_id = auth.uid())
    )
  );

drop policy if exists "Agreement sections: insert for agreement parties" on public.agreement_sections;
create policy "Agreement sections: insert for agreement parties"
  on public.agreement_sections
  for insert
  with check (
    exists (
      select 1 from public.agreements a
      where a.id = agreement_sections.agreement_id
        and (a.livestock_owner_id = auth.uid() or a.landowner_id = auth.uid())
    )
  );

drop policy if exists "Agreement sections: update for agreement parties" on public.agreement_sections;
create policy "Agreement sections: update for agreement parties"
  on public.agreement_sections
  for update
  using (
    exists (
      select 1 from public.agreements a
      where a.id = agreement_sections.agreement_id
        and (a.livestock_owner_id = auth.uid() or a.landowner_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.agreements a
      where a.id = agreement_sections.agreement_id
        and (a.livestock_owner_id = auth.uid() or a.landowner_id = auth.uid())
    )
  );

drop policy if exists "Agreement sections: delete for agreement parties" on public.agreement_sections;
create policy "Agreement sections: delete for agreement parties"
  on public.agreement_sections
  for delete
  using (
    exists (
      select 1 from public.agreements a
      where a.id = agreement_sections.agreement_id
        and (a.livestock_owner_id = auth.uid() or a.landowner_id = auth.uid())
    )
  );


-- agreement_artefacts policies ---------------------------------------------

drop policy if exists "Agreement artefacts: read for agreement parties" on public.agreement_artefacts;
create policy "Agreement artefacts: read for agreement parties"
  on public.agreement_artefacts
  for select
  using (
    exists (
      select 1 from public.agreements a
      where a.id = agreement_artefacts.agreement_id
        and (a.livestock_owner_id = auth.uid() or a.landowner_id = auth.uid())
    )
  );

drop policy if exists "Agreement artefacts: insert as party uploader" on public.agreement_artefacts;
create policy "Agreement artefacts: insert as party uploader"
  on public.agreement_artefacts
  for insert
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.agreements a
      where a.id = agreement_artefacts.agreement_id
        and (a.livestock_owner_id = auth.uid() or a.landowner_id = auth.uid())
    )
  );

drop policy if exists "Agreement artefacts: update own party artefacts" on public.agreement_artefacts;
create policy "Agreement artefacts: update own party artefacts"
  on public.agreement_artefacts
  for update
  using (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.agreements a
      where a.id = agreement_artefacts.agreement_id
        and (a.livestock_owner_id = auth.uid() or a.landowner_id = auth.uid())
    )
  )
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.agreements a
      where a.id = agreement_artefacts.agreement_id
        and (a.livestock_owner_id = auth.uid() or a.landowner_id = auth.uid())
    )
  );

drop policy if exists "Agreement artefacts: delete own party artefacts" on public.agreement_artefacts;
create policy "Agreement artefacts: delete own party artefacts"
  on public.agreement_artefacts
  for delete
  using (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.agreements a
      where a.id = agreement_artefacts.agreement_id
        and (a.livestock_owner_id = auth.uid() or a.landowner_id = auth.uid())
    )
  );


-- transport_jobs policy refinement -----------------------------------------
-- Available jobs should be visible to authenticated drivers before driver_id
-- is assigned. Assigned jobs remain visible to all three parties.

drop policy if exists "Transport: read for parties" on public.transport_jobs;
create policy "Transport: read for parties"
  on public.transport_jobs
  for select
  using (
    status = 'available'
    or auth.uid() = livestock_owner_id
    or auth.uid() = landowner_id
    or auth.uid() = driver_id
  );


-- transport_artefacts policies ---------------------------------------------

drop policy if exists "Transport artefacts: read for transport parties" on public.transport_artefacts;
create policy "Transport artefacts: read for transport parties"
  on public.transport_artefacts
  for select
  using (
    exists (
      select 1 from public.transport_jobs t
      where t.id = transport_artefacts.transport_job_id
        and (
          t.livestock_owner_id = auth.uid()
          or t.landowner_id = auth.uid()
          or t.driver_id = auth.uid()
        )
    )
  );

drop policy if exists "Transport artefacts: insert as transport party uploader" on public.transport_artefacts;
create policy "Transport artefacts: insert as transport party uploader"
  on public.transport_artefacts
  for insert
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.transport_jobs t
      where t.id = transport_artefacts.transport_job_id
        and (
          t.livestock_owner_id = auth.uid()
          or t.landowner_id = auth.uid()
          or t.driver_id = auth.uid()
        )
    )
  );

drop policy if exists "Transport artefacts: update own transport artefacts" on public.transport_artefacts;
create policy "Transport artefacts: update own transport artefacts"
  on public.transport_artefacts
  for update
  using (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.transport_jobs t
      where t.id = transport_artefacts.transport_job_id
        and (
          t.livestock_owner_id = auth.uid()
          or t.landowner_id = auth.uid()
          or t.driver_id = auth.uid()
        )
    )
  )
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.transport_jobs t
      where t.id = transport_artefacts.transport_job_id
        and (
          t.livestock_owner_id = auth.uid()
          or t.landowner_id = auth.uid()
          or t.driver_id = auth.uid()
        )
    )
  );

drop policy if exists "Transport artefacts: delete own transport artefacts" on public.transport_artefacts;
create policy "Transport artefacts: delete own transport artefacts"
  on public.transport_artefacts
  for delete
  using (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.transport_jobs t
      where t.id = transport_artefacts.transport_job_id
        and (
          t.livestock_owner_id = auth.uid()
          or t.landowner_id = auth.uid()
          or t.driver_id = auth.uid()
        )
    )
  );


-- transport_status_events policies -----------------------------------------

drop policy if exists "Transport status events: read for transport parties" on public.transport_status_events;
create policy "Transport status events: read for transport parties"
  on public.transport_status_events
  for select
  using (
    exists (
      select 1 from public.transport_jobs t
      where t.id = transport_status_events.transport_job_id
        and (
          t.livestock_owner_id = auth.uid()
          or t.landowner_id = auth.uid()
          or t.driver_id = auth.uid()
        )
    )
  );

drop policy if exists "Transport status events: insert as transport party" on public.transport_status_events;
create policy "Transport status events: insert as transport party"
  on public.transport_status_events
  for insert
  with check (
    changed_by = auth.uid()
    and exists (
      select 1 from public.transport_jobs t
      where t.id = transport_status_events.transport_job_id
        and (
          t.livestock_owner_id = auth.uid()
          or t.landowner_id = auth.uid()
          or t.driver_id = auth.uid()
        )
    )
  );
