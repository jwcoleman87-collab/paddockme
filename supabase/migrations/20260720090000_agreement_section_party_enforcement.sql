-- Party-attribution enforcement for agreement sections (audit fix P2).
--
-- RLS already restricts agreement_sections updates to the two agreement
-- parties, but nothing stopped one party from setting the OTHER party's
-- agree tick or editing the other party's section value with a crafted
-- request. This trigger enforces, in the database:
--   * only a party to the parent agreement may update a section;
--   * a caller may only set the counterparty's agree tick FALSE (the
--     existing "any edit withdraws both ticks" behaviour), never TRUE;
--   * a caller may only edit their own farmer_*_value.
-- Service-role/system contexts (auth.uid() is null) are unaffected.
-- This is additive: no existing policy is dropped or weakened.

create or replace function public.enforce_agreement_section_party()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ag record;
  caller uuid := auth.uid();
begin
  if caller is null then
    return new; -- service role / migrations / server jobs
  end if;

  select livestock_owner_id, landowner_id
    into ag
    from public.agreements
   where id = new.agreement_id;

  if ag is null then
    raise exception 'agreement % not found', new.agreement_id;
  end if;

  if caller <> ag.livestock_owner_id and caller <> ag.landowner_id then
    raise exception 'not a party to this agreement';
  end if;

  -- Agree ticks: only the owning party may raise their own flag.
  if new.agreed_by_a is distinct from old.agreed_by_a
     and new.agreed_by_a is true
     and caller <> ag.livestock_owner_id then
    raise exception 'cannot agree on behalf of the livestock owner';
  end if;

  if new.agreed_by_b is distinct from old.agreed_by_b
     and new.agreed_by_b is true
     and caller <> ag.landowner_id then
    raise exception 'cannot agree on behalf of the landowner';
  end if;

  -- Section values: each party may only edit their own side.
  if new.farmer_a_value is distinct from old.farmer_a_value
     and caller <> ag.livestock_owner_id then
    raise exception 'cannot edit the livestock owner''s section value';
  end if;

  if new.farmer_b_value is distinct from old.farmer_b_value
     and caller <> ag.landowner_id then
    raise exception 'cannot edit the landowner''s section value';
  end if;

  return new;
end;
$$;

drop trigger if exists agreement_sections_party_enforcement
  on public.agreement_sections;

create trigger agreement_sections_party_enforcement
  before update on public.agreement_sections
  for each row
  execute function public.enforce_agreement_section_party();
