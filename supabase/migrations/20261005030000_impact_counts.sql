-- Phase 9: every public impact metric now has a real count behind it. The same
-- rules as before: nothing shows until a super admin switches it on, and a
-- total under 5 comes back as null so nobody can be singled out.
create or replace function public.public_impact()
returns table (key text, label text, value integer)
language sql stable security definer
set search_path = ''
as $$
  with counts (key, n) as (
    values
      ('people_served',             (select count(*)::int from public.people where merged_into_id is null)),
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
