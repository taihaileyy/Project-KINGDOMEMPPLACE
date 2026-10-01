-- Studio booking requests. Anyone can ask for a time, signed in or not; every
-- request starts pending and staff approve it (the full calendar, blocks and
-- double-booking guard arrive with the studio module).

create type public.studio_request_status as enum ('pending', 'approved', 'declined', 'cancelled');

create table public.studio_requests (
  id               uuid primary key default gen_random_uuid(),
  person_id        uuid references public.people (id) on delete set null,
  name             text not null check (char_length(name) between 1 and 120),
  email            extensions.citext not null check (char_length(email) between 3 and 320),
  phone            text check (char_length(phone) <= 40),
  service          text not null check (service in ('recording', 'filming', 'podcast', 'photography', 'other')),
  preferred_date   date not null,
  start_time       time not null,
  duration_minutes int not null check (duration_minutes between 30 and 480),
  attendees        int not null default 1 check (attendees between 1 and 50),
  details          text check (char_length(details) <= 2000),
  status           public.studio_request_status not null default 'pending',
  decided_by       uuid references public.people (id),
  decided_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index studio_requests_date_idx on public.studio_requests (preferred_date);
create index studio_requests_status_idx on public.studio_requests (status) where status = 'pending';
create index studio_requests_person_idx on public.studio_requests (person_id) where person_id is not null;
create index studio_requests_decided_by_idx on public.studio_requests (decided_by) where decided_by is not null;

create trigger studio_requests_touch before update on public.studio_requests
  for each row execute function public.touch_updated_at();
create trigger studio_requests_audit after insert or update or delete on public.studio_requests
  for each row execute function public.audit_row();

-- Studio staff: super admins, or program staff given the 'studio' scope.
create function public.is_studio_staff()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_role_assignments a
    where a.person_id = public.auth_person_id()
      and a.revoked_at is null
      and (a.role = 'super_admin' or (a.role = 'program_staff' and a.scope = 'studio'))
  )
$$;
revoke execute on function public.is_studio_staff() from public, anon;
grant execute on function public.is_studio_staff() to authenticated;

alter table public.studio_requests enable row level security;

create policy studio_requests_select_own on public.studio_requests
  for select to authenticated
  using (person_id = (select public.auth_person_id()));

create policy studio_requests_select_staff on public.studio_requests
  for select to authenticated
  using ((select public.is_studio_staff()));

create policy studio_requests_update_staff on public.studio_requests
  for update to authenticated
  using ((select public.is_studio_staff()))
  with check ((select public.is_studio_staff()));

revoke all on public.studio_requests from anon;
revoke insert, delete, update on public.studio_requests from authenticated;
grant update (status, decided_by, decided_at) on public.studio_requests to authenticated;

-- The only way to create a request. Signed-in people are linked to their
-- profile; guests' requests keep the contact details they entered.
create function public.request_studio_booking(
  p_name text,
  p_email text,
  p_phone text,
  p_service text,
  p_date date,
  p_start time,
  p_minutes int,
  p_attendees int,
  p_details text
)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_today date := (now() at time zone 'America/Chicago')::date;
begin
  if p_date < v_today or p_date > v_today + 365 then
    raise exception 'Choose a date between today and one year from now.' using errcode = '22023';
  end if;
  -- A light brake on spam: at most 5 open requests per email address.
  if (select count(*) from public.studio_requests
      where email = p_email::extensions.citext and status = 'pending') >= 5 then
    raise exception 'You already have several requests waiting. We''ll be in touch soon.' using errcode = '22023';
  end if;

  insert into public.studio_requests
    (person_id, name, email, phone, service, preferred_date, start_time, duration_minutes, attendees, details)
  values
    (public.auth_person_id(), trim(p_name), lower(trim(p_email)), nullif(trim(p_phone), ''), p_service,
     p_date, p_start, p_minutes, coalesce(p_attendees, 1), nullif(trim(p_details), ''))
  returning id into v_id;
  return v_id;
end $$;

revoke execute on function public.request_studio_booking(text, text, text, text, date, time, int, int, text) from public;
grant execute on function public.request_studio_booking(text, text, text, text, date, time, int, int, text) to anon, authenticated;
