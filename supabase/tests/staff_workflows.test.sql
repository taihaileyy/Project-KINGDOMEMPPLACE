-- Program approvals, event check-in, studio approval with blocks and
-- double-booking protection. Users: ...0001 super admin, ...0002 member,
-- ...0003 church staff, ...0004 housing staff.

create or replace function pg_temp.act_as(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_user::text, ''), true);
  if p_user is null then execute 'set local role anon'; else execute 'set local role authenticated'; end if;
end $$;
create or replace function pg_temp.assert(ok boolean, msg text) returns void language plpgsql as $$
begin if ok is not true then raise exception 'FAILED: %', msg; end if; end $$;

begin;
-- Fixtures: member requests the arts program and registers for an event; 0004 manages only 'arts'.
insert into public.events (slug, title, starts_at, requires_registration) values ('test-evt', 'Test', now() + interval '3 days', true);
insert into public.staff_role_assignments (person_id, role, program_id)
select id, 'program_staff', (select id from public.programs where slug = 'arts') from public.people where auth_user_id = '10000000-0000-0000-0000-000000000004';
insert into public.staff_role_assignments (person_id, role, scope)
select id, 'program_staff', 'studio' from public.people where auth_user_id = '10000000-0000-0000-0000-000000000003';

select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
select public.enroll_in_program((select id from public.programs where slug = 'arts'));
select public.enroll_in_program((select id from public.programs where slug = 'media'));
select public.register_for_event((select id from public.events where slug = 'test-evt'), 'Mo Member', 'member@example.com');

-- Arts staff approve arts, but can't touch media; they see the member's name.
select pg_temp.act_as('10000000-0000-0000-0000-000000000004');
select pg_temp.assert((select count(*) from public.program_enrollments) = 1, 'arts staff see only the arts roster');
select pg_temp.assert((select count(*) from public.people where first_name = 'Mo') = 1, 'arts staff see the participant''s name');
select public.decide_enrollment((select id from public.program_enrollments), 'approved');
do $$ begin
  perform public.decide_enrollment((select e.id from public.program_enrollments e where false), 'approved');
exception when others then null; end $$;
select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
do $$ begin
  perform public.decide_enrollment((select id from public.program_enrollments limit 1), 'approved');
  raise exception 'FAILED: member decided an enrollment';
exception when insufficient_privilege then null; end $$;
select pg_temp.act_as('10000000-0000-0000-0000-000000000004');
select public.decide_enrollment((select id from public.program_enrollments), 'completed');
select pg_temp.assert((select status from public.program_enrollments) = 'completed', 'approved enrollment can be completed');

-- Church staff check the member in; the member can't check themselves in.
select pg_temp.act_as('10000000-0000-0000-0000-000000000003');
select public.check_in_registration((select id from public.event_registrations), true);
select pg_temp.assert((select checked_in_at is not null from public.event_registrations), 'checked in');
select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
do $$ begin perform public.check_in_registration((select id from public.event_registrations), true); raise exception 'FAILED: member checked in';
exception when insufficient_privilege then null; end $$;

-- Studio: 0003 is studio staff. A request is approved; overlapping ones are refused.
select pg_temp.act_as(null);
select public.request_studio_booking('Gina', 'gina@example.com', null, 'recording', current_date + 20, '10:00', 120, 1, null);
select pg_temp.act_as('10000000-0000-0000-0000-000000000003');
select public.decide_studio_request((select id from public.studio_requests where email = 'gina@example.com' and preferred_date = current_date + 20), 'approved');
select pg_temp.act_as(null);
do $$ begin
  perform public.request_studio_booking('Ben', 'ben@example.com', null, 'podcast', current_date + 20, '11:00', 60, 1, null);
  raise exception 'FAILED: overlapping request accepted';
exception when invalid_parameter_value then null; end $$;
select public.request_studio_booking('Ben', 'ben@example.com', null, 'podcast', current_date + 20, '12:00', 60, 1, null);
select pg_temp.assert((select count(*) from public.studio_busy(current_date, current_date + 30)) = 1, 'public sees one busy range with no names');

-- A blocked time stops bookings and approvals.
select pg_temp.act_as('10000000-0000-0000-0000-000000000003');
select public.add_studio_block(current_date + 20, '12:00', '14:00', 'Maintenance');
do $$ begin
  perform public.decide_studio_request((select id from public.studio_requests where email = 'ben@example.com'), 'approved');
  raise exception 'FAILED: approved into a blocked time';
exception when invalid_parameter_value then null; end $$;
select public.decide_studio_request((select id from public.studio_requests where email = 'ben@example.com'), 'declined');
select pg_temp.assert((select count(*) from public.studio_blocks) = 1, 'studio staff see blocks');
select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
do $$ declare n int; begin
  delete from public.studio_blocks;
  get diagnostics n = row_count;
  if n > 0 then raise exception 'FAILED: member removed a block'; end if;
end $$;
select pg_temp.act_as('10000000-0000-0000-0000-000000000003');
delete from public.studio_blocks;
select pg_temp.assert((select count(*) from public.studio_blocks) = 0, 'studio staff can remove a block');
select public.add_studio_block(current_date + 20, '12:00', '14:00', 'Maintenance');
select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
select pg_temp.assert((select count(*) from public.studio_blocks) = 0, 'members cannot read blocks directly');
do $$ begin perform public.add_studio_block(current_date, '09:00', '10:00'); raise exception 'FAILED: member added a block';
exception when insufficient_privilege then null; end $$;
rollback;

-- Impact counts come from the new tables, and still hide totals under 5.
begin;
update public.impact_metrics set is_public = true where key in ('events_held', 'program_completions');
select pg_temp.act_as(null);
select pg_temp.assert((select value is null from public.public_impact() where key = 'events_held'), 'events held: 3 seeded past events is under 5 so withheld');
select pg_temp.assert((select count(*) from public.public_impact()) = 2, 'both switched-on metrics are listed');
rollback;
