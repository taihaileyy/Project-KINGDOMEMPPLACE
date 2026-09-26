-- Phase 0: one identity per person, staff roles, audit log, and the
-- helper functions every later Row Level Security policy builds on.

-- Supabase keeps extensions in their own schema; types are referenced with it.
create schema if not exists extensions;
create extension if not exists citext with schema extensions;

-- ─── People ────────────────────────────────────────────────────────────────
-- One row per human. auth_user_id is null for guests (event sign-ups, studio
-- requests, walk-ins) until they create and verify an account.

create table public.people (
  id                uuid primary key default gen_random_uuid(),
  auth_user_id      uuid unique references auth.users (id) on delete set null,
  first_name        text not null default '' check (char_length(first_name) <= 100),
  last_name         text not null default '' check (char_length(last_name) <= 100),
  preferred_name    text check (char_length(preferred_name) <= 100),
  email             extensions.citext check (char_length(email) <= 320),
  phone             text check (char_length(phone) <= 40),
  date_of_birth     date,
  address_line1     text check (char_length(address_line1) <= 200),
  city              text check (char_length(city) <= 100),
  state             text check (char_length(state) <= 50),
  postal_code       text check (char_length(postal_code) <= 20),
  directory_visible boolean not null default false,
  merged_into_id    uuid references public.people (id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- An email can belong to at most one account. Guests may share an email with
-- an account until they're merged, so they're excluded.
create unique index people_account_email_key
  on public.people (email)
  where auth_user_id is not null and merged_into_id is null;
create index people_email_idx on public.people (email) where merged_into_id is null;
create index people_name_idx on public.people (lower(last_name), lower(first_name));

-- ─── Staff roles ───────────────────────────────────────────────────────────

create type public.staff_role as enum (
  'super_admin', 'finance_admin', 'housing_staff', 'program_staff', 'church_staff'
);

create table public.staff_role_assignments (
  id          uuid primary key default gen_random_uuid(),
  person_id   uuid not null references public.people (id) on delete cascade,
  role        public.staff_role not null,
  program_id  uuid,          -- scope for program_staff; FK added with the programs table
  scope       text,          -- non-program scopes, e.g. 'studio'
  granted_by  uuid references public.people (id),
  granted_at  timestamptz not null default now(),
  revoked_at  timestamptz,
  check (role = 'program_staff' or (program_id is null and scope is null))
);

create unique index staff_role_active_key
  on public.staff_role_assignments (person_id, role, coalesce(program_id, '00000000-0000-0000-0000-000000000000'), coalesce(scope, ''))
  where revoked_at is null;

-- ─── Audit log ─────────────────────────────────────────────────────────────

create table public.audit_log (
  id             bigint generated always as identity primary key,
  actor_id       uuid,        -- people.id of the signed-in user, null for system jobs
  action         text not null,
  table_name     text not null,
  record_id      uuid,
  changed_fields jsonb,
  at             timestamptz not null default now()
);
create index audit_log_record_idx on public.audit_log (table_name, record_id);
create index audit_log_at_idx on public.audit_log (at desc);

-- ─── Helper functions ──────────────────────────────────────────────────────
-- security definer so policies can call them without recursive RLS checks.

create function public.auth_person_id()
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select p.id from public.people p
  where p.auth_user_id = auth.uid() and p.merged_into_id is null
$$;

create function public.has_role(p_role public.staff_role, p_program_id uuid default null)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_role_assignments a
    where a.person_id = public.auth_person_id()
      and a.revoked_at is null
      and (a.role = p_role or a.role = 'super_admin')
      and (p_program_id is null or a.program_id is null or a.program_id = p_program_id)
  )
$$;

create function public.is_staff()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_role_assignments a
    where a.person_id = public.auth_person_id() and a.revoked_at is null
  )
$$;

create function public.my_roles()
returns table (role public.staff_role, program_id uuid, scope text)
language sql stable security definer
set search_path = ''
as $$
  select a.role, a.program_id, a.scope
  from public.staff_role_assignments a
  where a.person_id = public.auth_person_id() and a.revoked_at is null
$$;

-- ─── updated_at ────────────────────────────────────────────────────────────

create function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger people_touch before update on public.people
  for each row execute function public.touch_updated_at();

-- ─── Audit trigger ─────────────────────────────────────────────────────────

create function public.audit_row()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  diff jsonb;
begin
  if tg_op = 'UPDATE' then
    select jsonb_object_agg(n.key, jsonb_build_object('from', o.value, 'to', n.value))
      into diff
    from jsonb_each(to_jsonb(new)) n
    join jsonb_each(to_jsonb(old)) o using (key)
    where n.value is distinct from o.value and n.key <> 'updated_at';
    if diff is null then return new; end if;
  end if;

  insert into public.audit_log (actor_id, action, table_name, record_id, changed_fields)
  values (
    public.auth_person_id(),
    lower(tg_op),
    tg_table_name,
    coalesce((case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end) ->> 'id', null)::uuid,
    case tg_op when 'UPDATE' then diff when 'INSERT' then to_jsonb(new) else to_jsonb(old) end
  );
  return coalesce(new, old);
