-- Phase 4: sober living housing. Apply -> staff review -> approve -> move in,
-- then a resident dashboard (days housed, deposit, next rent due, balance,
-- status, history) with goals and staff check-ins.
--
-- Money rules: a deposit when moving in, then rent every 7 days starting one
-- week after move-in. Charges are worked out from the move-in date and the
-- terms saved on the stay, so nothing needs a scheduled job. Balance =
-- deposit + rent due so far - payments recorded.

create type public.housing_application_status as enum ('submitted', 'in_review', 'approved', 'declined', 'withdrawn');
create type public.residency_status as enum ('active', 'moved_out');
create type public.payment_method as enum ('paypal', 'cash', 'money_order', 'other');

create table public.housing_applications (
  id               uuid primary key default gen_random_uuid(),
  person_id        uuid not null references public.people (id) on delete cascade,
  status           public.housing_application_status not null default 'submitted',
  desired_move_in  date,
  phone            text check (char_length(phone) <= 40),
  emergency_name   text check (char_length(emergency_name) <= 120),
  emergency_phone  text check (char_length(emergency_phone) <= 40),
  employment       text check (employment in ('employed', 'seeking', 'unable', 'other')),
  about            text check (char_length(about) <= 3000),
  staff_note       text check (char_length(staff_note) <= 2000),
  decided_by       uuid references public.people (id),
  decided_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create unique index housing_applications_open_key on public.housing_applications (person_id)
  where status in ('submitted', 'in_review', 'approved');
create index housing_applications_status_idx on public.housing_applications (status, created_at);
create index housing_applications_decided_by_idx on public.housing_applications (decided_by) where decided_by is not null;

create table public.housing_residencies (
  id              uuid primary key default gen_random_uuid(),
  person_id       uuid not null references public.people (id) on delete cascade,
  application_id  uuid references public.housing_applications (id) on delete set null,
  status          public.residency_status not null default 'active',
  room            text check (char_length(room) <= 60),
  move_in_date    date not null,
  move_out_date   date,
  move_out_reason text check (move_out_reason in ('graduated', 'left', 'removed', 'other')),
  deposit_cents   int not null default 10000 check (deposit_cents >= 0),
  weekly_cents    int not null default 15000 check (weekly_cents >= 0),
  employed        boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (move_out_date is null or move_out_date >= move_in_date)
);
create unique index housing_residencies_active_key on public.housing_residencies (person_id) where status = 'active';
create index housing_residencies_person_idx on public.housing_residencies (person_id);
create index housing_residencies_application_idx on public.housing_residencies (application_id) where application_id is not null;

create table public.housing_payments (
  id           uuid primary key default gen_random_uuid(),
  residency_id uuid not null references public.housing_residencies (id) on delete cascade,
  amount_cents int not null check (amount_cents > 0 and amount_cents <= 1000000),
  method       public.payment_method not null,
  paid_at      date not null default ((now() at time zone 'America/Chicago')::date),
  note         text check (char_length(note) <= 300),
  recorded_by  uuid references public.people (id),
  created_at   timestamptz not null default now()
);
create index housing_payments_residency_idx on public.housing_payments (residency_id, paid_at desc);
create index housing_payments_recorded_by_idx on public.housing_payments (recorded_by) where recorded_by is not null;

create table public.housing_goals (
  id           uuid primary key default gen_random_uuid(),
  residency_id uuid not null references public.housing_residencies (id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 200),
  target_date  date,
  done_at      timestamptz,
  created_at   timestamptz not null default now()
);
create index housing_goals_residency_idx on public.housing_goals (residency_id);

create table public.housing_checkins (
  id                  uuid primary key default gen_random_uuid(),
  residency_id        uuid not null references public.housing_residencies (id) on delete cascade,
  staff_id            uuid references public.people (id),
  note                text not null check (char_length(note) between 1 and 2000),
  visible_to_resident boolean not null default true,
  checked_in_on       date not null default ((now() at time zone 'America/Chicago')::date),
  created_at          timestamptz not null default now()
);
create index housing_checkins_residency_idx on public.housing_checkins (residency_id, checked_in_on desc);
create index housing_checkins_staff_idx on public.housing_checkins (staff_id) where staff_id is not null;

create trigger housing_applications_touch before update on public.housing_applications for each row execute function public.touch_updated_at();
create trigger housing_residencies_touch before update on public.housing_residencies for each row execute function public.touch_updated_at();
create trigger housing_applications_audit after insert or update or delete on public.housing_applications for each row execute function public.audit_row();
create trigger housing_residencies_audit after insert or update or delete on public.housing_residencies for each row execute function public.audit_row();
create trigger housing_payments_audit after insert or update or delete on public.housing_payments for each row execute function public.audit_row();
create trigger housing_goals_audit after insert or update or delete on public.housing_goals for each row execute function public.audit_row();
create trigger housing_checkins_audit after insert or update or delete on public.housing_checkins for each row execute function public.audit_row();

-- ── Access rules ──────────────────────────────────────────────────────────
-- Housing staff (and super admins) see everything here; a person sees only
-- their own application and stay. Nothing is written directly: every change
-- goes through a function below that checks who is asking.
alter table public.housing_applications enable row level security;
alter table public.housing_residencies enable row level security;
alter table public.housing_payments enable row level security;
alter table public.housing_goals enable row level security;
alter table public.housing_checkins enable row level security;

create policy housing_apps_own on public.housing_applications for select to authenticated
  using (person_id = (select public.auth_person_id()));
create policy housing_apps_staff on public.housing_applications for select to authenticated
  using ((select public.has_role('housing_staff')));
create policy housing_res_own on public.housing_residencies for select to authenticated
  using (person_id = (select public.auth_person_id()));
create policy housing_res_staff on public.housing_residencies for select to authenticated
  using ((select public.has_role('housing_staff')));
create policy housing_pay_own on public.housing_payments for select to authenticated
  using (exists (select 1 from public.housing_residencies r where r.id = residency_id and r.person_id = (select public.auth_person_id())));
create policy housing_pay_staff on public.housing_payments for select to authenticated
  using ((select public.has_role('housing_staff')) or (select public.has_role('finance_admin')));
create policy housing_goals_own on public.housing_goals for select to authenticated
  using (exists (select 1 from public.housing_residencies r where r.id = residency_id and r.person_id = (select public.auth_person_id())));
create policy housing_goals_staff on public.housing_goals for select to authenticated
  using ((select public.has_role('housing_staff')));
create policy housing_checkins_own on public.housing_checkins for select to authenticated
  using (visible_to_resident and exists (select 1 from public.housing_residencies r where r.id = residency_id and r.person_id = (select public.auth_person_id())));
create policy housing_checkins_staff on public.housing_checkins for select to authenticated
  using ((select public.has_role('housing_staff')));

-- Housing staff see the people on their lists (and nobody else).
create policy people_select_housing on public.people for select to authenticated
  using ((select public.has_role('housing_staff'))
         and (exists (select 1 from public.housing_applications a where a.person_id = people.id)
              or exists (select 1 from public.housing_residencies r where r.person_id = people.id)));

revoke all on public.housing_applications, public.housing_residencies, public.housing_payments, public.housing_goals, public.housing_checkins from anon;
revoke insert, update, delete on public.housing_applications, public.housing_residencies, public.housing_payments, public.housing_goals, public.housing_checkins from authenticated;

-- ── Functions ─────────────────────────────────────────────────────────────
create function public.is_housing_staff() returns boolean
language sql stable security definer set search_path = ''
as $$ select public.has_role('housing_staff') $$;
revoke execute on function public.is_housing_staff() from public, anon;
grant execute on function public.is_housing_staff() to authenticated;

create function public.apply_for_housing(p_desired date, p_phone text, p_emergency_name text, p_emergency_phone text, p_employment text, p_about text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare v_person uuid := public.auth_person_id(); v_id uuid;
begin
  if v_person is null then raise exception 'Create an account or log in to apply.' using errcode = '28000'; end if;
  if exists (select 1 from public.housing_residencies where person_id = v_person and status = 'active') then
    raise exception 'You''re already a resident.' using errcode = '22023';
  end if;
  if exists (select 1 from public.housing_applications where person_id = v_person and status in ('submitted', 'in_review', 'approved')) then
    raise exception 'You already have an application in progress.' using errcode = '22023';
  end if;
  insert into public.housing_applications (person_id, desired_move_in, phone, emergency_name, emergency_phone, employment, about)
  values (v_person, p_desired, nullif(trim(p_phone), ''), nullif(trim(p_emergency_name), ''), nullif(trim(p_emergency_phone), ''),
          nullif(p_employment, ''), nullif(trim(p_about), ''))
  returning id into v_id;
  return v_id;
end $$;

create function public.withdraw_housing_application(p_id uuid) returns void
language sql security definer set search_path = ''
as $$ update public.housing_applications set status = 'withdrawn'
      where id = p_id and person_id = public.auth_person_id() and status in ('submitted', 'in_review') $$;

-- Staff: move an application to in_review, approved or declined.
create function public.decide_housing_application(p_id uuid, p_status public.housing_application_status, p_note text default null)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.has_role('housing_staff') then raise exception 'Housing staff only.' using errcode = '42501'; end if;
  if p_status not in ('in_review', 'approved', 'declined') then raise exception 'Choose in review, approved or declined.' using errcode = '22023'; end if;
  update public.housing_applications
     set status = p_status, staff_note = coalesce(nullif(trim(p_note), ''), staff_note),
         decided_by = public.auth_person_id(), decided_at = now()
   where id = p_id and status in ('submitted', 'in_review', 'approved');
  if not found then raise exception 'That application can''t be changed.' using errcode = '22023'; end if;
end $$;

-- Staff: an approved applicant moves in. Creates the stay with the standard terms.
create function public.move_in_resident(p_application uuid, p_move_in date, p_room text default null)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare v_app public.housing_applications; v_id uuid;
begin
  if not public.has_role('housing_staff') then raise exception 'Housing staff only.' using errcode = '42501'; end if;
  select * into v_app from public.housing_applications where id = p_application;
  if not found or v_app.status <> 'approved' then raise exception 'Only approved applications can move in.' using errcode = '22023'; end if;
  insert into public.housing_residencies (person_id, application_id, room, move_in_date)
  values (v_app.person_id, p_application, nullif(trim(p_room), ''), p_move_in)
  returning id into v_id;
  return v_id;
exception when unique_violation then
  raise exception 'That person already has an active stay.' using errcode = '22023';
end $$;

create function public.record_housing_payment(p_residency uuid, p_amount_cents int, p_method public.payment_method, p_paid_at date default null, p_note text default null)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare v_id uuid;
begin
  if not (public.has_role('housing_staff') or public.has_role('finance_admin')) then raise exception 'Not allowed.' using errcode = '42501'; end if;
  insert into public.housing_payments (residency_id, amount_cents, method, paid_at, note, recorded_by)
  values (p_residency, p_amount_cents, p_method, coalesce(p_paid_at, (now() at time zone 'America/Chicago')::date), nullif(trim(p_note), ''), public.auth_person_id())
  returning id into v_id;
  return v_id;
end $$;

create function public.move_out_resident(p_residency uuid, p_date date, p_reason text)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.has_role('housing_staff') then raise exception 'Housing staff only.' using errcode = '42501'; end if;
  update public.housing_residencies set status = 'moved_out', move_out_date = p_date, move_out_reason = p_reason
   where id = p_residency and status = 'active' and p_date >= move_in_date;
  if not found then raise exception 'That stay can''t be closed with that date.' using errcode = '22023'; end if;
end $$;

create function public.set_resident_employed(p_residency uuid, p_employed boolean) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.has_role('housing_staff') then raise exception 'Housing staff only.' using errcode = '42501'; end if;
  update public.housing_residencies set employed = p_employed where id = p_residency;
end $$;

create function public.add_housing_checkin(p_residency uuid, p_note text, p_visible boolean default true)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare v_id uuid;
begin
  if not public.has_role('housing_staff') then raise exception 'Housing staff only.' using errcode = '42501'; end if;
  insert into public.housing_checkins (residency_id, staff_id, note, visible_to_resident)
  values (p_residency, public.auth_person_id(), trim(p_note), p_visible) returning id into v_id;
  return v_id;
end $$;

-- Residents set and tick off their own goals.
create function public.add_my_housing_goal(p_title text, p_target date default null)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare v_res uuid; v_id uuid;
begin
  select id into v_res from public.housing_residencies where person_id = public.auth_person_id() and status = 'active';
  if v_res is null then raise exception 'Goals are for current residents.' using errcode = '22023'; end if;
  insert into public.housing_goals (residency_id, title, target_date) values (v_res, trim(p_title), p_target) returning id into v_id;
  return v_id;
end $$;

create function public.complete_my_housing_goal(p_id uuid, p_done boolean default true) returns void
language sql security definer set search_path = ''
as $$ update public.housing_goals g set done_at = case when p_done then now() end
      where g.id = p_id and exists (select 1 from public.housing_residencies r where r.id = g.residency_id and r.person_id = public.auth_person_id()) $$;

-- What a resident's dashboard shows, worked out on the spot in Baton Rouge time.
create function public.housing_summary(p_residency uuid)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  r public.housing_residencies;
  v_today date := (now() at time zone 'America/Chicago')::date;
  v_end date;
  v_weeks int;
  v_paid int;
  v_charged int;
begin
  select * into r from public.housing_residencies where id = p_residency;
  if not found then return null; end if;
  if not (r.person_id = public.auth_person_id() or public.has_role('housing_staff') or public.has_role('finance_admin')) then
    raise exception 'Not allowed.' using errcode = '42501';
  end if;
  v_end := least(v_today, coalesce(r.move_out_date, v_today));
  v_weeks := greatest((v_end - r.move_in_date) / 7, 0);
  select coalesce(sum(amount_cents), 0) into v_paid from public.housing_payments where residency_id = p_residency;
  v_charged := r.deposit_cents + v_weeks * r.weekly_cents;
  return jsonb_build_object(
    'status', r.status, 'room', r.room, 'move_in_date', r.move_in_date, 'move_out_date', r.move_out_date,
    'days_housed', greatest(v_end - r.move_in_date, 0),
    'deposit_cents', r.deposit_cents, 'weekly_cents', r.weekly_cents,
    'paid_cents', v_paid, 'charged_cents', v_charged,
    'balance_cents', v_charged - v_paid,
    'deposit_paid', v_paid >= r.deposit_cents,
    'next_due', case when r.status = 'active' then r.move_in_date + 7 * (v_weeks + 1) end
  );
end $$;

revoke execute on function
  public.apply_for_housing(date, text, text, text, text, text), public.withdraw_housing_application(uuid),
  public.decide_housing_application(uuid, public.housing_application_status, text), public.move_in_resident(uuid, date, text),
  public.record_housing_payment(uuid, int, public.payment_method, date, text), public.move_out_resident(uuid, date, text),
  public.set_resident_employed(uuid, boolean), public.add_housing_checkin(uuid, text, boolean),
  public.add_my_housing_goal(text, date), public.complete_my_housing_goal(uuid, boolean), public.housing_summary(uuid)
  from public, anon;
grant execute on function
  public.apply_for_housing(date, text, text, text, text, text), public.withdraw_housing_application(uuid),
  public.decide_housing_application(uuid, public.housing_application_status, text), public.move_in_resident(uuid, date, text),
  public.record_housing_payment(uuid, int, public.payment_method, date, text), public.move_out_resident(uuid, date, text),
  public.set_resident_employed(uuid, boolean), public.add_housing_checkin(uuid, text, boolean),
  public.add_my_housing_goal(text, date), public.complete_my_housing_goal(uuid, boolean), public.housing_summary(uuid)
  to authenticated;
