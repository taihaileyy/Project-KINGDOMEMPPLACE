-- Public impact numbers. Visitors only ever get aggregate totals through
-- public_impact(); they can't read this table or any table behind the counts.
-- Every metric starts hidden until a super admin switches it on, and a total
-- under 5 comes back as null ("fewer than 5") so nobody can be singled out.

create table public.impact_metrics (
  key        text primary key check (key ~ '^[a-z_]+$'),
  label      text not null check (char_length(label) <= 80),
  is_public  boolean not null default false,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create trigger impact_metrics_touch before update on public.impact_metrics
  for each row execute function public.touch_updated_at();
create trigger impact_metrics_audit after insert or update or delete on public.impact_metrics
  for each row execute function public.audit_row();

-- Metrics for modules that don't exist yet are listed now so admins see the
-- full set; public_impact() only returns the ones it can count.
insert into public.impact_metrics (key, label, sort_order) values
  ('people_served',             'People served',                    10),
  ('currently_housed',          'Currently housed',                 20),
  ('transitioned_from_housing', 'Moved on from KEP housing',        30),
  ('residents_employed',        'Residents who gained employment',  40),
  ('program_participants',      'Program participants',             50),
  ('youth_mentored',            'Youth mentored',                   60),
  ('program_completions',       'Program completions',              70),
  ('events_held',               'Events and workshops held',        80),
  ('event_attendance',          'Event attendance',                 90);

alter table public.impact_metrics enable row level security;

create policy impact_metrics_select_admin on public.impact_metrics
  for select to authenticated
  using (public.has_role('super_admin'));

create policy impact_metrics_update_admin on public.impact_metrics
  for update to authenticated
  using (public.has_role('super_admin'))
  with check (public.has_role('super_admin'));

revoke all on public.impact_metrics from anon;
revoke insert, delete on public.impact_metrics from authenticated;

-- Each later module adds its counts to the `counts` list.
create function public.public_impact()
returns table (key text, label text, value integer)
language sql stable security definer
set search_path = ''
as $$
  with counts (key, n) as (
    select 'people_served', count(*)::int from public.people where merged_into_id is null
  )
  select m.key, m.label, case when c.n >= 5 then c.n end
  from public.impact_metrics m
  join counts c on c.key = m.key
  where m.is_public
  order by m.sort_order
$$;

revoke execute on function public.public_impact() from public;
grant execute on function public.public_impact() to anon, authenticated;
