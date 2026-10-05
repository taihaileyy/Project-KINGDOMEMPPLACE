import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DashboardBand } from "@/components/app-shell";
import { Panel, StatusPill, fmtDate } from "@/components/portal-ui";
import { hasRole, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Person" };

const money = (c: number) => (c / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

// The full record for one person. Each section reads through the viewer's own
// access, so staff only ever see the parts their role allows (for example,
// only finance sees gifts and only housing staff see housing).
export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff(["church_staff", "finance_admin"]);
  const { id } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase.from("people").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();

  const [m, enr, regs, studio, gifts, apps, stays, roles] = await Promise.all([
    supabase.from("church_memberships").select("status, joined_at").eq("person_id", id).maybeSingle(),
    supabase.from("program_enrollments").select("id, status, requested_at, programs(name)").eq("person_id", id).order("requested_at", { ascending: false }),
    supabase.from("event_registrations").select("id, status, guests, checked_in_at, events(title, starts_at)").eq("person_id", id).order("created_at", { ascending: false }),
    supabase.from("studio_requests").select("id, service, preferred_date, status").eq("person_id", id).order("preferred_date", { ascending: false }),
    supabase.from("gifts").select("id, amount_cents, given_at, status, funds(name)").eq("person_id", id).order("given_at", { ascending: false }).limit(20),
    supabase.from("housing_applications").select("id, status, created_at").eq("person_id", id),
    supabase.from("housing_residencies").select("id, status, move_in_date").eq("person_id", id),
    supabase.from("staff_role_assignments").select("role, scope").eq("person_id", id).is("revoked_at", null),
  ]);

  const field = (label: string, value: string | null | undefined) => (
    <div className="min-w-0"><dt className="text-sm text-muted">{label}</dt><dd className="break-words font-medium">{value || "-"}</dd></div>
  );
  const address = [p.address_line1, p.city, [p.state, p.postal_code].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  type Row = Record<string, unknown>;
  const list = (r: { data: unknown[] | null }) => (r.data ?? []) as Row[];

  return (
    <div className="grid gap-6">
      <DashboardBand title={`${p.first_name} ${p.last_name}`} lead={p.email ?? undefined}>
        <Link href="/admin/people" className="btn border border-white/25 text-white hover:bg-white/10">All people</Link>
      </DashboardBand>

      <Panel id="contact" title="Contact and profile">
        <dl className="grid gap-4 px-2 sm:grid-cols-2 lg:grid-cols-3">
          {field("First name", p.first_name)}
          {field("Last name", p.last_name)}
          {field("Preferred name", p.preferred_name)}
          {field("Email", p.email)}
          {field("Phone", p.phone)}
          {field("Date of birth", p.date_of_birth ? fmtDate(p.date_of_birth, { month: "long", day: "numeric", year: "numeric" }) : "")}
          {field("Address", address)}
          {field("Joined KEP", fmtDate(p.created_at, { month: "long", day: "numeric", year: "numeric" }))}
          {field("In the member directory", p.directory_visible ? "Yes" : "No")}
        </dl>
      </Panel>

      <Panel id="church" title="Church and roles">
        <div className="flex flex-wrap items-center gap-3 px-2 text-[15px]">
          {m.data ? <><StatusPill status={m.data.status as string} /><span>Member since {fmtDate(m.data.joined_at as string)}</span></> : <span className="text-muted">Not a church member.</span>}
        </div>
        {list(roles).length > 0 && (
          <p className="mt-3 flex flex-wrap gap-2 px-2">{list(roles).map((r, i) => <span key={i} className="rounded-full border border-line px-3 py-1 text-sm font-semibold">{String(r.role).replace("_", " ")}{r.scope ? ` (${r.scope})` : ""}</span>)}</p>
        )}
      </Panel>

      <Panel id="programs" title={`Programs (${list(enr).length})`}>
        {list(enr).length === 0 ? <p className="px-2 text-[15px] text-muted">None.</p> : (
          <ul>{list(enr).map((e) => <li key={String(e.id)} className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-2 py-2.5 first:border-t-0"><span>{(e.programs as { name: string } | null)?.name} <span className="text-sm text-muted">· {fmtDate(String(e.requested_at))}</span></span><StatusPill status={String(e.status)} /></li>)}</ul>
        )}
      </Panel>

      <Panel id="events" title={`Events (${list(regs).length})`}>
        {list(regs).length === 0 ? <p className="px-2 text-[15px] text-muted">None.</p> : (
          <ul>{list(regs).map((r) => { const ev = r.events as { title: string; starts_at: string } | null; return <li key={String(r.id)} className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-2 py-2.5 first:border-t-0"><span>{ev?.title} <span className="text-sm text-muted">· {ev ? fmtDate(ev.starts_at) : ""}{Number(r.guests) ? ` · +${r.guests}` : ""}</span></span><StatusPill status={r.checked_in_at ? "completed" : String(r.status)} /></li>; })}</ul>
        )}
      </Panel>

      {list(studio).length > 0 && (
        <Panel id="studio" title="Studio requests">
          <ul>{list(studio).map((s) => <li key={String(s.id)} className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-2 py-2.5 first:border-t-0"><span>{String(s.service)} <span className="text-sm text-muted">· {fmtDate(String(s.preferred_date))}</span></span><StatusPill status={String(s.status)} /></li>)}</ul>
        </Panel>
      )}

      {hasRole(session, "finance_admin") && (
        <Panel id="giving" title="Giving">
          {list(gifts).length === 0 ? <p className="px-2 text-[15px] text-muted">No gifts on record.</p> : (
            <ul>{list(gifts).map((g) => <li key={String(g.id)} className="flex justify-between border-t border-line px-2 py-2.5 first:border-t-0"><span>{fmtDate(String(g.given_at))} <span className="text-sm text-muted">· {(g.funds as { name: string } | null)?.name}</span></span><span className="font-semibold">{money(Number(g.amount_cents))}</span></li>)}</ul>
          )}
        </Panel>
      )}

      {(list(apps).length > 0 || list(stays).length > 0) && (
        <Panel id="housing" title="Housing">
          <ul className="px-2 text-[15px]">
            {list(apps).map((a) => <li key={String(a.id)} className="py-1">Application: <StatusPill status={String(a.status)} /> <span className="text-sm text-muted">{fmtDate(String(a.created_at))}</span></li>)}
            {list(stays).map((s) => <li key={String(s.id)} className="py-1"><Link href={`/admin/housing/residents/${s.id}`} className="font-semibold text-blue hover:underline">Stay since {fmtDate(String(s.move_in_date))}</Link> <StatusPill status={String(s.status) === "active" ? "active" : "completed"} /></li>)}
          </ul>
        </Panel>
      )}
    </div>
  );
}
