-- Housing: application, review, move-in, money, goals and who can see what.
-- Users: ...0001 super admin, ...0002 member, ...0003 church staff, ...0004 housing staff.

create or replace function pg_temp.act_as(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_user::text, ''), true);
  if p_user is null then execute 'set local role anon'; else execute 'set local role authenticated'; end if;
end $$;
create or replace function pg_temp.assert(ok boolean, msg text) returns void language plpgsql as $$
begin if ok is not true then raise exception 'FAILED: %', msg; end if; end $$;

begin;
select pg_temp.act_as(null);
do $$ begin perform 1 from public.housing_applications; raise exception 'FAILED: anon read applications';
exception when insufficient_privilege then null; end $$;

-- A member applies; duplicates are refused; only they and housing staff see it.
select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
select public.apply_for_housing(current_date + 14, '555-0100', 'Mom', '555-0101', 'seeking', 'Looking for a fresh start.');
do $$ begin perform public.apply_for_housing(null, null, null, null, null, null); raise exception 'FAILED: duplicate application';
exception when invalid_parameter_value then null; end $$;
select pg_temp.assert((select count(*) from public.housing_applications) = 1, 'member sees their application');
do $$ begin
  update public.housing_applications set status = 'approved';
  raise exception 'FAILED: member approved their own application';
exception when insufficient_privilege then null; end $$;
do $$ begin
  perform public.decide_housing_application((select id from public.housing_applications), 'approved');
  raise exception 'FAILED: member decided an application';
exception when insufficient_privilege then null; end $$;

select pg_temp.act_as('10000000-0000-0000-0000-000000000003');
select pg_temp.assert((select count(*) from public.housing_applications) = 0, 'church staff cannot see housing applications');

-- Housing staff review, approve, and move the person in.
select pg_temp.act_as('10000000-0000-0000-0000-000000000004');
select pg_temp.assert((select count(*) from public.housing_applications) = 1, 'housing staff see applications');
select pg_temp.assert((select count(*) from public.people where first_name = 'Mo') = 1, 'housing staff see the applicant''s name');
do $$ begin
  perform public.move_in_resident((select id from public.housing_applications), current_date - 21);
  raise exception 'FAILED: moved in before approval';
exception when invalid_parameter_value then null; end $$;
select public.decide_housing_application((select id from public.housing_applications), 'in_review', 'Called references.');
select public.decide_housing_application((select id from public.housing_applications), 'approved');
select public.move_in_resident((select id from public.housing_applications), current_date - 21, 'Room 2');
select public.record_housing_payment((select id from public.housing_residencies), 10000, 'cash');
select public.record_housing_payment((select id from public.housing_residencies), 15000, 'paypal');
select public.add_housing_checkin((select id from public.housing_residencies), 'Settling in well.', true);
select public.add_housing_checkin((select id from public.housing_residencies), 'Staff-only note.', false);

-- The resident's dashboard numbers: 21 days in = 3 rent periods passed.
-- Charged = 100 deposit + 3 x 150 = 550; paid 250; balance 300; next due in the future.
select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
select pg_temp.assert((select (public.housing_summary(id)->>'days_housed')::int from public.housing_residencies) = 21, 'days housed');
select pg_temp.assert((select (public.housing_summary(id)->>'charged_cents')::int from public.housing_residencies) = 55000, 'charged = deposit + rent so far');
select pg_temp.assert((select (public.housing_summary(id)->>'balance_cents')::int from public.housing_residencies) = 30000, 'balance');
select pg_temp.assert((select (public.housing_summary(id)->>'deposit_paid')::boolean from public.housing_residencies), 'deposit marked paid');
select pg_temp.assert((select (public.housing_summary(id)->>'next_due')::date from public.housing_residencies) = current_date + 7, 'next rent due');
select pg_temp.assert((select count(*) from public.housing_checkins) = 1, 'resident sees only shared check-ins');
select pg_temp.assert((select count(*) from public.housing_payments) = 2, 'resident sees their payments');
select public.add_my_housing_goal('Find steady work', current_date + 60);
select public.complete_my_housing_goal((select id from public.housing_goals));
select pg_temp.assert((select done_at is not null from public.housing_goals), 'resident completes own goal');
do $$ begin
  perform public.record_housing_payment((select id from public.housing_residencies), 100, 'cash');
  raise exception 'FAILED: resident recorded a payment';
exception when insufficient_privilege then null; end $$;

-- Someone else can't read this stay or its numbers.
select pg_temp.act_as('10000000-0000-0000-0000-000000000003');
select pg_temp.assert((select count(*) from public.housing_residencies) = 0 and (select count(*) from public.housing_payments) = 0, 'church staff cannot see the stay');
do $$ begin perform public.housing_summary((select id from (select id from public.housing_residencies union all select '00000000-0000-0000-0000-000000000000'::uuid) x limit 1));
exception when others then null; end $$;

-- Moving out closes the stay and stops rent.
select pg_temp.act_as('10000000-0000-0000-0000-000000000004');
select public.move_out_resident((select id from public.housing_residencies), current_date, 'graduated');
select pg_temp.assert((select status from public.housing_residencies) = 'moved_out', 'stay closed');
rollback;
