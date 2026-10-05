-- Granting and removing staff roles, and closing an account.
-- Users: ...0001 super admin, ...0002 member, ...0003 church staff, ...0004 housing staff.

create or replace function pg_temp.act_as(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_user::text, ''), true);
  if p_user is null then execute 'set local role anon'; else execute 'set local role authenticated'; end if;
end $$;
create or replace function pg_temp.assert(ok boolean, msg text) returns void language plpgsql as $$
begin if ok is not true then raise exception 'FAILED: %', msg; end if; end $$;

begin;
-- Only a super admin can grant, revoke or delete.
select pg_temp.act_as('10000000-0000-0000-0000-000000000003');
do $$ begin perform public.grant_staff_role((select id from public.people where auth_user_id = '10000000-0000-0000-0000-000000000002'), 'church_staff'); raise exception 'FAILED: church staff granted a role';
exception when insufficient_privilege then null; end $$;
do $$ begin perform public.delete_person_account((select id from public.people where auth_user_id = '10000000-0000-0000-0000-000000000002')); raise exception 'FAILED: church staff deleted an account';
exception when insufficient_privilege then null; end $$;

-- The super admin makes the member a housing admin, then takes it away.
select pg_temp.act_as('10000000-0000-0000-0000-000000000001');
select public.grant_staff_role((select id from public.people where auth_user_id = '10000000-0000-0000-0000-000000000002'), 'housing_staff');
do $$ begin perform public.grant_staff_role((select id from public.people where auth_user_id = '10000000-0000-0000-0000-000000000002'), 'housing_staff'); raise exception 'FAILED: duplicate role granted';
exception when invalid_parameter_value then null; end $$;
do $$ begin perform public.grant_staff_role((select id from public.people where email = 'dana@example.com' and auth_user_id is null limit 1), 'church_staff'); raise exception 'FAILED: role given to someone with no account';
exception when invalid_parameter_value then null; end $$;
select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
select pg_temp.assert(public.has_role('housing_staff'), 'the new role works right away');
select pg_temp.act_as('10000000-0000-0000-0000-000000000001');
select public.revoke_staff_role((select a.id from public.staff_role_assignments a join public.people p on p.id = a.person_id where p.auth_user_id = '10000000-0000-0000-0000-000000000002' and a.role = 'housing_staff' and a.revoked_at is null));
select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
select pg_temp.assert(not public.has_role('housing_staff'), 'a removed role stops working');

-- The last super admin can't be removed.
select pg_temp.act_as('10000000-0000-0000-0000-000000000001');
do $$ begin
  perform public.revoke_staff_role((select a.id from public.staff_role_assignments a join public.people p on p.id = a.person_id where p.auth_user_id = '10000000-0000-0000-0000-000000000001' and a.role = 'super_admin' and a.revoked_at is null));
  raise exception 'FAILED: removed the last super admin';
exception when invalid_parameter_value then null; end $$;

-- Closing an account: login gone, details wiped, gift record kept.
reset role;
insert into public.gifts (person_id, fund_id, amount_cents, method, donor_name, donor_email)
select p.id, (select id from public.funds limit 1), 5000, 'cash', 'Mo Member', 'member@example.com' from public.people p where p.auth_user_id = '10000000-0000-0000-0000-000000000002';
select pg_temp.act_as('10000000-0000-0000-0000-000000000001');
do $$ begin perform public.delete_person_account(public.auth_person_id()); raise exception 'FAILED: deleted own account';
exception when invalid_parameter_value then null; end $$;
select public.delete_person_account((select id from public.people where auth_user_id = '10000000-0000-0000-0000-000000000002'));
reset role;
select pg_temp.assert(not exists (select 1 from auth.users where id = '10000000-0000-0000-0000-000000000002'), 'the login is gone');
select pg_temp.assert((select count(*) from public.people where first_name = 'Deleted' and last_name = 'account' and deleted_at is not null and email is null and auth_user_id is null) = 1, 'the profile is wiped');
select pg_temp.assert((select count(*) from public.gifts where amount_cents = 5000 and donor_name is null and donor_email is null) = 1, 'the gift is kept without the giver''s details');

-- Someone living at the house can't be deleted until they move out.
insert into public.housing_residencies (person_id, move_in_date) select id, current_date from public.people where auth_user_id = '10000000-0000-0000-0000-000000000004';
select pg_temp.act_as('10000000-0000-0000-0000-000000000001');
do $$ begin perform public.delete_person_account((select id from public.people where auth_user_id = '10000000-0000-0000-0000-000000000004')); raise exception 'FAILED: deleted an active resident';
exception when invalid_parameter_value then null; end $$;
rollback;
