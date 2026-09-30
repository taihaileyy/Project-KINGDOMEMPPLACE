# Kingdom Empowerment Place platform

One app for KEP's public website, member portal (`/portal`) and staff dashboard (`/admin`).
The plan and every design decision are in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

**Stack:** Next.js 15 (App Router, TypeScript) · Tailwind CSS 4 · Supabase (Postgres, Auth, Row Level Security) · deployed to Cloudflare Workers with OpenNext.

## What's built so far (Phase 0: foundations)

- One `people` record per human. Signing up creates it, and a guest record with the same email (from an event or studio request) is merged in **only after the email is verified**.
- Staff roles (`super_admin`, `finance_admin`, `housing_staff`, `program_staff`, `church_staff`), managed only by super admins.
- Row Level Security on every table, plus an audit log of changes to people and roles.
- Log in, create account, email confirmation, forgot/change password, and profile editing.
- `/portal` (any signed-in person) and `/admin` (staff only), both checked on the server.

## Phase 1: public website

Home, About, Church, Programs (plus a page per program), Housing, Events, Book the Studio, Give and Privacy. Every page works on phone and desktop.

Content comes from Mr. Morgan's intake form and KEP's flyers, and lives in `src/content/site.ts`. Photos are in `public/images/`, converted to WebP with location data stripped. Until the events, programs, studio and giving modules are built, those pages show information plus a call or email action instead of a live form.

Items for KEP to confirm are listed in `docs/ARCHITECTURE.md` under "Open questions".

## Public impact numbers

`public_impact()` returns aggregate totals for a future public impact page, never names or money. Every metric starts hidden, and a total under 5 comes back as null ("fewer than 5"). A super admin switches one on in the SQL Editor (a settings screen comes with the admin dashboard):

```sql
update public.impact_metrics set is_public = true where key = 'people_served';
```

Metrics for modules that aren't built yet (housing, programs, events) are listed in the table but return nothing until those modules add their counts.

## Online giving (Stripe)

`/give` works for guests and signed-in members. Signed-in gifts show in **My Giving** straight away. A guest's gift is linked to their email and moves into their account if they later sign up and verify that same email. Until the four secrets below are set, the Give button stays off and the page points people to in-person giving.

1. Create KEP's Stripe account at stripe.com.
2. **Stripe → Developers → API keys:** copy the **Secret key**.
3. **Stripe → Developers → Webhooks → Add endpoint:** URL `https://<site>/api/stripe/webhook`, with the events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid` and `charge.refunded`. Copy the **Signing secret**.
4. **Supabase → Project Settings → API Keys:** copy the **secret** key (or the legacy `service_role` key).
5. **Cloudflare → Workers & Pages → project-kingdomempplace → Settings → Variables and Secrets**, add as **Secrets**:
   `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`. Then redeploy.

Card and bank details stay with Stripe; KEP stores only Stripe's reference IDs. Never put these keys in a `NEXT_PUBLIC_` variable.

## Studio booking requests

`/studio/book` saves requests to `public.studio_requests` (guests or members, all start as pending). Until the admin studio screen is built, a super admin can see them in the Supabase **SQL Editor**:

```sql
select created_at, name, email, phone, service, preferred_date, start_time, duration_minutes, attendees, details, status
from public.studio_requests order by created_at desc;
```

## Run it locally

```bash
npm install
npm run dev                    # http://localhost:3000
```

Checks (the same ones CI runs):

```bash
npm run lint
npm run typecheck
npm run build
npm run test:db     # applies every migration to a throwaway Postgres and tests the access rules
```

## Set up Supabase (one time)

**Live project:** `kep-platform` (ref `njnuvgitrryxbdmfuugx`, region us-east-1) in the **KingdomEmpPlace** Supabase organization.
URL: `https://njnuvgitrryxbdmfuugx.supabase.co`. Every migration in `supabase/migrations/` up to `20260926020000` has been applied.
The organization is on the **free plan**. Upgrade it to Pro before real member data goes in (daily backups; free projects pause when idle).

To set up a fresh project instead:

1. Create a new Supabase project for KEP, on a **paid plan** (daily backups; free projects pause when idle).
2. Apply the migrations in `supabase/migrations/` in order. Either:
   - run `npx supabase link --project-ref <ref>` then `npx supabase db push`, or
   - paste each file into **SQL Editor → New query → Run**.
3. **Authentication → URL Configuration:** set Site URL to the live site (today `https://project-kingdomempplace.kingdomempplace.workers.dev`), and add `http://localhost:3000/**` to Redirect URLs.
4. Email templates can stay as Supabase's defaults; `/auth/confirm` handles their links.
5. **Authentication → Providers → Email:** keep "Confirm email" on.
6. Make the first super admin. Once that person has signed up and confirmed their email, run in the SQL Editor:
   ```sql
   insert into public.staff_role_assignments (person_id, role)
   select id, 'super_admin' from public.people where email = 'their-email@example.com';
   ```
   After that, super admins grant other staff roles from inside the app.

Never put the **service-role** key in a `NEXT_PUBLIC_` variable or in any browser code.

## Deploy to Cloudflare

1. In Cloudflare: **Workers & Pages → Create → Import a repository**, pick this repo.
2. Build command: `npx opennextjs-cloudflare build` · Deploy command: `npx opennextjs-cloudflare deploy`.
3. No variables are needed: the site defaults to KEP's Supabase project. The Worker name must match `name` in `wrangler.jsonc`.
4. Add the custom domain under **Settings → Domains & Routes**.

From a terminal instead: `npx wrangler login`, then `npm run deploy`.

## Project layout

```
src/app/(auth)/        log in, sign up, forgot password
src/app/auth/          email confirmation + sign-out endpoints
src/app/portal/        member portal ("My KEP")
src/app/admin/         staff dashboard
src/lib/auth.ts        session, requireUser(), requireStaff()
src/lib/supabase/      Supabase clients (server + middleware)
supabase/migrations/   database schema and access rules
supabase/tests/        access-rule tests run by scripts/db-test.sh
docs/ARCHITECTURE.md   the approved plan
```
