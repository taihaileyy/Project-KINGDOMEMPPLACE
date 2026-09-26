-- Postgres lets everyone execute new functions, and Supabase exposes public
-- functions at /rest/v1/rpc. Signed-out visitors have no use for any of these,
-- and the trigger functions should only ever run as triggers.

revoke execute on function public.auth_person_id() from public, anon;
revoke execute on function public.has_role(public.staff_role, uuid) from public, anon;
revoke execute on function public.is_staff() from public, anon;
revoke execute on function public.my_roles() from public, anon;

-- RLS policies and the app (supabase.rpc("my_roles")) call these as the
-- signed-in user. They only ever answer about the caller.
grant execute on function public.auth_person_id() to authenticated;
grant execute on function public.has_role(public.staff_role, uuid) to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.my_roles() to authenticated;

revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;
revoke execute on function public.handle_auth_user_verified() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
