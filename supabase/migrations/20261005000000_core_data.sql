-- Phase 2: the core data the portal is built on: church membership, programs
-- and enrollments, events and registrations. Everyone can read published
-- programs and events; people see only their own enrollments and
-- registrations; staff see what their role covers. Creating a row goes through
-- the functions below, never a direct insert.

-- ── Who can manage a program ──────────────────────────────────────────────
-- Super admins, and program staff whose assignment covers that program (an
-- assignment with a scope such as 'studio' or 'paradise' does not).
create function public.can_manage_program(p_program uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_role_assignments a
    where a.person_id = public.auth_person_id()
      and a.revoked_at is null
      and (a.role = 'super_admin'
           or (a.role = 'program_staff' and a.scope is null and (a.program_id is null or a.program_id = p_program)))
  )
$$;

-- Events are run by super admins, church staff and (unscoped) program staff.
create function public.can_manage_events()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_role_assignments a
    where a.person_id = public.auth_person_id()
      and a.revoked_at is null
      and (a.role in ('super_admin', 'church_staff') or (a.role = 'program_staff' and a.scope is null))
  )
$$;
revoke execute on function public.can_manage_program(uuid), public.can_manage_events() from public, anon;
grant execute on function public.can_manage_program(uuid), public.can_manage_events() to authenticated;

