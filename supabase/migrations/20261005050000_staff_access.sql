-- Super admins manage who is staff, and can close an account.
--
-- Roles: grant_staff_role / revoke_staff_role. The last super admin can't be
-- removed, so KEP can never be locked out.
--
-- Closing an account (delete_person_account) removes the login and wipes the
-- person's personal details, but keeps the records the church must be able to
-- trust (gifts, housing payments, attendance counts), now attached to a
-- "Deleted account" entry that no longer names anyone.

alter table public.people add column deleted_at timestamptz;

create function public.grant_staff_role(p_person uuid, p_role public.staff_role, p_program uuid default null, p_scope text default null)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare v_id uuid;
begin
  if not public.has_role('super_admin') then raise exception 'Super admins only.' using errcode = '42501'; end if;
  if not exists (select 1 from public.people where id = p_person and auth_user_id is not null and deleted_at is null and merged_into_id is null) then
    raise exception 'That person needs a KEP account first.' using errcode = '22023';
  end if;
  if p_role <> 'program_staff' and (p_program is not null or p_scope is not null) then
    raise exception 'Only program staff can be limited to a program.' using errcode = '22023';
  end if;
  if p_scope is not null and (p_program is not null or p_scope not in ('studio', 'paradise')) then
    raise exception 'Choose one program, the studio, or Create Your World.' using errcode = '22023';
  end if;
  insert into public.staff_role_assignments (person_id, role, program_id, scope, granted_by)
  values (p_person, p_role, p_program, p_scope, public.auth_person_id())
  returning id into v_id;
  return v_id;
exception when unique_violation then
  raise exception 'They already have that role.' using errcode = '22023';
end $$;

create function public.revoke_staff_role(p_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare r public.staff_role_assignments;
begin
  if not public.has_role('super_admin') then raise exception 'Super admins only.' using errcode = '42501'; end if;
  select * into r from public.staff_role_assignments where id = p_id and revoked_at is null;
  if not found then raise exception 'That role was already removed.' using errcode = '22023'; end if;
  if r.role = 'super_admin' and (select count(*) from public.staff_role_assignments where role = 'super_admin' and revoked_at is null) <= 1 then
    raise exception 'KEP needs at least one super admin. Make someone else a super admin first.' using errcode = '22023';
  end if;
  update public.staff_role_assignments set revoked_at = now() where id = p_id;
end $$;

create function public.delete_person_account(p_person uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare v public.people;
begin
  if not public.has_role('super_admin') then raise exception 'Super admins only.' using errcode = '42501'; end if;
  select * into v from public.people where id = p_person and deleted_at is null;
  if not found then raise exception 'That account was already deleted.' using errcode = '22023'; end if;
  if p_person = public.auth_person_id() then raise exception 'You can''t delete your own account here.' using errcode = '22023'; end if;
  if exists (select 1 from public.staff_role_assignments where person_id = p_person and role = 'super_admin' and revoked_at is null) then
    raise exception 'Remove their super admin role first.' using errcode = '22023';
  end if;
  if exists (select 1 from public.housing_residencies where person_id = p_person and status = 'active') then
    raise exception 'They live at the KEP house right now. Move them out first.' using errcode = '22023';
  end if;

  -- Staff access ends.
  update public.staff_role_assignments set revoked_at = now() where person_id = p_person and revoked_at is null;

  -- Things that only mattered to them.
  delete from public.church_memberships where person_id = p_person;
  delete from public.media_likes where person_id = p_person;
  delete from public.media_comments where person_id = p_person;
  delete from public.paradise_player_progress where person_id = p_person;
  update public.program_enrollments set status = 'withdrawn' where person_id = p_person and status in ('pending', 'approved');
  update public.housing_applications set status = 'withdrawn' where person_id = p_person and status in ('submitted', 'in_review', 'approved');

  -- Personal details wiped from every record that holds a copy.
  update public.event_registrations set name = 'Deleted account', email = ('deleted-' || id::text || '@deleted.invalid')::extensions.citext, phone = null, status = case when checked_in_at is null then 'cancelled' else status end where person_id = p_person;
  update public.studio_requests set name = 'Deleted account', email = ('deleted-' || id::text || '@deleted.invalid')::extensions.citext, phone = null, details = null where person_id = p_person;
  update public.housing_applications set phone = null, emergency_name = null, emergency_phone = null, about = null, staff_note = null where person_id = p_person;
  update public.gifts set donor_name = null, donor_email = null where person_id = p_person;

  -- The login goes, then the profile is blanked and marked deleted.
  delete from auth.users where id = v.auth_user_id;
  update public.people set
    first_name = 'Deleted', last_name = 'account', preferred_name = null, email = null, phone = null, date_of_birth = null,
    address_line1 = null, city = null, state = null, postal_code = null, directory_visible = false,
    auth_user_id = null, deleted_at = now()
  where id = p_person;
end $$;

revoke execute on function public.grant_staff_role(uuid, public.staff_role, uuid, text), public.revoke_staff_role(uuid), public.delete_person_account(uuid) from public, anon;
grant execute on function public.grant_staff_role(uuid, public.staff_role, uuid, text), public.revoke_staff_role(uuid), public.delete_person_account(uuid) to authenticated;

-- Deleted accounts don't count as people served.
create or replace function public.public_impact()
returns table (key text, label text, value integer)
language sql stable security definer
set search_path = ''
as $$
  with counts (key, n) as (
    values
      ('people_served',             (select count(*)::int from public.people where merged_into_id is null and deleted_at is null)),
      ('currently_housed',          (select count(*)::int from public.housing_residencies where status = 'active')),
      ('transitioned_from_housing', (select count(*)::int from public.housing_residencies where status = 'moved_out' and move_out_reason = 'graduated')),
      ('residents_employed',        (select count(*)::int from public.housing_residencies where employed)),
      ('program_participants',      (select count(distinct person_id)::int from public.program_enrollments where status in ('approved', 'completed'))),
      ('youth_mentored',            (select count(distinct e.person_id)::int from public.program_enrollments e join public.programs p on p.id = e.program_id
                                      where p.slug = 'youth-mentorship' and e.status in ('approved', 'completed'))),
      ('program_completions',       (select count(*)::int from public.program_enrollments where status = 'completed')),
      ('events_held',               (select count(*)::int from public.events where is_published and coalesce(ends_at, starts_at + interval '1 day') < now())),
      ('event_attendance',          (select coalesce(sum(1 + guests), 0)::int from public.event_registrations where checked_in_at is not null))
  )
  select m.key, m.label, case when c.n >= 5 then c.n end
  from public.impact_metrics m
  join counts c on c.key = m.key
  where m.is_public
  order by m.sort_order
$$;
