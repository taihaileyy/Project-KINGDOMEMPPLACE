-- Likes and comments on library videos (the Watch reels). Reading counts is
-- open to everyone; liking and commenting need a KEP account. People are only
-- ever shown as first name + last initial. Staff can hide or delete comments.

create table public.media_likes (
  media_id   uuid not null references public.media_items (id) on delete cascade,
  person_id  uuid not null references public.people (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (media_id, person_id)
);
create index media_likes_person_idx on public.media_likes (person_id);

create table public.media_comments (
  id         uuid primary key default gen_random_uuid(),
  media_id   uuid not null references public.media_items (id) on delete cascade,
  person_id  uuid not null references public.people (id) on delete cascade,
  body       text not null check (char_length(btrim(body)) between 1 and 500),
  status     text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now()
);
create index media_comments_media_idx on public.media_comments (media_id, created_at desc);
create index media_comments_person_idx on public.media_comments (person_id, created_at desc);

create trigger media_comments_audit after insert or update or delete on public.media_comments
  for each row execute function public.audit_row();

alter table public.media_likes enable row level security;
alter table public.media_comments enable row level security;
revoke all on public.media_likes, public.media_comments from anon, authenticated;
-- Everything players do goes through the functions below. Staff moderate directly.
create policy media_comments_staff on public.media_comments for all to authenticated
  using ((select public.is_media_staff())) with check ((select public.is_media_staff()));
grant select, update, delete on public.media_comments to authenticated;

-- Counts for a set of videos, and whether the signed-in viewer has liked each.
create function public.media_social(p_ids uuid[])
returns table (media_id uuid, likes int, comments int, liked boolean)
language sql stable security definer
set search_path = ''
as $$
  select i.id,
    (select count(*) from public.media_likes l where l.media_id = i.id)::int,
    (select count(*) from public.media_comments c where c.media_id = i.id and c.status = 'visible')::int,
    exists (select 1 from public.media_likes l where l.media_id = i.id and l.person_id = public.auth_person_id())
  from public.media_items i
  where i.id = any (p_ids) and i.is_active
$$;

create function public.toggle_media_like(p_media uuid)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_me uuid := public.auth_person_id();
  v_removed int;
begin
  if v_me is null then raise exception 'sign in to like' using errcode = '28000'; end if;
  if not exists (select 1 from public.media_items where id = p_media and is_active) then
    raise exception 'unknown video' using errcode = '22023';
  end if;
  with d as (delete from public.media_likes where media_id = p_media and person_id = v_me returning 1)
  select count(*) into v_removed from d;
  if v_removed = 0 then
    insert into public.media_likes (media_id, person_id) values (p_media, v_me);
  end if;
  return jsonb_build_object('liked', v_removed = 0, 'likes', (select count(*) from public.media_likes where media_id = p_media));
end $$;

-- Visible comments, newest first, with a first-name-and-initial author.
create function public.media_comments_for(p_media uuid)
returns table (id uuid, body text, created_at timestamptz, author text, mine boolean)
language sql stable security definer
set search_path = ''
as $$
  select c.id, c.body, c.created_at,
    coalesce(nullif(btrim(coalesce(p.preferred_name, p.first_name, '')), ''), 'KEP member')
      || case when nullif(btrim(coalesce(p.last_name, '')), '') is not null then ' ' || upper(left(btrim(p.last_name), 1)) || '.' else '' end,
    coalesce(c.person_id = public.auth_person_id(), false)
  from public.media_comments c
  join public.people p on p.id = c.person_id
  join public.media_items m on m.id = c.media_id and m.is_active
  where c.media_id = p_media and c.status = 'visible'
  order by c.created_at desc
  limit 100
$$;

create function public.add_media_comment(p_media uuid, p_body text)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_me uuid := public.auth_person_id();
  v_body text := btrim(coalesce(p_body, ''));
  v_id uuid;
begin
  if v_me is null then raise exception 'sign in to comment' using errcode = '28000'; end if;
  if char_length(v_body) not between 1 and 500 then raise exception 'comments are 1 to 500 characters' using errcode = '22023'; end if;
  if not exists (select 1 from public.media_items where id = p_media and is_active) then
    raise exception 'unknown video' using errcode = '22023';
  end if;
  if (select count(*) from public.media_comments where person_id = v_me and created_at > now() - interval '1 minute') >= 5
     or (select count(*) from public.media_comments where person_id = v_me and created_at > now() - interval '1 day') >= 60 then
    raise exception 'too many comments, please wait a moment' using errcode = '54000';
  end if;
  insert into public.media_comments (media_id, person_id, body) values (p_media, v_me, v_body) returning id into v_id;
  return v_id;
end $$;

create function public.delete_media_comment(p_id uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  delete from public.media_comments where id = p_id and (person_id = public.auth_person_id() or public.is_media_staff());
end $$;

revoke execute on function public.media_social(uuid[]), public.media_comments_for(uuid) from public;
revoke execute on function public.toggle_media_like(uuid), public.add_media_comment(uuid, text), public.delete_media_comment(uuid) from public, anon;
grant execute on function public.media_social(uuid[]), public.media_comments_for(uuid) to anon, authenticated;
grant execute on function public.toggle_media_like(uuid), public.add_media_comment(uuid, text), public.delete_media_comment(uuid) to authenticated;