-- ── Church membership ─────────────────────────────────────────────────────
create table public.church_memberships (
  id         uuid primary key default gen_random_uuid(),
  person_id  uuid not null unique references public.people (id) on delete cascade,
  status     text not null default 'active' check (status in ('active', 'inactive')),
  joined_at  timestamptz not null default now(),
  ended_at   timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger church_memberships_touch before update on public.church_memberships
  for each row execute function public.touch_updated_at();
create trigger church_memberships_audit after insert or update or delete on public.church_memberships
  for each row execute function public.audit_row();

-- ── Programs ──────────────────────────────────────────────────────────────
create table public.programs (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9-]{1,60}$'),
  name              text not null check (char_length(name) between 1 and 120),
  summary           text not null default '' check (char_length(summary) <= 400),
  body              text[] not null default '{}',
  highlights        text[] not null default '{}',
  image_path        text check (char_length(image_path) <= 300),
  art               text check (art in ('arts')),
  category          text not null default 'general' check (category in ('youth', 'build', 'technology', 'general')),
  requires_approval boolean not null default true,
  capacity          int check (capacity is null or capacity > 0),
  is_active         boolean not null default true,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create trigger programs_touch before update on public.programs
  for each row execute function public.touch_updated_at();
create trigger programs_audit after insert or update or delete on public.programs
  for each row execute function public.audit_row();

alter table public.staff_role_assignments
  add constraint staff_role_assignments_program_fk foreign key (program_id) references public.programs (id) on delete cascade;
create index staff_role_assignments_program_idx on public.staff_role_assignments (program_id) where program_id is not null;

create type public.enrollment_status as enum ('pending', 'approved', 'declined', 'withdrawn', 'completed');

create table public.program_enrollments (
  id           uuid primary key default gen_random_uuid(),
  program_id   uuid not null references public.programs (id) on delete cascade,
  person_id    uuid not null references public.people (id) on delete cascade,
  status       public.enrollment_status not null default 'pending',
  note         text check (char_length(note) <= 1000),
  requested_at timestamptz not null default now(),
  decided_by   uuid references public.people (id),
  decided_at   timestamptz,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
-- One open request or active enrollment per person per program.
create unique index program_enrollments_open_key on public.program_enrollments (program_id, person_id)
  where status in ('pending', 'approved');
create index program_enrollments_person_idx on public.program_enrollments (person_id);
create index program_enrollments_program_idx on public.program_enrollments (program_id, status);
create index program_enrollments_decided_by_idx on public.program_enrollments (decided_by) where decided_by is not null;
create trigger program_enrollments_touch before update on public.program_enrollments
  for each row execute function public.touch_updated_at();
create trigger program_enrollments_audit after insert or update or delete on public.program_enrollments
  for each row execute function public.audit_row();

-- ── Events ────────────────────────────────────────────────────────────────
create table public.events (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique check (slug ~ '^[a-z0-9-]{1,80}$'),
  title                 text not null check (char_length(title) between 1 and 160),
  blurb                 text not null default '' check (char_length(blurb) <= 400),
  details               text check (char_length(details) <= 4000),
  starts_at             timestamptz not null,
  ends_at               timestamptz,
  location              text check (char_length(location) <= 200),
  image_path            text check (char_length(image_path) <= 300),
  program_id            uuid references public.programs (id) on delete set null,
  requires_registration boolean not null default false,
  capacity              int check (capacity is null or capacity > 0),
  is_published          boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);
create index events_starts_idx on public.events (starts_at desc) where is_published;
create index events_program_idx on public.events (program_id) where program_id is not null;
create trigger events_touch before update on public.events
  for each row execute function public.touch_updated_at();
create trigger events_audit after insert or update or delete on public.events
  for each row execute function public.audit_row();

create type public.registration_status as enum ('registered', 'cancelled');

create table public.event_registrations (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events (id) on delete cascade,
  person_id     uuid references public.people (id) on delete set null,
  name          text not null check (char_length(name) between 1 and 120),
  email         extensions.citext not null check (char_length(email) between 3 and 320),
  phone         text check (char_length(phone) <= 40),
  guests        int not null default 0 check (guests between 0 and 10),
  status        public.registration_status not null default 'registered',
  checked_in_at timestamptz,
  checked_in_by uuid references public.people (id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index event_registrations_person_key on public.event_registrations (event_id, person_id)
  where person_id is not null and status = 'registered';
create unique index event_registrations_email_key on public.event_registrations (event_id, email)
  where status = 'registered';
create index event_registrations_person_idx on public.event_registrations (person_id) where person_id is not null;
create index event_registrations_checked_in_by_idx on public.event_registrations (checked_in_by) where checked_in_by is not null;
create trigger event_registrations_touch before update on public.event_registrations
  for each row execute function public.touch_updated_at();
create trigger event_registrations_audit after insert or update or delete on public.event_registrations
  for each row execute function public.audit_row();

-- ── Access rules ──────────────────────────────────────────────────────────
alter table public.church_memberships enable row level security;
alter table public.programs enable row level security;
alter table public.program_enrollments enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;

create policy memberships_select_own on public.church_memberships for select to authenticated
  using (person_id = (select public.auth_person_id()));
create policy memberships_select_staff on public.church_memberships for select to authenticated
  using ((select public.has_role('church_staff')));
create policy memberships_update_staff on public.church_memberships for update to authenticated
  using ((select public.has_role('church_staff'))) with check ((select public.has_role('church_staff')));

create policy programs_select_public on public.programs for select to anon, authenticated using (is_active);
create policy programs_select_staff on public.programs for select to authenticated
  using ((select public.can_manage_program(id)));
create policy programs_write_admin on public.programs for all to authenticated
  using ((select public.has_role('super_admin'))) with check ((select public.has_role('super_admin')));

create policy enrollments_select_own on public.program_enrollments for select to authenticated
  using (person_id = (select public.auth_person_id()));
create policy enrollments_select_staff on public.program_enrollments for select to authenticated
  using ((select public.can_manage_program(program_id)));

create policy events_select_public on public.events for select to anon, authenticated using (is_published);
create policy events_select_staff on public.events for select to authenticated
  using ((select public.can_manage_events()));
create policy events_write_staff on public.events for all to authenticated
  using ((select public.can_manage_events())) with check ((select public.can_manage_events()));

create policy registrations_select_own on public.event_registrations for select to authenticated
  using (person_id = (select public.auth_person_id()));
create policy registrations_select_staff on public.event_registrations for select to authenticated
  using ((select public.can_manage_events()));
create policy registrations_update_staff on public.event_registrations for update to authenticated
  using ((select public.can_manage_events())) with check ((select public.can_manage_events()));

revoke all on public.church_memberships, public.programs, public.program_enrollments, public.events, public.event_registrations from anon;
grant select on public.programs, public.events to anon;
revoke insert, update, delete on public.church_memberships, public.program_enrollments, public.event_registrations from authenticated;
-- Staff change a membership's status, check people in, and edit events directly.
grant update (status, ended_at) on public.church_memberships to authenticated;
grant update (checked_in_at, checked_in_by, status) on public.event_registrations to authenticated;

-- ── Functions people call ─────────────────────────────────────────────────
create function public.join_church()
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_person uuid := public.auth_person_id();
  v_id uuid;
begin
  if v_person is null then raise exception 'Sign in to join the church.' using errcode = '28000'; end if;
  insert into public.church_memberships (person_id) values (v_person)
  on conflict (person_id) do update set status = 'active', ended_at = null
  returning id into v_id;
  return v_id;
end $$;

create function public.leave_church()
returns void
language sql security definer
set search_path = ''
as $$
  update public.church_memberships set status = 'inactive', ended_at = now()
  where person_id = public.auth_person_id() and status = 'active'
$$;

-- Asks to join a program. Open programs enroll straight away; the rest wait
-- for staff approval. Returns the resulting status.
create function public.enroll_in_program(p_program uuid, p_note text default null)
returns public.enrollment_status
language plpgsql security definer
set search_path = ''
as $$
declare
  v_person uuid := public.auth_person_id();
  v_prog public.programs;
  v_status public.enrollment_status;
begin
  if v_person is null then raise exception 'Sign in to join a program.' using errcode = '28000'; end if;
  select * into v_prog from public.programs where id = p_program and is_active;
  if not found then raise exception 'That program isn''t open.' using errcode = '22023'; end if;
  if exists (select 1 from public.program_enrollments
             where program_id = p_program and person_id = v_person and status in ('pending', 'approved')) then
    raise exception 'You''re already signed up for this program.' using errcode = '22023';
  end if;
  if v_prog.capacity is not null and
     (select count(*) from public.program_enrollments where program_id = p_program and status = 'approved') >= v_prog.capacity then
    raise exception 'This program is full right now.' using errcode = '22023';
  end if;
  v_status := case when v_prog.requires_approval then 'pending' else 'approved' end;
  insert into public.program_enrollments (program_id, person_id, status, note, decided_at)
  values (p_program, v_person, v_status, nullif(trim(p_note), ''), case when v_status = 'approved' then now() end);
  return v_status;
end $$;

create function public.withdraw_enrollment(p_id uuid)
returns void
language sql security definer
set search_path = ''
as $$
  update public.program_enrollments set status = 'withdrawn'
  where id = p_id and person_id = public.auth_person_id() and status in ('pending', 'approved')
$$;

-- Registers for an event, signed in or not. Signed-in people are linked to
-- their profile; guests keep the contact details they entered.
create function public.register_for_event(p_event uuid, p_name text, p_email text, p_phone text default null, p_guests int default 0)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_ev public.events;
  v_id uuid;
  v_taken int;
  v_guests int := greatest(coalesce(p_guests, 0), 0);
begin
  select * into v_ev from public.events where id = p_event and is_published;
  if not found then raise exception 'That event isn''t available.' using errcode = '22023'; end if;
  if not v_ev.requires_registration then raise exception 'This event doesn''t need registration.' using errcode = '22023'; end if;
  if coalesce(v_ev.ends_at, v_ev.starts_at + interval '1 day') < now() then
    raise exception 'This event has already happened.' using errcode = '22023';
  end if;
  if v_ev.capacity is not null then
    select coalesce(sum(1 + guests), 0) into v_taken from public.event_registrations where event_id = p_event and status = 'registered';
    if v_taken + 1 + v_guests > v_ev.capacity then
      raise exception 'There aren''t enough spots left for your group.' using errcode = '22023';
    end if;
  end if;
  insert into public.event_registrations (event_id, person_id, name, email, phone, guests)
  values (p_event, public.auth_person_id(), trim(p_name), lower(trim(p_email)), nullif(trim(p_phone), ''), least(v_guests, 10))
  returning id into v_id;
  return v_id;
exception when unique_violation then
  raise exception 'You''re already registered for this event.' using errcode = '22023';
end $$;

create function public.cancel_event_registration(p_id uuid)
returns void
language sql security definer
set search_path = ''
as $$
  update public.event_registrations set status = 'cancelled'
  where id = p_id and person_id = public.auth_person_id() and status = 'registered' and checked_in_at is null
$$;

-- Spots taken (people plus their guests); capacity-aware pages use this.
create function public.event_taken_spots(p_event uuid)
returns int
language sql stable security definer
set search_path = ''
as $$
  select coalesce(sum(1 + guests), 0)::int from public.event_registrations
  where event_id = p_event and status = 'registered'
$$;

-- A signed-in person's recent activity across modules, newest first. It reads
-- through the caller's own access, so it only ever shows their own records.
create function public.my_activity(p_limit int default 8)
returns table (kind text, title text, detail text, at timestamptz, href text)
language sql stable security invoker
set search_path = ''
as $$
  select * from (
    select 'program'::text, p.name, e.status::text, e.created_at, '/portal/programs'::text
      from public.program_enrollments e join public.programs p on p.id = e.program_id
      where e.person_id = public.auth_person_id()
    union all
    select 'event', ev.title, r.status::text, r.created_at, '/portal/events'
      from public.event_registrations r join public.events ev on ev.id = r.event_id
      where r.person_id = public.auth_person_id()
    union all
    select 'church', 'Joined the church', m.status, m.joined_at, '/portal'
      from public.church_memberships m where m.person_id = public.auth_person_id()
    union all
    select 'gift', 'Gift received, thank you', null, g.given_at, '/portal/giving'
      from public.gifts g where g.person_id = public.auth_person_id() and g.status = 'succeeded'
    union all
    select 'studio', 'Studio request: ' || s.service, s.status::text, s.created_at, '/portal'
      from public.studio_requests s where s.person_id = public.auth_person_id()
  ) a (kind, title, detail, at, href)
  order by at desc
  limit least(greatest(p_limit, 1), 50)
$$;

revoke execute on function
  public.join_church(), public.leave_church(), public.enroll_in_program(uuid, text), public.withdraw_enrollment(uuid),
  public.cancel_event_registration(uuid), public.my_activity(int)
  from public, anon;
grant execute on function
  public.join_church(), public.leave_church(), public.enroll_in_program(uuid, text), public.withdraw_enrollment(uuid),
  public.cancel_event_registration(uuid), public.my_activity(int)
  to authenticated;
revoke execute on function public.register_for_event(uuid, text, text, text, int), public.event_taken_spots(uuid) from public;
grant execute on function public.register_for_event(uuid, text, text, text, int), public.event_taken_spots(uuid) to anon, authenticated;

-- Merging a guest into an account carries these records over too.
create or replace function public.repoint_person_refs(p_from uuid, p_to uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.staff_role_assignments set person_id = p_to where person_id = p_from;
  update public.studio_requests set person_id = p_to where person_id = p_from;
  update public.gifts set person_id = p_to where person_id = p_from;
  update public.event_registrations r set person_id = p_to
    where r.person_id = p_from
      and not exists (select 1 from public.event_registrations x
                      where x.event_id = r.event_id and x.person_id = p_to and x.status = 'registered' and r.status = 'registered');
  update public.program_enrollments e set person_id = p_to
    where e.person_id = p_from
      and not exists (select 1 from public.program_enrollments x
                      where x.program_id = e.program_id and x.person_id = p_to and x.status in ('pending', 'approved') and e.status in ('pending', 'approved'));
  update public.church_memberships m set person_id = p_to
    where m.person_id = p_from and not exists (select 1 from public.church_memberships x where x.person_id = p_to);
end $$;
revoke execute on function public.repoint_person_refs(uuid, uuid) from public, anon, authenticated;

-- ── Seed: the programs and events KEP already lists on the site ───────────
insert into public.programs (slug, name, summary, body, highlights, image_path, art, category, requires_approval, sort_order) values
  ('youth-mentorship', 'Youth Mentorship', 'A safe place, positive mentors and real opportunities for young people.',
   array['Our youth program gives young people a safe place to grow, with mentors who show up for them week after week.',
         'Youth and young adults work toward certifications in different programs, take part in field trips and community activities, and build skills that last.'],
   array['Leadership development','Academic support','Recreation and fun activities','Mentorship and life skills','Field trips and certifications'],
   '/images/youth-with-mentor.webp', null, 'youth', true, 10),
  ('arts', 'Arts Program', 'Space for young people and adults to develop their creative gifts.',
   array['The Arts Program gives people of every age room to create, perform and develop the gifts God has given them.'],
   array['Creative expression','Performance opportunities','Open to all ages'],
   '/images/celebration.webp', 'arts', 'youth', true, 20),
  ('entrepreneurship', 'Entrepreneurship Program', 'Workshops and guidance for people building a business or a new income.',
   array['Through workshops and one-on-one guidance, the Entrepreneurship Program helps people turn ideas into real businesses and steady income.'],
   array['Business workshops','Guidance from people who''ve done it','Connections in the community'],
   '/images/workshop.webp', null, 'build', true, 30),
  ('media', 'Media Program', 'Learn to create in KEP''s own studio, from recording to video.',
   array['The Media Program teaches people to tell stories and share their voice using KEP''s studio.',
         'Participants take part in studio contests with prizes and build a portfolio of their own work.'],
   array['Hands-on studio time','Contests with prizes','Build a portfolio'],
   '/images/facility.webp', null, 'build', true, 40),
  ('computer-lab', 'Computer Lab', 'Computers, internet and help for school, job searches and new skills.',
   array['The KEP Computer Lab is open to the community for homework, job applications, learning new digital skills and more.'],
   array['Computers and internet access','Homework and job search help','Digital skills'],
   '/images/computer-lab.webp', null, 'technology', false, 50);

insert into public.events (slug, title, blurb, starts_at, ends_at, location, image_path, requires_registration) values
  ('the-gathering', 'The Gathering', 'A free concert with a triple album release party.',
   '2026-07-18 15:00-05', '2026-07-18 18:00-05', '5522 Jones Creek Rd, Baton Rouge, LA', '/images/flyer-the-gathering.webp', true),
  ('stop-the-violence-march', 'Stop the Violence March', 'A community march to stop the violence and killing.',
   '2026-08-29 10:00-05', null, 'Baton Rouge, LA', '/images/flyer-violence-march.webp', false),
  ('sound-the-alarm-conference', 'Sound the Alarm Conference', 'A conference for men and women.',
   '2024-04-27 09:00-05', null, 'Baton Rouge, LA', '/images/flyer-sound-the-alarm.webp', false);
