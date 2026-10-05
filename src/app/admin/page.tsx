import Link from "next/link";
import type { Metadata } from "next";
import { AlertCircle, CalendarDays, CircleDollarSign, Home, Mic, Users, UsersRound, type LucideIcon } from "lucide-react";
import { DashboardBand } from "@/components/app-shell";
import { Panel, fmtDate } from "@/components/portal-ui";
import { canManageEvents, canManagePrograms, canManageStudio, displayName, hasRole, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Staff dashboard" };

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin", finance_admin: "Finance Admin", housing_staff: "Housing Staff", program_staff: "Program Staff", church_staff: "Church Staff",
};

type Card = { href: string; label: string; value: string; sub?: string; Icon: LucideIcon; warn?: boolean };
type Attention = { href: string; text: string; sub?: string };

const money = (c: number) => (c / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const session = await requireStaff();
  const { denied } = await searchParams;
  const supabase = await createClient();
  const head = { count: "exact", head: true } as const;
  const nowISO = new Date().toISOString();
  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();

  const cards: Card[] = [];
  const attention: Attention[] = [];
  const pending: PromiseLike<unknown>[] = [];

  if (hasRole(session, "church_staff") || hasRole(session, "finance_admin")) {
    pending.push(
      Promise.all([
        supabase.from("people").select("id", head).is("merged_into_id", null).is("deleted_at", null),
        supabase.from("church_memberships").select("id", head).eq("status", "active"),
      ]).then(([p, m]) => {
        cards.push({ href: "/admin/people", label: "People", value: String(p.count ?? 0), Icon: UsersRound });
        if (hasRole(session, "church_staff")) cards.push({ href: "/admin/people?member=1", label: "Church members", value: String(m.count ?? 0), Icon: Users });
      }),
    );
  }
  if (canManagePrograms(session)) {
    pending.push(
      Promise.all([
        supabase.from("program_enrollments").select("id", head).eq("status", "pending"),
        supabase.from("program_enrollments").select("id", head).eq("status", "approved"),
        supabase.from("program_enrollments").select("id, program_id, requested_at, programs(name), people!program_enrollments_person_id_fkey(first_name, last_name)").eq("status", "pending").order("requested_at").limit(5),
      ]).then(([w, a, list]) => {
        cards.push({ href: "/admin/programs", label: "Program requests waiting", value: String(w.count ?? 0), sub: `${a.count ?? 0} people enrolled`, Icon: Users, warn: (w.count ?? 0) > 0 });
        for (const r of (list.data ?? []) as unknown as { id: string; program_id: string; requested_at: string; programs: { name: string } | null; people: { first_name: string; last_name: string } | null }[])
          attention.push({ href: `/admin/programs/${r.program_id}`, text: `${r.people?.first_name} ${r.people?.last_name} asked to join ${r.programs?.name}`, sub: fmtDate(r.requested_at) });
      }),
    );
  }
  if (hasRole(session, "housing_staff")) {
    pending.push(
      Promise.all([
        supabase.from("housing_applications").select("id, created_at, status, people!housing_applications_person_id_fkey(first_name, last_name)").in("status", ["submitted", "in_review", "approved"]).order("created_at").limit(5),
        supabase.from("housing_residencies").select("id, people!housing_residencies_person_id_fkey(first_name, last_name)").eq("status", "active"),
      ]).then(async ([apps, stays]) => {
        const list = (apps.data ?? []) as unknown as { id: string; created_at: string; status: string; people: { first_name: string; last_name: string } | null }[];
        const residents = (stays.data ?? []) as unknown as { id: string; people: { first_name: string; last_name: string } | null }[];
        const sums = await Promise.all(residents.map((r) => supabase.rpc("housing_summary", { p_residency: r.id })));
        const owing = residents.map((r, i) => ({ r, s: sums[i].data as { balance_cents: number } | null })).filter((x) => x.s && x.s.balance_cents > 0);
        cards.push({ href: "/admin/housing", label: "Housing applications", value: String(list.length), sub: "waiting for action", Icon: Home, warn: list.length > 0 });
        cards.push({ href: "/admin/housing", label: "Residents", value: String(residents.length), sub: owing.length ? `${owing.length} with a balance owed` : "all paid up", Icon: Home, warn: owing.length > 0 });
        for (const a of list) attention.push({ href: "/admin/housing", text: `Housing application from ${a.people?.first_name} ${a.people?.last_name} (${a.status.replace("_", " ")})`, sub: fmtDate(a.created_at) });
        for (const o of owing.slice(0, 5)) attention.push({ href: `/admin/housing/residents/${o.r.id}`, text: `${o.r.people?.first_name} ${o.r.people?.last_name} owes ${money(o.s!.balance_cents)}` });
      }),
    );
  }
  if (canManageEvents(session)) {
    pending.push(
      Promise.all([
        supabase.from("events").select("id", head).gte("starts_at", nowISO),
        supabase.from("event_registrations").select("id, events!inner(starts_at)", head).eq("status", "registered").gte("events.starts_at", nowISO),
      ]).then(([e, r]) => cards.push({ href: "/admin/events", label: "Upcoming events", value: String(e.count ?? 0), sub: `${r.count ?? 0} registrations`, Icon: CalendarDays })),
    );
  }
  if (canManageStudio(session)) {
    pending.push(
      Promise.all([
        supabase.from("studio_requests").select("id, name, preferred_date", { count: "exact" }).eq("status", "pending").order("preferred_date").limit(5),
        supabase.from("studio_requests").select("id", head).eq("status", "approved").gte("preferred_date", new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date())),
      ]).then(([p, a]) => {
        cards.push({ href: "/admin/studio", label: "Studio requests waiting", value: String(p.count ?? 0), sub: `${a.count ?? 0} upcoming bookings`, Icon: Mic, warn: (p.count ?? 0) > 0 });
        for (const r of (p.data ?? []) as { id: string; name: string; preferred_date: string }[]) attention.push({ href: "/admin/studio", text: `Studio request from ${r.name}`, sub: fmtDate(r.preferred_date) });
      }),
    );
  }
  if (hasRole(session, "finance_admin")) {
    pending.push(
      Promise.resolve(supabase.from("gifts").select("amount_cents").eq("status", "succeeded").gte("given_at", monthStart)).then(({ data }) => {
        const total = (data ?? []).reduce((s, g) => s + (g.amount_cents as number), 0);
        cards.push({ href: "/admin/giving", label: "Given this month", value: money(total), sub: `${(data ?? []).length} gifts`, Icon: CircleDollarSign });
      }),
    );
  }
  await Promise.all(pending);
  const order = ["People", "Church members", "Program requests waiting", "Housing applications", "Residents", "Upcoming events", "Studio requests waiting", "Given this month"];
  cards.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));

  return (
    <div className="grid gap-6">
      {denied && <p role="alert" className="rounded-[var(--radius-control)] border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">You don&apos;t have access to that area.</p>}
      <DashboardBand title="Dashboard" lead={`Signed in as ${displayName(session.person)}. Live numbers for the parts of KEP you look after. Select any card to see the list behind it.`}>
        <ul aria-label="Your access" className="flex flex-wrap gap-2">
          {session.roles.map((r, i) => (
            <li key={i} className="rounded-full border border-electric/40 bg-electric/15 px-3 py-1 text-sm font-semibold text-white">{roleLabels[r.role] ?? r.role}</li>
          ))}
        </ul>
      </DashboardBand>

      <section aria-label="Numbers" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className={`group rounded-3xl border bg-paper p-4 transition-colors hover:border-blue sm:p-5 ${c.warn ? "border-warning/40" : "border-line"}`}>
            <c.Icon aria-hidden="true" className={`size-5 ${c.warn ? "text-warning" : "text-blue"}`} strokeWidth={1.6} />
            <p className="mt-3 font-display text-4xl font-medium leading-none">{c.value}</p>
            <p className="mt-1.5 text-[15px] font-semibold leading-tight group-hover:text-blue">{c.label}</p>
            {c.sub && <p className="text-sm text-muted">{c.sub}</p>}
          </Link>
        ))}
      </section>

      <Panel id="attention" title="Needs attention">
        {attention.length === 0 ? (
          <p className="flex items-center gap-2 px-2 text-[15px] text-muted"><AlertCircle aria-hidden="true" className="size-5 text-success" strokeWidth={1.6} />Nothing is waiting on you right now.</p>
        ) : (
          <ul>{attention.slice(0, 12).map((a, i) => (
            <li key={i} className="border-t border-line first:border-t-0">
              <Link href={a.href} className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-2 py-3 hover:bg-surface">
                <span className="font-medium">{a.text}</span>{a.sub && <span className="text-sm text-muted">{a.sub}</span>}
              </Link>
            </li>
          ))}</ul>
        )}
      </Panel>
    </div>
  );
}
