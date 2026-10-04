-- Media library: everyone watches; only media staff change it.
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
select pg_temp.assert((select count(*) from public.media_items) = 6, 'visitors see the six starting videos');
select pg_temp.assert((select count(*) from public.media_items where 'shorts' = any (collections)) = 2, 'two are in the short-form feed');
select pg_temp.assert((select orientation from public.media_items where source = 'youtube') = 'landscape', 'the YouTube talk is landscape');
do $$ begin
  insert into public.media_items (source, url, title) values ('external', 'https://example.com/v.mp4', 'x');
  raise exception 'FAILED: a visitor added media';
exception when insufficient_privilege then null;
end $$;

select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
do $$ declare n int; begin
  update public.media_items set title = 'Hacked';
  get diagnostics n = row_count;
  if n > 0 then raise exception 'FAILED: a member edited media'; end if;
end $$;

select pg_temp.act_as('10000000-0000-0000-0000-000000000001');
insert into public.media_items (source, url, title, collections) values ('upload', 'https://example.com/a.mp4', 'Staff upload', '{program:arts}');
update public.media_items set is_active = false where title = 'Staff upload';
select pg_temp.act_as(null);
select pg_temp.assert((select count(*) from public.media_items) = 6, 'inactive media is hidden from visitors');
rollback;
