# Kingdom Empowerment Place: Platform Architecture

Status: **proposal, awaiting approval.** No application code has been written yet.

This document covers the public website, the logged-in Community Portal, and the Staff/Admin Dashboard as one product. All three run on one codebase, one database, and one identity per person.

Contents

1. Recommended application architecture
2. Sitemap
3. Roles and permissions matrix
4. Database schema
5. Admin dashboard structure
6. Member dashboard structure
7. Housing workflow
8. Program enrollment workflow
9. Events workflow
10. Studio booking workflow
11. Giving and payment architecture
12. Development phases
13. Security, privacy, database and payment concerns
14. Design direction
15. Open questions

---

## 1. Recommended application architecture

| Layer | Choice | Why |
|---|---|---|
| Web framework | **Next.js (App Router) + TypeScript** | Public pages render on the server for speed and SEO. The portal and admin use the same components and design system. Server Actions and Route Handlers keep privileged logic off the browser. |
| Database, auth, storage | **Supabase** (Postgres, Auth, Storage, Row Level Security) | You already use Supabase on BuiltbyTAI. Postgres gives us foreign keys, views, constraints and RLS, which the dashboard and privacy rules depend on. |
| UI | **Tailwind CSS + shadcn/ui (Radix)** with KEP design tokens | Accessible primitives (dialogs, menus, tables, date pickers) themed to the KEP brand rather than a stock look. |
| Charts | Recharts | Lightweight, works with server-fetched data. |
| Payments | **Stripe** (Checkout, Billing, Customer Portal, webhooks) | Handles one-time and recurring giving and optional housing/studio payments. Card and bank data never touch our servers. See §11. |
| Email | Resend or Postmark | Confirmations, approvals, receipts, reminders. |
| Hosting | **Cloudflare** (you already deploy there) or **Vercel** | Either works. Vercel is the lowest-friction host for Next.js; Cloudflare works through the OpenNext adapter. |
| Scheduled jobs | Supabase `pg_cron` | Generates weekly housing charges, marks past-due, expires stale booking holds. |

### How the three layers fit together

```
                 ┌───────────────────────────── Next.js app ─────────────────────────────┐
 Visitor ───────▶│  (public)   /  /about /church /programs /housing /events /studio /give │
                 │  (portal)   /portal/...   requires login; tabs derived from enrollments │
 Staff  ────────▶│  (admin)    /admin/...    requires a staff role; checked on the server  │
                 └──────────────┬───────────────────────────────┬───────────────────────────┘
                                │ user session (anon key + JWT)  │ server-only (service key)
                                ▼                                ▼
                 ┌──────────────── Supabase Postgres ──────────────────┐     ┌────────┐
                 │ people (one per human) ─┬─ church_memberships       │◀────│ Stripe │
                 │                         ├─ program_enrollments      │ web │        │
                 │                         ├─ housing_* (apps, stays,  │ hook└────────┘
                 │                         │   ledger, progress)       │
                 │                         ├─ event_registrations      │
                 │                         ├─ studio_bookings          │
                 │                         ├─ gifts                    │
                 │                         └─ staff_role_assignments   │
                 │ Row Level Security on every table · metric views    │
                 │ audit_log · pg_cron jobs                            │
                 └─────────────────────────────────────────────────────┘
```

**Authorization happens in two places:**

1. **Postgres RLS**, on every table. It is the real gate: even a hand-crafted API request with a valid login can only read rows the policy allows.
2. **Server-side checks** in each admin route and Server Action, for a clear error message and to stop work early.

Hiding buttons in the UI is only a convenience, never a control.

The Supabase **service-role key is used only in server code** for Stripe webhooks, cron jobs and guest submissions, and is never sent to the browser.

---

## 2. Sitemap

### Public website

```
/                         Home
/about                    Mission, story, leadership, locations, contact
/church                   Services & times, what to expect, ministries, Plan a Visit form
/programs                 All active programs (driven by the programs table)
  /programs/[slug]        Program detail, related events, "Apply / Join" CTA
/housing                  How housing works, costs ($100 deposit, $150/week), eligibility, FAQ
  /housing/apply          Housing application (requires a KEP account)
/events                   Public events list + calendar; filter by type
  /events/[slug]          Event detail + registration (guest or signed-in)
/studio                   Studio & media spaces, equipment, policies
  /studio/book            Booking flow (6 steps)
/give                     Giving options, one-time / recurring, other ways to give
/login  /signup  /reset-password  /auth/callback
/privacy  /terms
```

