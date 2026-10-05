-- Membership, programs, enrollments, events and registrations: who can see and
-- do what. Users from identity.test.sql: ...0001 super admin, ...0002 member,
-- ...0003 church staff, ...0004 housing staff.

create or replace function pg_temp.act_as(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_user::text, ''), true);
  if p_user is null then execute 'set local role anon'; else execute 'set local role authenticated'; end if;
end $$;
create or replace function pg_temp.assert(ok boolean, msg text) returns void language plpgsql as $$
begin if ok is not true then raise exception 'FAILED: %', msg; end if; end $$;

begin;
-- Fixture: one upcoming event that needs registration and has 3 spots.
insert into public.events (slug, title, starts_at, requires_registration, capacity)
values ('test-future', 'Test Future Event', now() + interval '10 days', true, 3);

-- Anyone can read active programs and published events, nothing else here.
select pg_temp.act_as(null);
select pg_temp.assert((select count(*) from public.programs) = 5, 'public sees the seeded programs');
select pg_temp.assert((select count(*) from public.events) = 4, 'public sees the events');
do $$ begin perform 1 from public.program_enrollments; raise exception 'FAILED: anon read enrollments';
exception when insufficient_privilege then null; end $$;
do $$ begin perform public.join_church(); raise exception 'FAILED: anon joined the church';
exception when insufficient_privilege or invalid_authorization_specification then null; end $$;

-- A guest registers for the event (no account).
select public.register_for_event((select id from public.events where slug = 'test-future'), 'Gus Guest', 'gus@example.com', null, 1);
do $$ begin
  perform public.register_for_event((select id from public.events where slug = 'test-future'), 'Gus Again', 'GUS@example.com', null, 0);
  raise exception 'FAILED: same email registered twice';
exception when invalid_parameter_value then null; end $$;
do $$ begin
  perform public.register_for_event((select id from public.events where slug = 'test-future'), 'Big Group', 'big@example.com', null, 5);
  raise exception 'FAILED: over capacity accepted';
exception when invalid_parameter_value then null; end $$;
do $$ begin
  perform public.register_for_event((select id from public.events where slug = 'the-gathering'), 'Late', 'late@example.com', null, 0);
  raise exception 'FAILED: registered for a past event';
exception when invalid_parameter_value then null; end $$;
do $$ begin perform 1 from public.event_registrations; raise exception 'FAILED: anon read registrations';
exception when insufficient_privilege then null; end $$;

-- A member joins the church, a program and the event.
select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
select public.join_church();
select pg_temp.assert((select count(*) from public.church_memberships) = 1, 'member sees own membership');
select pg_temp.assert(public.enroll_in_program((select id from public.programs where slug = 'youth-mentorship')) = 'pending', 'approval program starts pending');
select pg_temp.assert(public.enroll_in_program((select id from public.programs where slug = 'computer-lab')) = 'approved', 'open program approves straight away');
do $$ begin
  perform public.enroll_in_program((select id from public.programs where slug = 'computer-lab'));
  raise exception 'FAILED: double enrollment allowed';
exception when invalid_parameter_value then null; end $$;
select pg_temp.assert((select count(*) from public.program_enrollments) = 2, 'member sees own enrollments');
do $$ begin
  update public.program_enrollments set status = 'approved';
  raise exception 'FAILED: member changed an enrollment directly';
exception when insufficient_privilege then null; end $$;
select public.register_for_event((select id from public.events where slug = 'test-future'), 'Mo Member', 'member@example.com');
select pg_temp.assert((select count(*) from public.event_registrations) = 1, 'member sees only their own registration, not the guest''s');
select pg_temp.assert(public.event_taken_spots((select id from public.events where slug = 'test-future')) = 3, 'spots count people and guests');
select pg_temp.assert((select count(*) from public.my_activity(10)) >= 4, 'activity lists the member''s records');
select public.cancel_event_registration((select id from public.event_registrations));
select pg_temp.assert(public.event_taken_spots((select id from public.events where slug = 'test-future')) = 2, 'cancelling frees the spot');
select public.withdraw_enrollment((select id from public.program_enrollments e where status = 'pending'));
select pg_temp.assert((select count(*) from public.program_enrollments where status = 'withdrawn') = 1, 'member can withdraw');

-- Housing staff have no reach into any of it.
select pg_temp.act_as('10000000-0000-0000-0000-000000000004');
select pg_temp.assert((select count(*) from public.program_enrollments) = 0, 'housing staff cannot see enrollments');
select pg_temp.assert((select count(*) from public.event_registrations) = 0, 'housing staff cannot see registrations');
select pg_temp.assert((select count(*) from public.church_memberships) = 0, 'housing staff cannot see memberships');

-- Church staff see memberships and registrations; admins see enrollments.
select pg_temp.act_as('10000000-0000-0000-0000-000000000003');
select pg_temp.assert((select count(*) from public.church_memberships) = 1, 'church staff see memberships');
select pg_temp.assert((select count(*) from public.event_registrations) = 2, 'church staff see all registrations');
select pg_temp.act_as('10000000-0000-0000-0000-000000000001');
select pg_temp.assert((select count(*) from public.program_enrollments) = 2, 'super admin sees all enrollments');

-- A program-scoped staff member manages only their program.
reset role;
insert into public.staff_role_assignments (person_id, role, program_id)
select id, 'program_staff', (select id from public.programs where slug = 'arts')
from public.people where auth_user_id = '10000000-0000-0000-0000-000000000004';
select pg_temp.act_as('10000000-0000-0000-0000-000000000004');
select pg_temp.assert(public.can_manage_program((select id from public.programs where slug = 'arts')), 'arts staff manage arts');
select pg_temp.assert(not public.can_manage_program((select id from public.programs where slug = 'media')), 'arts staff do not manage media');
rollback;
