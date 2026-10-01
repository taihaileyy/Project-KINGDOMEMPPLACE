-- Giving. Anyone can give online, with or without an account. Gifts are
-- recorded only by the payment webhook (server-side, service role) or by
-- finance staff for cash and checks. Members see only their own gifts;
-- finance admins see everything. Card and bank details never reach KEP:
-- Stripe holds them and we store only Stripe's reference IDs.

create table public.funds (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name        text not null check (char_length(name) <= 60),
  description text check (char_length(description) <= 200),
  active      boolean not null default true,
  sort_order  int not null default 0
);

insert into public.funds (slug, name, description, sort_order) values
  ('tithe',    'Tithe',          'Returning a tenth as an act of worship.',              10),
  ('offering', 'Offering',       'Gifts beyond the tithe for the work of the church.',   20),
  ('special',  'Special giving', 'Support for a specific need, event or program.',       30),
  ('other',    'Other',          'Anything else you''d like to give toward.',            40);

alter table public.funds enable row level security;
create policy funds_select_active on public.funds for select to anon, authenticated using (active);
create policy funds_write_finance on public.funds for all to authenticated
  using ((select public.has_role('finance_admin'))) with check ((select public.has_role('finance_admin')));
grant select on public.funds to anon;

create type public.gift_kind as enum ('one_time', 'recurring');
create type public.gift_method as enum ('card', 'bank', 'cash', 'check', 'other');
create type public.gift_status as enum ('succeeded', 'refunded');

create table public.gifts (
  id                     uuid primary key default gen_random_uuid(),
  person_id              uuid references public.people (id) on delete set null,
  fund_id                uuid not null references public.funds (id),
  amount_cents           int not null check (amount_cents between 100 and 10000000),
  currency               text not null default 'usd' check (currency = 'usd'),
  kind                   public.gift_kind not null default 'one_time',
  method                 public.gift_method not null,
  status                 public.gift_status not null default 'succeeded',
  donor_name             text check (char_length(donor_name) <= 200),
  donor_email            extensions.citext check (char_length(donor_email) <= 320),
  stripe_ref             text unique,          -- payment intent or invoice ID; makes webhooks idempotent
  stripe_subscription_id text,
  given_at               timestamptz not null default now(),
  recorded_by            uuid references public.people (id),
  note                   text check (char_length(note) <= 500),
  created_at             timestamptz not null default now()
);

create index gifts_person_idx on public.gifts (person_id, given_at desc) where person_id is not null;
create index gifts_fund_idx on public.gifts (fund_id);
create index gifts_given_at_idx on public.gifts (given_at desc);
create index gifts_recorded_by_idx on public.gifts (recorded_by) where recorded_by is not null;

create trigger gifts_audit after insert or update or delete on public.gifts
  for each row execute function public.audit_row();

alter table public.gifts enable row level security;

create policy gifts_select_own on public.gifts
  for select to authenticated
  using (person_id = (select public.auth_person_id()));

create policy gifts_select_finance on public.gifts
  for select to authenticated
  using ((select public.has_role('finance_admin')));

-- Finance staff record cash and check gifts; online gifts come from the webhook.
create policy gifts_insert_finance on public.gifts
  for insert to authenticated
  with check ((select public.has_role('finance_admin')) and method in ('cash', 'check', 'other'));

create policy gifts_update_finance on public.gifts
  for update to authenticated
  using ((select public.has_role('finance_admin')))
  with check ((select public.has_role('finance_admin')));

revoke all on public.gifts from anon;
revoke delete on public.gifts from authenticated;

-- Called by the Stripe webhook with the service role only. Links the gift to
-- the giver's profile: their account when they gave while signed in,
-- otherwise a guest profile for their email. When that person later creates
-- an account and verifies the same email, claim_guest_records moves the
-- gifts into it, so their full history appears in My Giving.
create function public.record_online_gift(
  p_stripe_ref text,
  p_fund_slug text,
  p_amount_cents int,
  p_kind public.gift_kind,
  p_method public.gift_method,
  p_email text,
  p_name text,
  p_person_id uuid,
  p_subscription_id text
)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_person uuid := p_person_id;
  v_fund uuid;
  v_gift uuid;
  v_first text;
  v_last text;
begin
  select id into v_gift from public.gifts where stripe_ref = p_stripe_ref;
  if v_gift is not null then return v_gift; end if;

  select id into v_fund from public.funds where slug = p_fund_slug;
  if v_fund is null then select id into v_fund from public.funds where slug = 'other'; end if;

  if v_person is not null and not exists (select 1 from public.people where id = v_person and merged_into_id is null) then
    v_person := null;
  end if;

  if v_person is null and p_email is not null then
    select id into v_person from public.people
    where email = p_email::extensions.citext and auth_user_id is null and merged_into_id is null
    order by created_at limit 1;

    if v_person is null then
      v_first := split_part(trim(coalesce(p_name, '')), ' ', 1);
      v_last := trim(substr(trim(coalesce(p_name, '')), length(v_first) + 1));
      insert into public.people (email, first_name, last_name)
      values (lower(trim(p_email)), left(v_first, 100), left(v_last, 100))
      returning id into v_person;
    end if;
  end if;

  insert into public.gifts (person_id, fund_id, amount_cents, kind, method, donor_name, donor_email,
                            stripe_ref, stripe_subscription_id)
  values (v_person, v_fund, p_amount_cents, p_kind, p_method, nullif(trim(p_name), ''), nullif(lower(trim(p_email)), ''),
          p_stripe_ref, p_subscription_id)
  on conflict (stripe_ref) do nothing
  returning id into v_gift;
  return v_gift;
end $$;

create function public.mark_gift_refunded(p_stripe_ref text)
returns void
language sql security definer
set search_path = ''
as $$
  update public.gifts set status = 'refunded' where stripe_ref = p_stripe_ref
$$;

revoke execute on function public.record_online_gift(text, text, int, public.gift_kind, public.gift_method, text, text, uuid, text) from public, anon, authenticated;
revoke execute on function public.mark_gift_refunded(text) from public, anon, authenticated;
grant execute on function public.record_online_gift(text, text, int, public.gift_kind, public.gift_method, text, text, uuid, text) to service_role;
grant execute on function public.mark_gift_refunded(text) to service_role;

-- Guest records merge into an account on verified sign-up; move these too.
create or replace function public.repoint_person_refs(p_from uuid, p_to uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.staff_role_assignments set person_id = p_to where person_id = p_from;
  update public.studio_requests set person_id = p_to where person_id = p_from;
  update public.gifts set person_id = p_to where person_id = p_from;
end $$;
revoke execute on function public.repoint_person_refs(uuid, uuid) from public, anon, authenticated;