Primary nav: **About · Church · Programs · Housing · Events · Book the Studio · Give**, plus a **Log in** link and a **Create account** button. On mobile, a full-screen menu grouped as *Connect / Get Help / Create / Give*. It borrows the icon + title + one-line description pattern from the Cornerstone "Get Connected" drawer.

### Community Portal (`/portal`, any signed-in person)

```
/portal                   Home: next steps, upcoming events, cards for each area the person is in
/portal/profile           Name, contact, communication preferences, password, sessions
/portal/events            My registrations, tickets/QR check-in codes, past attendance
/portal/programs          My enrollments + "join another program"
/portal/church            Membership status, next steps (shown if member or joining)
/portal/giving            Give + MY giving history + year-end statement (own records only)
/portal/housing           ── only if the person has a housing application or stay ──
  /portal/housing/payments   Ledger, balance, next $150 due, pay online (if enabled)
  /portal/housing/progress   Goals, check-ins, employment
/portal/studio            My studio bookings (if any)
```

### Staff/Admin (`/admin`, staff roles only)

```
/admin                    Live dashboard (cards filtered by the viewer's roles)
/admin/people             Unified directory → person record with tabs for every area
  /admin/people/[id]
/admin/church             Members, membership changes, member directory export
/admin/programs           Programs CRUD
  /admin/programs/[id]    Participants, enrollment requests, program events
/admin/housing            Applications queue, residents, beds/units, move-ins/outs
  /admin/housing/applications/[id]
  /admin/housing/residents/[id]      Stay, ledger, progress, check-ins, exit
/admin/events             Events CRUD, registrations, check-in mode
  /admin/events/[id]/checkin         Tablet-friendly check-in screen
/admin/studio             Calendar (day/week/month), requests, blocks, resources
/admin/finance            Giving, funds, housing payments, balances, exports   (finance only)
/admin/settings           Staff & roles, program types, funds, housing rates    (super admin)
/admin/audit              Audit log                                             (super admin)
```

---

## 3. Roles and permissions matrix

Roles live in `staff_role_assignments` and can be combined; one person can hold several. **Program Staff are scoped to specific programs.** Access to member-facing areas is not a role: it comes from the person's own records, such as an active housing stay.

Legend: **✓** full · **R** read · **own** own records only · **scoped** only assigned programs · **–** none

