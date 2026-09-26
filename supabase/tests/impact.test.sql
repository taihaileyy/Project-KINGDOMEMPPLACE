-- Public impact numbers: hidden until switched on, small totals suppressed,
-- and visitors can't read the settings table.

create or replace function pg_temp.act_as(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_user::text, ''), true);
  if p_user is null then execute 'set local role anon'; else execute 'set local role authenticated'; end if;
end $$;

create or replace function pg_temp.assert(ok boolean, msg text) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'FAILED: %', msg; end if;
end $$;

-- Nothing is public by default.
begin;
select pg_temp.act_as(null);
select pg_temp.assert((select count(*) from public.public_impact()) = 0, 'no metric is public until switched on');
do $$ begin
  perform 1 from public.impact_metrics;
  raise exception 'FAILED: anon could read impact_metrics';
exception when insufficient_privilege then null;
end $$;
rollback;

-- Switched on with fewer than 5 people: the number is withheld.
begin;
delete from public.people;
insert into public.people (first_name) values ('A'), ('B');
update public.impact_metrics set is_public = true where key = 'people_served';
select pg_temp.act_as(null);
select pg_temp.assert(
  (select value is null from public.public_impact() where key = 'people_served'),
  'a total under 5 is withheld');
rollback;

-- Switched on with 5 or more: the total shows, and only switched-on metrics appear.
begin;
insert into public.people (first_name) select 'Guest ' || g from generate_series(1, 5) g;
update public.impact_metrics set is_public = true where key = 'people_served';
select set_config('test.expected', (select count(*) from public.people where merged_into_id is null)::text, true);
select pg_temp.act_as(null);
select pg_temp.assert(
  (select value from public.public_impact() where key = 'people_served') = current_setting('test.expected')::int,
  'people served counts every unmerged person');
select pg_temp.assert((select count(*) from public.public_impact()) = 1, 'only switched-on metrics are returned');
rollback;

-- Members can't switch metrics on; super admins can.
begin;
select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
update public.impact_metrics set is_public = true where key = 'people_served';
reset role;
select pg_temp.assert(
  not (select is_public from public.impact_metrics where key = 'people_served'),
  'a member cannot switch a metric on');
select pg_temp.act_as('10000000-0000-0000-0000-000000000001');
update public.impact_metrics set is_public = true where key = 'people_served';
reset role;
select pg_temp.assert(
  (select is_public from public.impact_metrics where key = 'people_served'),
  'a super admin can switch a metric on');
rollback;
