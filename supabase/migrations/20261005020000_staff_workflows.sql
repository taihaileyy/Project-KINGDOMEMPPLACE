-- Phases 5-7: what staff do. Program staff approve enrollments and see their
-- rosters; event staff check people in; studio staff approve requests against
-- a calendar of approved bookings and blocked times, with a double-booking guard.

-- ── Programs ──────────────────────────────────────────────────────────────
-- Program staff see the names of people on their programs' lists.
create policy people_select_program_staff on public.people for select to authenticated
  using (exists (select 1 from public.program_enrollments e
                 where e.person_id = people.id and (select public.can_manage_program(e.program_id))));

create function public.decide_enrollment(p_id uuid, p_status public.enrollment_status, p_note text default null)
returns void
language plpgsql security definer set search_path = ''
as $$
declare v_prog uuid; v_cap int;
begin
  select program_id into v_prog from public.program_enrollments where id = p_id;
  if v_prog is null or not public.can_manage_program(v_prog) then raise exception 'Not allowed.' using errcode = '42501'; end if;
  if p_status not in ('approved', 'declined', 'completed') then raise exception 'Choose approved, declined or completed.' using errcode = '22023'; end if;
  if p_status = 'approved' then
    select capacity into v_cap from public.programs where id = v_prog;
    if v_cap is not null and (select count(*) from public.program_enrollments where program_id = v_prog and status = 'approved' and id <> p_id) >= v_cap then
      raise exception 'This program is full.' using errcode = '22023';
    end if;
  end if;
  update public.program_enrollments
     set status = p_status, note = coalesce(nullif(trim(p_note), ''), note),
         decided_by = public.auth_person_id(), decided_at = now(),
         completed_at = case when p_status = 'completed' then now() end
   where id = p_id
     and ((p_status in ('approved', 'declined') and status = 'pending') or (p_status = 'completed' and status = 'approved'));
  if not found then raise exception 'That request can''t be changed that way.' using errcode = '22023'; end if;
end $$;

-- ── Events ────────────────────────────────────────────────────────────────
create function public.check_in_registration(p_id uuid, p_in boolean default true)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.can_manage_events() then raise exception 'Not allowed.' using errcode = '42501'; end if;
  update public.event_registrations
     set checked_in_at = case when p_in then now() end, checked_in_by = case when p_in then public.auth_person_id() end
   where id = p_id and status = 'registered';
end $$;

-- ── Studio ────────────────────────────────────────────────────────────────
create table public.studio_blocks (
  id         uuid primary key default gen_random_uuid(),
  block_date date not null,
  start_time time not null default '00:00',
  end_time   time not null default '23:59',
  reason     text check (char_length(reason) <= 200),
  created_by uuid references public.people (id),
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);
create index studio_blocks_date_idx on public.studio_blocks (block_date);
create index studio_blocks_created_by_idx on public.studio_blocks (created_by) where created_by is not null;
create trigger studio_blocks_audit after insert or update or delete on public.studio_blocks for each row execute function public.audit_row();

alter table public.studio_blocks enable row level security;
create policy studio_blocks_staff on public.studio_blocks for select to authenticated using ((select public.is_studio_staff()));
revoke all on public.studio_blocks from anon;
revoke insert, update, delete on public.studio_blocks from authenticated;

-- Is any of [start, start+minutes) on that date taken by an approved booking or a block?
create function public.studio_slot_taken(p_date date, p_start time, p_minutes int, p_ignore uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.studio_requests r
    where r.status = 'approved' and r.preferred_date = p_date and r.id is distinct from p_ignore
      and r.start_time < p_start + make_interval(mins => p_minutes)
      and r.start_time + make_interval(mins => r.duration_minutes) > p_start
  ) or exists (
    select 1 from public.studio_blocks b
    where b.block_date = p_date
      and b.start_time < p_start + make_interval(mins => p_minutes)
      and b.end_time > p_start
  )
$$;

