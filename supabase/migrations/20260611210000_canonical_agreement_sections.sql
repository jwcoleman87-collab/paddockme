-- Canonical agreement sections from the June 2026 master spec.
--
-- The agreement workspace must negotiate exactly:
-- stock type, duration, rate, start date, transport, special conditions.
-- Older workspaces used generic parties/paddock/dates/terms sections; this
-- migration self-heals them into the production contract shape.

with agreement_context as (
  select
    a.id as agreement_id,
    a.start_date,
    a.duration_months,
    a.rate_per_head_week,
    a.transport_required,
    r.stock_type,
    r.breed,
    r.head_count,
    r.duration as request_duration,
    p.title as paddock_title,
    p.rate_per_head_week as listing_rate,
  p.address as paddock_address
  from public.agreements a
  join public.matches m on m.id = a.match_id
  join public.agistment_requests r on r.id = m.request_id
  join public.paddocks p on p.id = m.paddock_id
),
legacy_sections as (
  select
    agreement_id,
    (array_agg(farmer_a_value) filter (where section_key = 'stock'))[1] as stock_a,
    (array_agg(farmer_b_value) filter (where section_key = 'stock'))[1] as stock_b,
    (array_agg(farmer_a_value) filter (where section_key = 'dates'))[1] as duration_a,
    (array_agg(farmer_b_value) filter (where section_key = 'dates'))[1] as duration_b,
    (array_agg(farmer_a_value) filter (where section_key = 'terms'))[1] as rate_a,
    (array_agg(farmer_b_value) filter (where section_key = 'terms'))[1] as rate_b,
    (array_agg(farmer_a_value) filter (where section_key = 'transport'))[1] as transport_a,
    (array_agg(farmer_b_value) filter (where section_key = 'transport'))[1] as transport_b,
    (array_agg(farmer_a_value) filter (where section_key = 'paddock'))[1] as special_a,
    (array_agg(farmer_b_value) filter (where section_key = 'paddock'))[1] as special_b
  from public.agreement_sections
  group by agreement_id
),
canonical as (
  select
    agreement_id,
    section_key,
    label,
    farmer_a_value,
    farmer_b_value,
    sort_order
  from agreement_context
  left join legacy_sections using (agreement_id)
  cross join lateral (
    values
      (
        'stock_type',
        'Stock type',
        coalesce(stock_a, jsonb_build_object('value', trim(concat(head_count::text, ' ', coalesce(breed, ''), ' ', stock_type)))),
        coalesce(stock_b, jsonb_build_object('value', trim(concat(head_count::text, ' ', stock_type)))),
        1
      ),
      (
        'duration',
        'Duration',
        coalesce(duration_a, jsonb_build_object('value', request_duration)),
        coalesce(duration_b, jsonb_build_object('value', coalesce(duration_months::text || ' months', request_duration))),
        2
      ),
      (
        'rate',
        'Rate',
        coalesce(rate_a, jsonb_build_object('value', coalesce('$' || coalesce(rate_per_head_week, listing_rate)::text || '/head/week', 'Discuss rate'))),
        coalesce(rate_b, jsonb_build_object('value', coalesce('$' || coalesce(listing_rate, rate_per_head_week)::text || '/head/week', 'Discuss rate'))),
        3
      ),
      (
        'start_date',
        'Start date',
        jsonb_build_object('value', coalesce(start_date::text, 'Start date to confirm')),
        jsonb_build_object('value', coalesce(start_date::text, 'Start date to confirm')),
        4
      ),
      (
        'transport',
        'Transport',
        coalesce(transport_a, jsonb_build_object('value', case when transport_required then 'Transport required' else 'No transport required' end)),
        coalesce(transport_b, jsonb_build_object('value', case when transport_required then 'Pickup and delivery to confirm' else 'No transport required' end)),
        5
      ),
      (
        'special_conditions',
        'Special conditions',
        coalesce(special_a, jsonb_build_object('value', 'No special conditions recorded yet')),
        coalesce(special_b, jsonb_build_object('value', coalesce('Paddock: ' || paddock_title || coalesce(', ' || paddock_address, ''), 'No special conditions recorded yet'))),
        6
      )
  ) as v(section_key, label, farmer_a_value, farmer_b_value, sort_order)
)
insert into public.agreement_sections (
  agreement_id,
  section_key,
  label,
  farmer_a_value,
  farmer_b_value,
  agreed_by_a,
  agreed_by_b,
  status,
  sort_order
)
select
  agreement_id,
  section_key,
  label,
  farmer_a_value,
  farmer_b_value,
  farmer_a_value = farmer_b_value,
  farmer_a_value = farmer_b_value,
  case when farmer_a_value = farmer_b_value then 'agreed' else 'needs_attention' end,
  sort_order
from canonical
on conflict (agreement_id, section_key) do update
set
  label = excluded.label,
  sort_order = excluded.sort_order,
  updated_at = now();

update public.messages
set section_id = case
  when section_id = 'stock' then 'stock_type'
  when section_id = 'dates' then 'duration'
  when section_id = 'terms' then 'rate'
  when section_id = 'paddock' then 'special_conditions'
  else section_id
end
where section_id in ('stock', 'dates', 'terms', 'paddock');

update public.agreement_artefacts
set section_key = case
  when section_key = 'stock' then 'stock_type'
  when section_key = 'dates' then 'duration'
  when section_key = 'terms' then 'rate'
  when section_key = 'paddock' then 'special_conditions'
  else section_key
end
where section_key in ('stock', 'dates', 'terms', 'paddock');

delete from public.agreement_sections
where section_key not in (
  'stock_type',
  'duration',
  'rate',
  'start_date',
  'transport',
  'special_conditions'
);
