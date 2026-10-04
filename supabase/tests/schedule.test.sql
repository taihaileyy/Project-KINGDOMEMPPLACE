-- Schedule: everyone reads it; only church staff change it.
create or replace function pg_temp.act_as(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_user::text, ''), true);
  if p_user is null then execute 'set local role anon'; else execute 'set local role authenticated'; end if;
end $$;
create or replace function pg_temp.assert(ok boolean, msg text) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'FAILED: %', msg; end if;
end $$;

begin;
select pg_temp.act_as(null);
select pg_temp.assert((select count(*) from public.schedule_items) = 2, 'visitors see the two seeded items');
select pg_temp.assert((select start_time from public.schedule_items where kind = 'bible_study') = '18:30', 'Bible Study is at 6:30 PM');
select pg_temp.assert((select weekday from public.schedule_items where kind = 'bible_study') = 3, 'Bible Study is on Wednesday');
select pg_temp.assert((select frequency from public.schedule_items where kind = 'worship') = 'varies' and (select start_time from public.schedule_items where kind = 'worship') is null, 'worship starts with no fixed time');
do $$ declare n int; begin
  update public.schedule_items set title = 'Hacked';
  get diagnostics n = row_count;
  if n > 0 then raise exception 'FAILED: a visitor edited the schedule'; end if;
end $$;

select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
do $$ declare n int; begin
  update public.schedule_items set title = 'Hacked';
  get diagnostics n = row_count;
  if n > 0 then raise exception 'FAILED: a member edited the schedule'; end if;
end $$;

select pg_temp.act_as('10000000-0000-0000-0000-000000000001');
update public.schedule_items set start_time = '10:00', frequency = 'weekly', weekday = 0 where kind = 'worship';
select pg_temp.assert((select start_time from public.schedule_items where kind = 'worship') = '10:00', 'staff can set a worship time');
update public.schedule_items set is_active = false where kind = 'worship';
select pg_temp.act_as(null);
select pg_temp.assert((select count(*) from public.schedule_items) = 1, 'inactive items are hidden from visitors');
rollback;