| Capability | Super Admin | Finance Admin | Housing Staff | Program Staff | Church Staff | General User |
|---|---|---|---|---|---|---|
| Dashboard: people / membership metrics | ✓ | R | – | – | ✓ | – |
| Dashboard: housing metrics (non-financial) | ✓ | – | ✓ | – | – | – |
| Dashboard: program metrics | ✓ | – | R (housing-linked programs) | scoped | – | – |
| Dashboard: financial metrics | ✓ | ✓ | – | – | – | – |
| People directory: basic contact info | ✓ | R | R (residents & applicants) | scoped participants | ✓ | own |
| Church memberships | ✓ | R | – | – | ✓ | own |
| Giving records (org-wide) | ✓ | ✓ | – | – | – | own |
| Housing applications & stays | ✓ | – | ✓ | – | – | own |
| Housing ledger (charges & payments) | ✓ | ✓ | ✓ (residents' accounts) | – | – | own |
| Resident progress & check-ins | ✓ | – | ✓ | – | – | own (non-private notes) |
| Programs: create/edit | ✓ | – | – | – | – | – |
| Program enrollments | ✓ | – | R (their residents) | scoped | – | own |
| Events: create/edit | ✓ | – | ✓ (housing events) | scoped | ✓ | – |
| Event registrations & check-in | ✓ | – | scoped to their events | scoped | ✓ | own |
| Studio calendar & approvals | ✓ | – | – | ✓ if assigned `studio` scope | – | own bookings |
| Staff roles & settings | ✓ | – | – | – | – | – |
| Audit log | ✓ | – | – | – | – | – |

Notes:
- **Housing Staff do not see giving.** Finance Admins see money, not case notes.
- A studio coordinator is modeled as Program Staff scoped to a "Studio" scope, so there's no extra hard-coded role.
- Super Admin should be 1–2 people. Staff roles require multi-factor authentication (see §13).

---

## 4. Database schema

All tables have `id uuid primary key default gen_random_uuid()`, `created_at` and `updated_at`. Enums are shown inline.

### Identity

```sql
people                       -- ONE row per human, with or without a login
  auth_user_id  uuid unique null references auth.users   -- null for guests/walk-ins
  first_name, last_name, preferred_name
  email citext null, phone null             -- partial unique index on lower(email)
  date_of_birth null                         -- only collected where needed (youth programs)
  address_line1, city, state, postal_code   -- optional
  directory_visible boolean default false    -- opt-in to member directory
  merged_into_id uuid null references people -- dedupe/merge trail
  created_by uuid null references people

guardians                    -- for minors in youth programs
  child_id → people, guardian_id → people, relationship, consent_signed_at

staff_role_assignments
  person_id → people
  role enum(super_admin, finance_admin, housing_staff, program_staff, church_staff)
  program_id null → programs          -- scope for program_staff
  scope text null                     -- e.g. 'studio'
  granted_by → people, revoked_at null
```

A trigger creates or links a `people` row when someone signs up. If an unlinked guest `people` row already has the same **verified** email, the new account claims it (see §13).

### Church

```sql
church_memberships
  person_id → people unique (one current membership row, history in membership_events)
  status enum(visitor, attending, joining, member, inactive, transferred)
  member_since date null
  campus text null, notes text (staff only)

membership_events            -- history for "new members this month"
  person_id, from_status, to_status, changed_by, changed_at
```

### Programs (not hard-coded)

```sql
programs
  name, slug unique, summary, description, image_path
  category text                -- e.g. youth, recovery, arts, business, media, tech
  status enum(draft, active, paused, archived)
  enrollment_mode enum(open, request, staff_only)
  is_sensitive boolean         -- true for Sober Living: hides roster from non-program staff
  min_age int null, max_age int null
  intake_fields jsonb          -- small, program-specific questions (no medical fields)

program_enrollments
  program_id → programs, person_id → people
  status enum(requested, active, completed, exited, declined, waitlisted)
  enrolled_at date, ended_at date null, exit_reason text null
  intake_answers jsonb
  unique (program_id, person_id) where status in ('requested','active','waitlisted')
```

The six starting programs are seed rows. New programs are added in the admin panel without code changes.

### Housing

```sql
housing_units                 -- houses/rooms/beds (optional but helps capacity)
  name, address, capacity, status

housing_rates                 -- so $100/$150 is data, not code
  deposit_cents default 10000, weekly_cents default 15000,
  effective_from date, charge_weekday int  -- which day weekly charges post

housing_applications
  person_id → people
  status enum(draft, submitted, under_review, approved, waitlisted, declined, withdrawn)
  desired_move_in date null
  referral_source text null     -- e.g. "treatment center", "church", "self"
  referral_contact text null
  employment_status_at_apply enum(...)
  household_notes text null     -- plain, non-medical
  agreements_signed_at timestamptz   -- house rules acknowledgment
  reviewed_by → people null, decided_at null, decision_note (staff only)

housing_stays                 -- enrollment / residency (portal access comes from this)
  person_id → people, application_id → housing_applications
  unit_id → housing_units null
  status enum(approved_pending_move_in, active, exited)
  move_in_date date null, expected_move_out date null, actual_move_out date null
  weekly_rate_cents, deposit_cents   -- copied from rates at approval
  exit_outcome enum(null, completed_program, moved_independent, moved_family,
                    returned_to_treatment, asked_to_leave, left_voluntarily, other)
  exit_note text null
  -- days/weeks housed are NOT stored: computed in a view from move_in_date and today/actual_move_out

housing_ledger_entries        -- one ledger, balance = sum(amount)
  stay_id → housing_stays
  kind enum(deposit_charge, weekly_charge, payment, credit, refund, adjustment)
  amount_cents int            -- charges positive, payments/credits negative
  period_start date null, due_date date null
  method enum(null, stripe, cash, check, money_order, cash_app, other)
  stripe_payment_intent_id text null unique
  recorded_by → people null, note text null
  -- rows are never updated or deleted; corrections are new adjustment rows

resident_progress             -- current snapshot, one row per stay
  stay_id unique, employment_status enum(unemployed, seeking, part_time, full_time, self_employed, unable, student)
  employer text null, employed_since date null
  goals jsonb                 -- [{title, target_date, status}]

resident_checkins             -- dated history
  stay_id, checkin_date, summary text, visibility enum(resident_visible, staff_only),
  recorded_by → people
```

Employment is recorded by staff or the resident. When `employment_status` changes to employed, a trigger writes `employed_since` if blank and logs the change, and the metrics update from that.

### Events

```sql
events
  title, slug, summary, description, image_path
  type enum(conference, workshop, church, community, program, internal)
  program_id → programs null
  starts_at timestamptz, ends_at timestamptz, timezone
  location_name, address null, virtual_url null   -- virtual_url shown only to registrants
  capacity int null, registration_deadline timestamptz null
  price_cents int default 0
  visibility enum(public, members, internal)
  registration_mode enum(none, rsvp, required)
  status enum(draft, published, cancelled, completed)

event_registrations
  event_id, person_id → people          -- guests get a people row with no login
  status enum(registered, waitlisted, cancelled)
  guest_count int default 0
  checkin_code text unique              -- for QR check-in
  payment_status enum(not_required, pending, paid, refunded)
  unique (event_id, person_id)

event_attendance
  event_id, person_id, checked_in_at, checked_in_by
  unique (event_id, person_id)
```

A capacity check runs inside a database function with a row lock, so two last-seat registrations can't both succeed.

### Studio

```sql
studio_resources              -- spaces and services, e.g. Podcast Room, Video Studio, Engineer
  name, slug, description, image_path, active
  min_minutes, max_minutes, slot_increment_minutes, buffer_minutes
  price_cents_per_hour int default 0   -- 0 today; payment can be switched on later
  requires_approval boolean default true

studio_availability           -- weekly opening hours per resource
  resource_id, weekday, opens_at time, closes_at time

studio_blocks                 -- staff-blocked time (maintenance, holidays, internal use)
  resource_id null (null = all), period tstzrange, reason

studio_bookings
  resource_id, person_id → people
  period tstzrange                     -- start/end in one column
  status enum(pending, approved, declined, cancelled, completed, no_show)
  purpose text, additional_needs text, attendee_count int
  price_cents, payment_status
  decided_by, decided_at, decline_reason

-- Prevents double booking at the database level:
alter table studio_bookings add constraint no_overlap
  exclude using gist (resource_id with =, period with &&)
  where (status in ('pending','approved'));
```

A pending request holds its slot until staff decline it, or until it expires after N days via cron. Blocks are checked in the same booking function.

### Giving

```sql
funds                         -- Tithes, Offerings, Special Giving, Other, plus future funds
  name, slug, active, is_restricted

gifts
  person_id → people null     -- null only for anonymous
  fund_id → funds
  amount_cents, currency default 'usd'
  kind enum(one_time, recurring)
  method enum(stripe_card, stripe_ach, cash, check, other)
  status enum(pending, succeeded, failed, refunded)
  stripe_payment_intent_id text unique null, stripe_subscription_id text null
  given_at timestamptz, recorded_by → people null   -- set for cash/check entry
  is_anonymous boolean default false

recurring_gifts               -- mirror of Stripe subscriptions for display
  person_id, fund_id, amount_cents, interval, stripe_subscription_id unique, status

stripe_customers
  person_id unique, stripe_customer_id unique
```

No card numbers, bank account numbers or CVV are ever stored. The app only stores Stripe IDs.

### Cross-cutting

```sql
audit_log                     -- who did what, append-only
  actor_id, action, table_name, record_id, changed_fields jsonb, at
notifications                 -- in-app notices
  person_id, kind, payload, read_at
```

### Row Level Security pattern

Two `security definer` helper functions are used everywhere:

```sql
auth_person_id()                        -- people.id for the current login
has_role(role, program_id default null) -- true if an active assignment exists
```

Example policies:

```sql
-- gifts: members see only their own; finance/super admins see all
create policy gifts_select on gifts for select using (
  person_id = auth_person_id() or has_role('finance_admin') or has_role('super_admin'));

-- housing_ledger_entries: the resident, housing staff, finance
create policy ledger_select on housing_ledger_entries for select using (
  exists (select 1 from housing_stays s where s.id = stay_id and s.person_id = auth_person_id())
  or has_role('housing_staff') or has_role('finance_admin') or has_role('super_admin'));

-- resident_checkins: residents never see staff_only notes
create policy checkins_select on resident_checkins for select using (
  has_role('housing_staff') or has_role('super_admin')
  or (visibility = 'resident_visible' and exists (
      select 1 from housing_stays s where s.id = stay_id and s.person_id = auth_person_id())));

-- events: anonymous visitors only see published public events
create policy events_public on events for select using (
  status = 'published' and (visibility = 'public'
   or (visibility = 'members' and auth.uid() is not null)
   or (visibility = 'internal' and is_staff())));
```

Every table has RLS enabled with no default access. Guest submissions (public event registration, studio request) go through a server route that validates input, rate-limits, and writes with the service role. Anonymous users never get insert rights on `people`.

---

## 5. Admin dashboard structure

Metrics are **SQL views and functions**, not typed totals. Each card is a query, and clicking it opens the same query as a filtered table (`/admin/people?filter=currently_housed`). The count and the list always match because they share one definition.

```
┌ Header: KEP logo · global search (people, events, bookings) · date range · my account ┐
│ Sidebar: Dashboard, People, Church, Programs, Housing, Events, Studio, Finance*,    │
│          Settings*   (* only if the role allows; hidden items are also blocked)   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Row 1 · Community      Registered people · Church members · New members (30d)       │
│ Row 2 · Housing        Currently housed · Open applications · Avg length of stay ·  │
│                         Residents employed (count and % of current residents)        │
│ Row 3 · Programs       Active participants (total) + one card per active program     │
│                         (generated from the programs table: new programs appear)     │
│ Row 4 · Events/Studio  Upcoming events · Registrations (30d) · Attendance rate ·     │
│                         Studio requests awaiting approval · Bookings this week       │
│ Row 5 · Finance*       Tithes · Offerings · Special/Other · Housing payments ·       │
│                         Outstanding housing balances · Past-due residents            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Charts: registrations over time (line) · program participation (bar) ·              │
│         housing occupancy & exits by outcome (bar) · giving by fund (finance only)  │
│ Needs attention: applications waiting > 3 days, past-due balances, pending bookings │
│ Recent activity: sign-ups, enrollments, check-ins, payments (role-filtered)          │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

Definitions that need to be agreed on (defaults proposed):

| Metric | Definition |
|---|---|
| Registered people | `people` rows with a login, not merged |
| Church members | `church_memberships.status = 'member'` |
| New members | status changed to member within the selected range |
| Currently housed | `housing_stays.status = 'active'` |
| Average length of stay | mean of (actual_move_out or today) − move_in_date, for stays in range |
| Residents who obtained employment | stays where `employed_since` ≥ move_in_date |
| Active program participants | distinct people with ≥1 active enrollment |
| Outstanding balances | sum of positive ledger balances on active stays |

Filters: date range, program, event type, housing unit. Every table view has CSV export, which is logged in the audit log. Financial exports are limited to finance roles.

Performance: live queries are fine at KEP's scale (thousands of rows). If needed later, the heavier views become materialized views refreshed every few minutes by `pg_cron`.

---

## 6. Member dashboard structure

The portal builds its navigation from the person's records, not from a setting someone has to remember to flip:

| Shown when | Section |
|---|---|
| Always | Home, My Profile, My Events, My Programs, Give / My Giving |
| Church membership exists | My Church |
| Housing application exists | Housing: application status only |
| Housing stay is active or exited | My Housing, Payments, Progress |
| Has studio bookings | My Studio Bookings |
| Has any staff role | "Staff dashboard" link |

```
Resident home (/portal):
┌ Welcome back, Marcus ─────────────────────────────────────────────┐
│ [Housing status: Active]  [Day 47 · Week 7]  [Deposit: Paid]      │
│ [Next payment: $150 due Fri Oct 2]  [Balance: $0.00 · Current]   │
│ Employment: Part-time since Sep 12 · 2 of 4 goals complete        │
│ Upcoming: Entrepreneurship workshop Tue 6pm · House meeting Sun   │
│ Recent payments ▸                                                  │
└───────────────────────────────────────────────────────────────────┘
```

Housing pages call RLS-protected views, so a resident's session physically cannot read another resident's rows.

---

## 7. Housing workflow

```
Housing info page ─▶ Create/sign in to KEP account ─▶ Application (short, non-medical)
      │                                                     │ status: submitted
      ▼                                                     ▼
 FAQ, costs, rules                        Staff review queue (Housing Staff notified)
                                                   │ under_review → approved / waitlisted / declined
                                                   ▼ (email + portal notice to applicant)
                                     Approved → housing_stay created (approved_pending_move_in)
                                                   │ deposit_charge $100 posted
                                                   ▼
                                     Move-in recorded (move_in_date, unit)
                                     → stay active → Housing Portal unlocks
                                     → weekly $150 charges post automatically (pg_cron)
                                                   │
                           Ongoing: payments recorded (Stripe or staff-entered cash/check)
                                    check-ins, goals, employment updates
                                                   ▼
                                     Exit: actual_move_out + exit_outcome
                                     → stay exited, portal becomes read-only history
```

Payment status is derived from the ledger:
- **Current**: balance ≤ 0.
- **Due**: a charge is due today or within the grace period.
- **Past due**: balance > 0 after the grace period.

The grace period and whether weekly charges prorate are settings to confirm (§15).

The application only asks for what's needed to decide on housing: contact info, desired move-in date, referral source, employment status, emergency contact, and agreement to the house rules. It has **no diagnosis, medication or treatment-history fields**, and free-text fields carry a note telling applicants not to include medical details.

---

## 8. Program enrollment workflow

```
/programs/[slug] ─▶ "Join" ─▶ sign in ─▶ short program-specific questions (intake_fields)
     │                                        │
     │  enrollment_mode = open     ──▶ active immediately
     │  enrollment_mode = request  ──▶ requested → Program Staff approve / waitlist / decline
     │  enrollment_mode = staff_only ─▶ no public button; staff add participants
     ▼
Active participants: roster, attendance at linked events, notes
Exit: completed / exited + ended_at + reason
```

A person can be active in any number of programs. **Youth programs** need a guardian record and consent before enrollment is active. **Sober Living** is marked `is_sensitive`, so its roster is visible only to its own program staff, housing staff and super admins, and never shows on the person's general profile to other staff.

---

## 9. Events workflow

```
Staff: create event (draft) → set visibility & registration mode → publish
Visitor (public event): view → register with name + email (+ phone optional)
   → server matches or creates a people row (no login needed)
   → confirmation email with QR code and calendar file
Signed-in user: one-tap register (profile already known)
Members-only: visible and registrable after login; internal: staff only
Capacity full → waitlist; cancellation promotes next person (automatic)
Deadline passed → registration closes automatically
Event day: /admin/events/[id]/checkin (scan QR or search name) → event_attendance row
After: attendance rate, no-shows, follow-up list
Paid events: registration → Stripe Checkout → webhook marks paid
```

Guest matching rule: if the guest's email matches an existing person, the registration **attaches to that person record without revealing anything back to the visitor**. The response is always the same "You're registered" message, so the form can't be used to check whether someone has a KEP account.

---

## 10. Studio booking workflow

```
/studio (public info)  ─▶  /studio/book
  1 Choose space/service
  2 Pick date            (calendar greys out closed days and blocks)
  3 Pick start time      (only free slots, computed server-side from availability − bookings − blocks)
  4 Duration             (min/max/increment per resource)
  5 Contact info         (prefilled when signed in; guests allowed)
  6 Purpose / needs      → Submit → status pending (slot held)
     ▼
Admin calendar: day/week/month by resource · pending requests list
  Approve → confirmation email (+ payment link if priced)
  Decline → reason → slot released → email
  Block time → studio_blocks
Booking history per resource and per person; no-show / completed marking
```

Double booking is prevented by the Postgres exclusion constraint in §4, not just by the UI. Even two submissions arriving at the same millisecond cannot both succeed.

---

## 11. Giving and payment architecture

```
Browser ──▶ /give (choose fund, amount, one-time or monthly/weekly)
        ──▶ Server Action creates a Stripe Checkout Session
             (customer = person's Stripe customer if signed in; metadata: person_id, fund_id)
        ──▶ Stripe-hosted payment page (card, Apple/Google Pay, US bank account)
Stripe  ──▶ webhook /api/stripe/webhook (signature verified, idempotent)
             → insert/update gifts, recurring_gifts, housing_ledger_entries, event/studio payment_status
Member  ──▶ /portal/giving: own history · year-end statement PDF · "Manage recurring gifts"
             (opens Stripe Customer Portal to update card or cancel)
Finance ──▶ /admin/finance: totals by fund/date, record cash/check gifts, exports, refunds
```

- One provider handles giving, housing, event tickets and studio. Each payment carries a `purpose` in its metadata so the webhook routes it to the right table.
- **The webhook is the source of truth.** A payment is only "succeeded" when Stripe says so, never because the browser was redirected to a thank-you page.
- Cash, check and Cash App payments are entered by finance or housing staff. Those entries are logged in the audit log and can only be corrected with adjustment rows.
- ACH (bank) payments have much lower fees for tithes. Stripe offers nonprofit pricing to eligible 501(c)(3)s.
- If KEP already uses a church giving platform (Tithe.ly, Pushpay, etc.), the same `gifts` table can instead be fed by that platform's export or API. Tell me if that's the case.

---

## 12. Development phases

Each phase ends with a working, deployed slice you can review.

| Phase | Scope | Result |
|---|---|---|
| **0. Foundations** | Repo setup (Next.js, Tailwind, shadcn), design tokens from KEP brand, Supabase project, auth, `people`, roles, RLS helpers, audit log, CI (lint, typecheck, RLS tests) | Sign up / log in works; empty portal and admin shells with role gating |
| **1. Public website** | Home, About, Church, Programs, Housing info, Events list/detail (read-only), Studio info, Give (info only), mobile menu | New public site you can launch on its own |
| **2. Events + Programs** | Event CRUD, registration (guest + member), waitlist, QR check-in; program CRUD, enrollment flows, rosters | First live data flowing into the dashboard |
| **3. Studio booking** | Resources, availability, blocks, 6-step booking, admin calendar, approvals, emails | Studio reservations fully online |
| **4. Housing** | Application, review queue, stays, ledger + weekly charges, progress/check-ins, resident portal, exit outcomes | Housing run from the platform |
| **5. Giving + payments** | Stripe Checkout, recurring gifts, webhook, member giving history, statements, finance area; optional online housing payments | Online giving live |
| **6. Admin dashboard** | Metric views, cards, charts, drill-downs, filters, exports, needs-attention panel | Leadership dashboard live (it gets richer as each earlier phase adds data) |
| **7. Hardening** | Security review, RLS test suite complete, accessibility audit, performance, backups, staff training docs, data import from spreadsheets | Production-ready |

The dashboard shell can be built early (Phase 2) and grow as each module lands. It's listed last because its numbers depend on the other modules.

---

## 13. Security, privacy, database and payment concerns

**Identity and accounts**
1. **Guest records vs. accounts.** Event and studio guests create `people` rows without logins. A new sign-up may **only claim an existing record after verifying that email address**; otherwise anyone could type someone else's email and inherit their history. Records that don't auto-match go to a staff "possible duplicates" queue with a merge tool that re-points all foreign keys.
2. **No account enumeration.** Public forms respond identically whether or not an email already exists.
3. **Staff accounts require MFA** (Supabase TOTP), and staff sessions are shorter.

**Sensitive data**

4. **Sober Living and housing referrals are health-adjacent.** Program membership alone can reveal substance-use history. We keep medical data out entirely, mark the program sensitive, restrict its roster, and log every view of housing records. If KEP receives federal funding for substance-use services, 42 CFR Part 2 confidentiality rules may apply, which is worth a quick check with counsel. HIPAA generally doesn't apply unless KEP is a healthcare provider billing insurance.
5. **Minors.** Youth Mentorship involves children. Collect date of birth only there, require a linked guardian with consent, don't list minors in the member directory, and have guardians hold the account for under-13s (COPPA).
6. **Staff notes.** Staff-only check-in notes should be factual. Staff need guidance that residents can request their records.
7. **Member directory is opt-in** (`directory_visible`), and directory access is limited to logged-in members, with phone and email hidden unless the person chooses to share them.

**Authorization**

8. RLS on every table, deny by default, and **automated tests that log in as each role** and confirm what it can't read. Missing RLS is the most common way Supabase apps leak data.
9. The service-role key is used only in server code, is kept in environment secrets, and is never exposed via `NEXT_PUBLIC_*`.
10. Financial numbers are only computed in functions that check `finance_admin`/`super_admin`, so the dashboard can't accidentally return them to other roles.

**Payments**

11. Stripe-hosted Checkout keeps card and bank data off our servers (PCI SAQ-A). Webhooks are signature-verified and idempotent, keyed on Stripe event ID.
12. Ledgers are append-only: no editing or deleting money rows; corrections are adjustments with a reason.
13. Refunds and cash entry are finance-only and audit-logged.

**Database and operations**

14. Days housed, balances and statuses are **computed, not stored**, so they never drift out of date.
15. Time zones are stored as `timestamptz` and displayed in KEP's local time zone, which matters for weekly charges and bookings around midnight.
16. The paid Supabase plan includes daily backups and point-in-time recovery. The free plan pauses inactive projects, which isn't acceptable for this.
17. Spam protection (Cloudflare Turnstile) and rate limits on every public form.
18. A privacy policy page explaining what's collected and why, plus a way to request data export or deletion. Financial records stay retained for tax reasons.

---

## 14. Design direction

KEP's own logo and colors come first. The reference site (Cornerstone Athens) contributes structure, not branding:
- the floating pill-shaped nav bar
- large bold sans-serif headlines
- image-topped event cards with date and time rows and a clear "Sign up" action
- the slide-out "Get Connected" menu, where every item has an icon, a title and a one-line description

**Palette:** mostly white surfaces with near-black type, KEP blue for actions and links, and full-bleed black sections used sparingly (studio and media, events hero, footer). The blue will be matched to your logo file, so I need the exact brand hex (see §15). Each color pair will be contrast-checked to WCAG AA.

**Type:** one strong grotesque sans for headlines, set large and tight like the reference, plus a highly readable body face. If KEP already has brand fonts, we use those.

**The one signature element:** a **"Find your place at KEP" chooser** in the hero, for example "I'm looking for… church · housing · a program · the studio · an event". It routes people straight to the right section. It answers the real problem KEP's site has to solve, which is showing an organization that is church, housing, programs and studio at once, without looking like a church template or a corporate site.

**Kept restrained:** consistent 12–16px corner radius on cards, one soft shadow level, one page-load moment only, and reduced motion respected. There's no tracked-out all-caps label above every heading.

**The portal and admin share the same tokens and components**, so logging in feels like entering the same place rather than a separate app. The admin uses a denser spacing scale.

Checks: 375 / 768 / 1024 / 1440 px breakpoints, visible keyboard focus, 44px touch targets, labelled form fields with inline errors.

---

## 15. Open questions

These change what gets built. Everything else has a sensible default above.

1. **Brand assets:** logo files (SVG preferred), the exact blue (hex), and any brand fonts. Is there a current website I should pull copy and photos from?
2. **Hosting:** Cloudflare (like BuiltbyTAI) or Vercel? And a new Supabase project for KEP, or an existing one?
3. **Payments:** OK to use Stripe? Is KEP a registered 501(c)(3)? Does KEP already use a giving platform whose history needs importing?
4. **Housing payments:** do residents pay online, in person (cash, money order, Cash App), or both? Which weekday is rent due, is there a grace period or late fee, and is the first week prorated? Is the $100 deposit refundable, and under what conditions?
5. **Housing structure:** how many houses, rooms or beds? Are Sober Living and Housing the same thing, or can someone be in housing without being in Sober Living?
6. **Studio:** which spaces and services (podcast room, video, recording, editing, engineer time)? Opening hours? Free for now, or priced? Who approves requests?
7. **Youth Mentorship:** what ages? Will minors have their own logins, or will guardians manage them?
8. **Church:** service times and locations, and what "becoming a member" involves (a class, a form, a pastor's approval)?
9. **Existing data:** are there spreadsheets of members, residents, program participants or giving to import?
10. **Staff:** roughly how many staff users, and who should be Super Admin?
