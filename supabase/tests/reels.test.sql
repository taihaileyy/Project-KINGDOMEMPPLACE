-- Reels: counts are public; liking/commenting needs an account; staff moderate.
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
create temp table _m as select id from public.media_items where source = 'youtube' limit 1;
grant select on _m to anon, authenticated;

-- A visitor sees zero counts and can't like or comment.
select pg_temp.act_as(null);
select pg_temp.assert((select likes from public.media_social(array[(select id from _m)])) = 0, 'no likes yet');
do $$ begin
  perform public.toggle_media_like((select id from _m));
  raise exception 'FAILED: a visitor liked';
exception when insufficient_privilege then null;
end $$;
do $$ begin
  perform public.add_media_comment((select id from _m), 'hi');
  raise exception 'FAILED: a visitor commented';
exception when insufficient_privilege then null;
end $$;
do $$ begin
  perform 1 from public.media_comments;
  raise exception 'FAILED: a visitor read the comments table';
exception when insufficient_privilege then null;
end $$;

-- A member likes (and unlikes), and comments.
select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
select pg_temp.assert((public.toggle_media_like((select id from _m)) ->> 'liked')::boolean, 'liked');
select pg_temp.assert((select liked and likes = 1 from public.media_social(array[(select id from _m)])), 'the member sees their like');
select public.add_media_comment((select id from _m), '  Great word!  ');
select pg_temp.assert((select count(*) from public.media_comments_for((select id from _m))) = 1, 'comment shows');
select pg_temp.assert((select mine from public.media_comments_for((select id from _m))), 'it is theirs');
select pg_temp.assert((select author from public.media_comments_for((select id from _m))) not like '%@%', 'only a first name and initial is shown');
do $$ begin
  perform public.add_media_comment((select id from _m), repeat('x', 501));
  raise exception 'FAILED: an over-long comment was accepted';
exception when invalid_parameter_value then null;
end $$;
-- Rate limit: five a minute.
do $$ declare i int; begin
  for i in 1..5 loop perform public.add_media_comment((select id from _m), 'spam ' || i); end loop;
  raise exception 'FAILED: no rate limit';
exception when program_limit_exceeded then null;
end $$;
select pg_temp.assert((public.toggle_media_like((select id from _m)) ->> 'liked')::boolean = false, 'unliked');

-- Visitors see the count, not who.
select pg_temp.act_as(null);
select pg_temp.assert((select comments from public.media_social(array[(select id from _m)])) >= 1, 'visitors see the comment count');
select pg_temp.assert(not (select bool_or(mine) from public.media_comments_for((select id from _m))), 'visitors own none');

-- Staff hide a comment, and it disappears.
select pg_temp.act_as('10000000-0000-0000-0000-000000000001');
update public.media_comments set status = 'hidden' where body = 'Great word!';
select pg_temp.act_as(null);
select pg_temp.assert((select count(*) from public.media_comments_for((select id from _m)) where body = 'Great word!') = 0, 'hidden comments are not shown');
rollback;
