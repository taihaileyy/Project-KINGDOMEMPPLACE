-- Video and audio library. Staff add items (a YouTube or Facebook link, any web
-- address, or an uploaded file) and tag where they appear: the Watch & Listen
-- page, the short-form feed, featured spots, a program, an event. Pages read
-- this table, so new media never needs a code change.

-- Staff who manage media: super admins, church staff and program staff.
create function public.is_media_staff()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_role_assignments a
    where a.person_id = public.auth_person_id()
      and a.revoked_at is null
      and a.role in ('super_admin', 'church_staff', 'program_staff')
  )
$$;
revoke execute on function public.is_media_staff() from public, anon;
grant execute on function public.is_media_staff() to authenticated;

create table public.media_items (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null default 'video' check (kind in ('video', 'audio')),
  source       text not null check (source in ('youtube', 'facebook', 'upload', 'external')),
  url          text not null check (char_length(url) between 8 and 1000),   -- the link people can open
  embed_url    text check (char_length(embed_url) <= 1000),                 -- what is embedded, when it differs
  title        text not null check (char_length(title) between 1 and 160),
  description  text check (char_length(description) <= 1000),
  orientation  text not null default 'landscape' check (orientation in ('landscape', 'vertical')),
  poster_url   text check (char_length(poster_url) <= 1000),
  transcript   text check (char_length(transcript) <= 60000),
  captions_url text check (char_length(captions_url) <= 1000),
  -- 'featured', 'shorts', 'watch', 'program:<slug>', 'event:<slug>'
  collections  text[] not null default '{}',
  sort_order   int not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index media_items_order_idx on public.media_items (sort_order, created_at desc) where is_active;
create index media_items_collections_idx on public.media_items using gin (collections);

create trigger media_items_touch before update on public.media_items for each row execute function public.touch_updated_at();
create trigger media_items_audit after insert or update or delete on public.media_items for each row execute function public.audit_row();

alter table public.media_items enable row level security;
create policy media_items_read on public.media_items for select to anon, authenticated using (is_active);
create policy media_items_staff on public.media_items for all to authenticated
  using ((select public.is_media_staff())) with check ((select public.is_media_staff()));
grant select on public.media_items to anon;

-- Starting items. The Facebook titles are placeholders: staff rename them in Admin > Videos.
insert into public.media_items (kind, source, url, embed_url, title, description, orientation, poster_url, collections, sort_order) values
  ('video', 'youtube', 'https://youtu.be/y-isPvY6nz0', 'https://www.youtube-nocookie.com/embed/y-isPvY6nz0',
   '"Clap Back" Talk About It', 'A "Talk About It" conversation from Kingdom Empowerment Place.', 'landscape', '/images/video-clap-back.webp', '{featured,watch}', 10),
  ('video', 'facebook', 'https://www.facebook.com/share/r/1HhdNKY9BR/', 'https://www.facebook.com/reel/27499046749690380',
   'From the KEP community: reel 1', 'A short video shared on Facebook.', 'vertical', null, '{shorts,watch}', 20),
  ('video', 'facebook', 'https://www.facebook.com/share/r/1CPZ2KN6ML/', 'https://www.facebook.com/reel/27499284186333303',
   'From the KEP community: reel 2', 'A short video shared on Facebook.', 'vertical', null, '{shorts,watch}', 30),
  ('video', 'facebook', 'https://www.facebook.com/share/v/19Kdufwig8/', 'https://www.facebook.com/100001051554400/videos/27645461251738888',
   'From the KEP community: video 1', 'A video shared on Facebook.', 'landscape', null, '{watch}', 40),
  ('video', 'facebook', 'https://www.facebook.com/share/p/17jBrWjvX6/', 'https://www.facebook.com/100064806697738/posts/1558108739692668',
   'From the KEP community: post', 'A post shared on Facebook.', 'landscape', null, '{watch}', 50),
  ('video', 'facebook', 'https://www.facebook.com/share/v/1Jk6XpWvZq/', 'https://www.facebook.com/100000139273526/videos/29015612861359971',
   'From the KEP community: video 2', 'A video shared on Facebook.', 'landscape', null, '{watch}', 60);

-- Files uploaded by staff (up to 50 MB; longer videos should be linked instead).
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('site-media', 'site-media', true, 52428800,
            array['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'text/vtt'])
    on conflict (id) do nothing;
    execute $p$create policy site_media_staff_insert on storage.objects for insert to authenticated
      with check (bucket_id = 'site-media' and (select public.is_media_staff()))$p$;
    execute $p$create policy site_media_staff_update on storage.objects for update to authenticated
      using (bucket_id = 'site-media' and (select public.is_media_staff()))$p$;
    execute $p$create policy site_media_staff_delete on storage.objects for delete to authenticated
      using (bucket_id = 'site-media' and (select public.is_media_staff()))$p$;
  end if;
end $$;