end $$;

create trigger people_audit after insert or update or delete on public.people
  for each row execute function public.audit_row();
create trigger staff_roles_audit after insert or update or delete on public.staff_role_assignments
  for each row execute function public.audit_row();

-- ─── Account ↔ person linking ──────────────────────────────────────────────
-- New sign-up: create the person's row. A guest record with the same email is
-- only claimed once the email is verified, so nobody can take over someone
-- else's history by typing their address.

create function public.claim_guest_records(p_person_id uuid, p_email extensions.citext)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  g record;
begin
  for g in
    select * from public.people
    where email = p_email and auth_user_id is null and merged_into_id is null
      and id <> p_person_id
  loop
    update public.people t set
      phone         = coalesce(t.phone, g.phone),
      first_name    = case when t.first_name = '' then g.first_name else t.first_name end,
      last_name     = case when t.last_name = '' then g.last_name else t.last_name end
    where t.id = p_person_id;
    -- Later phases re-point their foreign keys here (registrations, bookings, gifts...).
    perform public.repoint_person_refs(g.id, p_person_id);
    update public.people set merged_into_id = p_person_id where id = g.id;
  end loop;
end $$;

-- Extended by later migrations; each module adds its own tables.
create function public.repoint_person_refs(p_from uuid, p_to uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.staff_role_assignments set person_id = p_to where person_id = p_from;
end $$;

create function public.handle_new_auth_user()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  v_person uuid;
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.people (auth_user_id, email, first_name, last_name, phone)
  values (
    new.id,
    new.email,
    left(coalesce(meta ->> 'first_name', ''), 100),
    left(coalesce(meta ->> 'last_name', ''), 100),
    left(nullif(meta ->> 'phone', ''), 40)
  )
  returning id into v_person;

  if new.email_confirmed_at is not null and new.email is not null then
    perform public.claim_guest_records(v_person, new.email::extensions.citext);
  end if;
  return new;
end $$;

create function public.handle_auth_user_verified()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  v_person uuid;
begin
  select id into v_person from public.people where auth_user_id = new.id;

  -- Email changes are only applied once the new address is confirmed.
  if new.email is distinct from old.email and v_person is not null then
    update public.people set email = new.email where id = v_person;
  end if;

  if new.email_confirmed_at is not null and v_person is not null and new.email is not null
     and (old.email_confirmed_at is null or new.email is distinct from old.email) then
    perform public.claim_guest_records(v_person, new.email::extensions.citext);
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_auth_user();
create trigger on_auth_user_updated after update of email, email_confirmed_at on auth.users
  for each row execute function public.handle_auth_user_verified();

-- ─── Row Level Security ────────────────────────────────────────────────────

alter table public.people enable row level security;
alter table public.staff_role_assignments enable row level security;
alter table public.audit_log enable row level security;

-- People: you see yourself; staff who manage people see everyone.
-- Narrower staff views (housing staff → residents, program staff → their
-- participants) are added by the modules that create those relationships.
create policy people_select_self on public.people
  for select to authenticated
  using (auth_user_id = auth.uid());

create policy people_select_staff on public.people
  for select to authenticated
  using (public.has_role('church_staff') or public.has_role('finance_admin'));

create policy people_update_self on public.people
  for update to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

create policy people_update_staff on public.people
  for update to authenticated
  using (public.has_role('church_staff'))
  with check (public.has_role('church_staff'));

-- Members can only change their own contact fields, never the link to their
-- login or the merge pointer.
revoke insert, update, delete on public.people from anon, authenticated;
grant update (first_name, last_name, preferred_name, phone, date_of_birth,
              address_line1, city, state, postal_code, directory_visible)
  on public.people to authenticated;
revoke all on public.people from anon;

-- Roles: you can see your own; only super admins manage them.
create policy roles_select_self on public.staff_role_assignments
  for select to authenticated
  using (person_id = public.auth_person_id());

create policy roles_select_admin on public.staff_role_assignments
  for select to authenticated
  using (public.has_role('super_admin'));

create policy roles_write_admin on public.staff_role_assignments
  for all to authenticated
  using (public.has_role('super_admin'))
  with check (public.has_role('super_admin'));

revoke all on public.staff_role_assignments from anon;

-- Audit log: super admins read; nobody writes directly (only the trigger).
create policy audit_select_admin on public.audit_log
  for select to authenticated
  using (public.has_role('super_admin'));

revoke all on public.audit_log from anon;
revoke insert, update, delete on public.audit_log from authenticated;

revoke execute on function public.claim_guest_records(uuid, extensions.citext) from public, anon, authenticated;
revoke execute on function public.repoint_person_refs(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.audit_row() from public, anon, authenticated;
