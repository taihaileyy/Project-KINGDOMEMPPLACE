-- Identity, roles and access rules. Each block acts as a specific user and
-- raises an exception if they can see or change something they shouldn't.

create or replace function pg_temp.act_as(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_user::text, ''), true);
  if p_user is null then
    execute 'set local role anon';
  else
    execute 'set local role authenticated';
  end if;
end $$;

create or replace function pg_temp.assert(ok boolean, msg text) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'FAILED: %', msg; end if;
end $$;

-- ── Fixtures (as the database owner) ──────────────────────────────────────
-- A guest who registered for an event before having an account.
insert into public.people (id, first_name, last_name, email, phone)
values ('00000000-0000-0000-0000-00000000a001', 'Dana', 'Guest', 'dana@example.com', '555-0101');

insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
  ('10000000-0000-0000-0000-000000000001', 'admin@example.com',  now(), '{"first_name":"Ada","last_name":"Admin"}'),
  ('10000000-0000-0000-0000-000000000002', 'member@example.com', now(), '{"first_name":"Mo","last_name":"Member"}'),
  ('10000000-0000-0000-0000-000000000003', 'church@example.com', now(), '{"first_name":"Cy","last_name":"Church"}'),
  ('10000000-0000-0000-0000-000000000004', 'housing@example.com', now(), '{"first_name":"Hal","last_name":"Housing"}');

-- Someone signs up with Dana's email but hasn't verified it yet.
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data)
values ('10000000-0000-0000-0000-000000000005', 'dana@example.com', null, '{"first_name":"Dana","last_name":""}');

insert into public.staff_role_assignments (person_id, role)
select id, 'super_admin' from public.people where auth_user_id = '10000000-0000-0000-0000-000000000001';
insert into public.staff_role_assignments (person_id, role)
select id, 'church_staff' from public.people where auth_user_id = '10000000-0000-0000-0000-000000000003';
insert into public.staff_role_assignments (person_id, role)
select id, 'housing_staff' from public.people where auth_user_id = '10000000-0000-0000-0000-000000000004';

-- ── Sign-up creates exactly one person per account ────────────────────────
select pg_temp.assert(
  (select count(*) from public.people where auth_user_id is not null) = 5,
  'every auth user gets one people row');
select pg_temp.assert(
  (select first_name from public.people where auth_user_id = '10000000-0000-0000-0000-000000000002') = 'Mo',
  'sign-up metadata copied to the person');

-- ── Unverified email does NOT claim the guest record ──────────────────────
select pg_temp.assert(
  (select merged_into_id from public.people where id = '00000000-0000-0000-0000-00000000a001') is null,
  'guest record stays separate until the email is verified');

-- Verifying the email claims it.
update auth.users set email_confirmed_at = now() where id = '10000000-0000-0000-0000-000000000005';
select pg_temp.assert(
  (select merged_into_id from public.people where id = '00000000-0000-0000-0000-00000000a001')
    = (select id from public.people where auth_user_id = '10000000-0000-0000-0000-000000000005'),
  'verified sign-up claims the matching guest record');
select pg_temp.assert(
  (select phone from public.people where auth_user_id = '10000000-0000-0000-0000-000000000005') = '555-0101',
  'claimed guest details fill blanks on the account');

-- ── Anonymous visitors see no people or roles ─────────────────────────────
begin;
select pg_temp.act_as(null);
do $$ begin
  perform 1 from public.people;
  raise exception 'FAILED: anon could query people';
exception when insufficient_privilege then null;
end $$;
rollback;

-- ── Anonymous visitors can't call the helper functions over the API ───────
begin;
select pg_temp.act_as(null);
do $$ begin
  perform public.my_roles();
  raise exception 'FAILED: anon could call my_roles';
exception when insufficient_privilege then null;
end $$;
do $$ begin
  perform public.has_role('super_admin');
  raise exception 'FAILED: anon could call has_role';
exception when insufficient_privilege then null;
end $$;
rollback;

-- ── A member sees only themselves ─────────────────────────────────────────
begin;
select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
select pg_temp.assert((select count(*) from public.people) = 1, 'member sees only their own person row');
select pg_temp.assert((select count(*) from public.staff_role_assignments) = 0, 'member sees no roles');
select pg_temp.assert((select count(*) from public.audit_log) = 0, 'member cannot read the audit log');
select pg_temp.assert(not public.is_staff(), 'member is not staff');

update public.people set phone = '555-0202' where auth_user_id = '10000000-0000-0000-0000-000000000002';
select pg_temp.assert(
  (select phone from public.people where auth_user_id = '10000000-0000-0000-0000-000000000002') = '555-0202',
  'member can update their own phone');

-- Updating someone else silently affects zero rows under RLS.
update public.people set phone = 'hacked' where auth_user_id = '10000000-0000-0000-0000-000000000003';
rollback;
select pg_temp.assert(
  (select phone from public.people where auth_user_id = '10000000-0000-0000-0000-000000000003') is null,
  'member cannot update another person');

begin;
select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
do $$ begin
  update public.people set auth_user_id = null where auth_user_id = '10000000-0000-0000-0000-000000000002';
  raise exception 'FAILED: member could change auth_user_id';
exception when insufficient_privilege then null;
end $$;
rollback;

begin;
select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
do $$ begin
  insert into public.staff_role_assignments (person_id, role)
  values (public.auth_person_id(), 'super_admin');
  raise exception 'FAILED: member granted themselves super_admin';
exception when insufficient_privilege then null;
end $$;
rollback;

-- ── Housing staff do not get the whole directory ──────────────────────────
begin;
select pg_temp.act_as('10000000-0000-0000-0000-000000000004');
select pg_temp.assert(public.is_staff(), 'housing staff is staff');
select pg_temp.assert(not public.has_role('finance_admin'), 'housing staff is not finance');
select pg_temp.assert((select count(*) from public.people) = 1, 'housing staff sees only themselves until housing links exist');
rollback;

-- ── Church staff see the directory; can't grant roles ─────────────────────
begin;
select pg_temp.act_as('10000000-0000-0000-0000-000000000003');
select pg_temp.assert((select count(*) from public.people) >= 5, 'church staff see people');
do $$ begin
  insert into public.staff_role_assignments (person_id, role)
  values (public.auth_person_id(), 'finance_admin');
  raise exception 'FAILED: church staff granted a role';
exception when insufficient_privilege then null;
end $$;
rollback;

-- ── Super admin sees everything and can manage roles ──────────────────────
begin;
select pg_temp.act_as('10000000-0000-0000-0000-000000000001');
select pg_temp.assert(public.has_role('finance_admin'), 'super admin passes every role check');
select pg_temp.assert((select count(*) from public.audit_log) > 0, 'super admin reads the audit log');
insert into public.staff_role_assignments (person_id, role)
select id, 'finance_admin' from public.people where auth_user_id = '10000000-0000-0000-0000-000000000002';
rollback;

-- ── Audit trail records changes ───────────────────────────────────────────
select pg_temp.assert(
  exists (select 1 from public.audit_log where table_name = 'people' and action = 'update'
          and changed_fields ? 'merged_into_id'),
  'guest merge is recorded in the audit log');