-- Public: only the busy time ranges, never who booked.
create function public.studio_busy(p_from date, p_to date)
returns table (day date, start_time time, end_time time)
language sql stable security definer set search_path = ''
as $$
  select r.preferred_date, r.start_time, (r.start_time + make_interval(mins => r.duration_minutes))::time
    from public.studio_requests r where r.status = 'approved' and r.preferred_date between p_from and least(p_to, p_from + 62)
  union all
  select b.block_date, b.start_time, b.end_time from public.studio_blocks b where b.block_date between p_from and least(p_to, p_from + 62)
  order by 1, 2
$$;

create function public.add_studio_block(p_date date, p_start time, p_end time, p_reason text default null)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare v_id uuid;
begin
  if not public.is_studio_staff() then raise exception 'Studio staff only.' using errcode = '42501'; end if;
  if p_end <= p_start then raise exception 'The end time must be after the start time.' using errcode = '22023'; end if;
  insert into public.studio_blocks (block_date, start_time, end_time, reason, created_by)
  values (p_date, p_start, p_end, nullif(trim(p_reason), ''), public.auth_person_id()) returning id into v_id;
  return v_id;
end $$;

-- Studio staff remove a block directly; everyone else can't.
create policy studio_blocks_remove on public.studio_blocks as permissive for delete to authenticated
  using ((select public.is_studio_staff()));
grant delete on public.studio_blocks to authenticated;

-- Approve or decline a request. Approving checks the slot is still free.
create function public.decide_studio_request(p_id uuid, p_status public.studio_request_status, p_note text default null)
returns void
language plpgsql security definer set search_path = ''
as $$
declare r public.studio_requests;
begin
  if not public.is_studio_staff() then raise exception 'Studio staff only.' using errcode = '42501'; end if;
  if p_status not in ('approved', 'declined', 'cancelled') then raise exception 'Choose approved, declined or cancelled.' using errcode = '22023'; end if;
  select * into r from public.studio_requests where id = p_id;
  if not found then raise exception 'Request not found.' using errcode = '22023'; end if;
  if p_status = 'approved' and public.studio_slot_taken(r.preferred_date, r.start_time, r.duration_minutes, r.id) then
    raise exception 'That time overlaps another booking or a blocked time.' using errcode = '22023';
  end if;
  update public.studio_requests
     set status = p_status, decided_by = public.auth_person_id(), decided_at = now(),
         details = case when nullif(trim(p_note), '') is null then details else left(coalesce(details || E'\n', '') || 'Staff note: ' || trim(p_note), 2000) end
   where id = p_id;
end $$;

-- The public request form now refuses times that are already taken.
create or replace function public.request_studio_booking(
  p_name text, p_email text, p_phone text, p_service text, p_date date, p_start time, p_minutes int, p_attendees int, p_details text
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
  v_today date := (now() at time zone 'America/Chicago')::date;
begin
  if p_date < v_today or p_date > v_today + 365 then
    raise exception 'Choose a date between today and one year from now.' using errcode = '22023';
  end if;
  if extract(epoch from p_start) / 60 + p_minutes > 1440 then
    raise exception 'Choose a session that ends the same day.' using errcode = '22023';
  end if;
  if public.studio_slot_taken(p_date, p_start, p_minutes) then
    raise exception 'That time is already taken. Please choose another time.' using errcode = '22023';
  end if;
  if (select count(*) from public.studio_requests where email = p_email::extensions.citext and status = 'pending') >= 5 then
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

revoke execute on function
  public.decide_enrollment(uuid, public.enrollment_status, text), public.check_in_registration(uuid, boolean),
  public.studio_slot_taken(date, time, int, uuid), public.add_studio_block(date, time, time, text),
  public.decide_studio_request(uuid, public.studio_request_status, text)
  from public, anon;
grant execute on function
  public.decide_enrollment(uuid, public.enrollment_status, text), public.check_in_registration(uuid, boolean),
  public.add_studio_block(date, time, time, text),
  public.decide_studio_request(uuid, public.studio_request_status, text)
  to authenticated;
-- The overlap check is for the functions above only; nobody calls it directly.
revoke execute on function public.studio_slot_taken(date, time, int, uuid) from public, anon, authenticated;
revoke execute on function public.studio_busy(date, date) from public;
grant execute on function public.studio_busy(date, date) to anon, authenticated;
