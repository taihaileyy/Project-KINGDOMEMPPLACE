-- Studio requests and giving: who can create, see and change what.

create or replace function pg_temp.act_as(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_user::text, ''), true);
  if p_user is null then execute 'set local role anon'; else execute 'set local role authenticated'; end if;
end $$;

create or replace function pg_temp.assert(ok boolean, msg text) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'FAILED: %', msg; end if;
end $$;

-- Users from identity.test.sql: ...0001 super admin, ...0002 member, ...0004 housing staff.

-- ── Studio ────────────────────────────────────────────────────────────────
begin;
-- A guest can request a time but can't read any requests back.
select pg_temp.act_as(null);
select public.request_studio_booking('Gina Guest', 'gina@example.com', '555-0199', 'recording',
  (now() at time zone 'America/Chicago')::date + 7, '14:00', 120, 2, 'Recording a demo.');
do $$ begin
  perform 1 from public.studio_requests;
  raise exception 'FAILED: anon could read studio requests';
exception when insufficient_privilege then null;
end $$;
do $$ begin
  -- Bookings are judged by Baton Rouge's date, not the server's UTC date.
  perform public.request_studio_booking('Gina', 'gina@example.com', null, 'recording',
    (now() at time zone 'America/Chicago')::date - 1, '14:00', 60, 1, null);
  raise exception 'FAILED: a past date was accepted';
exception when invalid_parameter_value then null;
end $$;

-- A signed-in member's request is linked to them, and they see only their own.
select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
select public.request_studio_booking('Mo Member', 'member@example.com', null, 'podcast',
  (now() at time zone 'America/Chicago')::date + 3, '10:00', 60, 1, null);
select pg_temp.assert((select count(*) from public.studio_requests) = 1, 'a member sees only their own request');
select pg_temp.assert((select person_id from public.studio_requests) = public.auth_person_id(), 'member request is linked to them');
update public.studio_requests set status = 'approved';
select pg_temp.assert((select status from public.studio_requests) = 'pending', 'a member cannot approve their own request');

-- Housing staff aren't studio staff; the super admin sees and approves all.
select pg_temp.act_as('10000000-0000-0000-0000-000000000004');
select pg_temp.assert((select count(*) from public.studio_requests) = 0, 'housing staff do not see studio requests');
select pg_temp.act_as('10000000-0000-0000-0000-000000000001');
select pg_temp.assert((select count(*) from public.studio_requests) = 2, 'super admin sees every request');
update public.studio_requests set status = 'approved' where email = 'gina@example.com';
select pg_temp.assert((select status from public.studio_requests where email = 'gina@example.com') = 'approved', 'super admin can approve');
rollback;

-- ── Giving ────────────────────────────────────────────────────────────────
begin;
-- Visitors can see the funds but can't record a gift themselves.
select pg_temp.act_as(null);
select pg_temp.assert((select count(*) from public.funds) = 4, 'visitors see the four funds');
do $$ begin
  perform public.record_online_gift('pi_x', 'tithe', 5000, 'one_time', 'card', 'x@example.com', 'X', null, null);
  raise exception 'FAILED: anon could record a gift';
exception when insufficient_privilege then null;
end $$;
reset role;

-- The webhook (service role) records a guest gift and a member's gift.
set local role service_role;
select public.record_online_gift('pi_guest', 'tithe', 5000, 'one_time', 'card', 'newgiver@example.com', 'Nia Giver', null, null);
select public.record_online_gift('pi_guest', 'tithe', 5000, 'one_time', 'card', 'newgiver@example.com', 'Nia Giver', null, null);
select public.record_online_gift('in_member', 'offering', 2500, 'recurring', 'card', 'member@example.com', 'Mo Member',
  (select id from public.people where auth_user_id = '10000000-0000-0000-0000-000000000002'), 'sub_1');
reset role;
select pg_temp.assert((select count(*) from public.gifts where stripe_ref = 'pi_guest') = 1, 'a repeated webhook does not double-record');
select pg_temp.assert(
  (select p.auth_user_id is null and p.first_name = 'Nia' and p.last_name = 'Giver'
   from public.gifts g join public.people p on p.id = g.person_id where g.stripe_ref = 'pi_guest'),
  'a guest gift gets a guest profile');

-- Members see only their own gifts; housing staff see none; finance sees all.
select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
select pg_temp.assert((select count(*) from public.gifts) = 1, 'a member sees only their own gifts');
do $$ begin
  insert into public.gifts (fund_id, amount_cents, method) select id, 100, 'cash' from public.funds limit 1;
  raise exception 'FAILED: a member could insert a gift';
exception when insufficient_privilege then null;
end $$;
select pg_temp.act_as('10000000-0000-0000-0000-000000000004');
select pg_temp.assert((select count(*) from public.gifts) = 0, 'housing staff cannot see giving');
select pg_temp.act_as('10000000-0000-0000-0000-000000000001');
select pg_temp.assert((select count(*) from public.gifts) = 2, 'finance (super admin) sees all gifts');
insert into public.gifts (fund_id, amount_cents, method) select id, 2000, 'cash' from public.funds where slug = 'offering';
reset role;

-- The guest signs up and verifies the same email: their gift moves into the account.
insert into auth.users (id, email, email_confirmed_at) values ('10000000-0000-0000-0000-00000000000a', 'newgiver@example.com', now());
select pg_temp.act_as('10000000-0000-0000-0000-00000000000a');
select pg_temp.assert((select count(*) from public.gifts) = 1, 'guest gifts appear in the new account');
rollback;
