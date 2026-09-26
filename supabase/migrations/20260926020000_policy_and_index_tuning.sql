-- Evaluate auth.uid() once per query instead of once per row, and index the
-- foreign keys that had no covering index (Supabase performance advisor).

alter policy people_select_self on public.people
  using (auth_user_id = (select auth.uid()));

alter policy people_update_self on public.people
  using (auth_user_id = (select auth.uid()))
  with check (auth_user_id = (select auth.uid()));

create index people_merged_into_idx on public.people (merged_into_id) where merged_into_id is not null;
create index staff_role_granted_by_idx on public.staff_role_assignments (granted_by);
