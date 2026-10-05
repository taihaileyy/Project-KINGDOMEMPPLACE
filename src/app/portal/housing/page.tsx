import Link from "next/link";
import type { Metadata } from "next";
import { CalendarClock, CircleDollarSign, Home, Target, Wallet } from "lucide-react";
import { DashboardBand } from "@/components/app-shell";
import { EmptyState, Panel, StatusPill, fmtDate } from "@/components/portal-ui";
import { requireAccess } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";
import { addGoal, toggleGoal, withdrawApplication } from "./actions";

export const metadata: Metadata = { title: "My Housing" };

const money = (c: number) => (c / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

type Summary = { status: string; room: string | null; move_in_date: string; move_out_date: string | null; days_housed: number; deposit_cents: number; weekly_cents: number; paid_cents: number; charged_cents: number; balance_cents: number; deposit_paid: boolean; next_due: string | null };
type Goal = { id: string; title: string; target_date: string | null; done_at: string | null };

export default async function MyHousing({ searchParams }: { searchParams: Promise<{ applied?: string }> }) {
  await requireAccess("housing", "/portal/housing");
  const { applied } = await searchParams;
  const supabase = await createClient();
  const [{ data: apps }, { data: stays }] = await Promise.all([
    supabase.from("housing_applications").select("id, status, created_at, desired_move_in").order("created_at", { ascending: false }),
    supabase.from("housing_residencies").select("id, status").order("created_at", { ascending: false }),
  ]);
  const stay = (stays ?? [])[0] as { id: string; status: string } | undefined;
  const latest = (apps ?? [])[0] as { id: string; status: string; created_at: string; desired_move_in: string | null } | undefined;

  let summary: Summary | null = null;
  let goals: Goal[] = [];
  let payments: { id: string; amount_cents: number; method: string; paid_at: string }[] = [];
  let checkins: { id: string; note: string; checked_in_on: string }[] = [];
  if (stay) {
    const [{ data: s }, { data: g }, { data: p }, { data: c }] = await Promise.all([
      supabase.rpc("housing_summary", { p_residency: stay.id }),
      supabase.from("housing_goals").select("id, title, target_date, done_at").eq("residency_id", stay.id).order("created_at"),
      supabase.from("housing_payments").select("id, amount_cents, method, paid_at").eq("residency_id", stay.id).order("paid_at", { ascending: false }).limit(20),
      supabase.from("housing_checkins").select("id, note, checked_in_on").eq("residency_id", stay.id).order("checked_in_on", { ascending: false }).limit(10),
    ]);
    summary = s as Summary;
    goals = (g ?? []) as Goal[];
    payments = (p ?? []) as typeof payments;
    checkins = (c ?? []) as typeof checkins;
  }

  const doneCount = goals.filter((g) => g.done_at).length;
  const pct = goals.length ? Math.round((doneCount / goals.length) * 100) : 0;

  return (
    <div className="grid gap-6">
      {applied && <p role="status" className="rounded-[var(--radius-control)] border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">Application sent. Our housing team will be in touch.</p>}
      <DashboardBand title="My Housing" lead={stay ? "Your stay at the KEP house." : "Your sober living application."} />

      {!stay && latest && (
        <Panel id="application" title="Your application">
          <div className="flex flex-wrap items-center justify-between gap-3 px-2">
            <div>
              <p className="font-semibold">Sent {fmtDate(latest.created_at)}</p>
              {latest.desired_move_in && <p className="text-[15px] text-muted">Hoping to move in around {fmtDate(latest.desired_move_in)}</p>}
            </div>
            <StatusPill status={latest.status} />
          </div>
          <p className="mt-3 px-2 text-[15px] text-muted">
            {latest.status === "submitted" && "We've received it. A member of our housing team will review it and contact you."}
            {latest.status === "in_review" && "Our team is reviewing your application."}
            {latest.status === "approved" && "You're approved! Our team will contact you to set your move-in date."}
            {latest.status === "declined" && "We weren't able to approve this application right now. Please call us if you'd like to talk."}
            {latest.status === "withdrawn" && "You withdrew this application."}
          </p>
          {(latest.status === "submitted" || latest.status === "in_review") && (
            <form action={withdrawApplication} className="mt-4 px-2">
              <input type="hidden" name="id" value={latest.id} />
              <button className="text-sm font-semibold text-muted underline underline-offset-4 hover:text-danger">Withdraw my application</button>
            </form>
          )}
          {(latest.status === "declined" || latest.status === "withdrawn") && <div className="mt-4 px-2"><Link href="/portal/housing/apply" className="btn-primary">Apply again</Link></div>}
        </Panel>
      )}

      {summary && (
        <>
          <Panel id="stay" title={summary.status === "active" ? "Your stay" : "Your stay (ended)"}>
            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat Icon={Home} label="Days housed" value={String(summary.days_housed)} sub={`Since ${fmtDate(summary.move_in_date)}`} />
              <Stat Icon={CircleDollarSign} label="Deposit" value={summary.deposit_paid ? "Paid" : "Due"} sub={money(summary.deposit_cents)} tone={summary.deposit_paid ? "ok" : "warn"} />
              <Stat Icon={CalendarClock} label="Next rent due" value={summary.next_due ? fmtDate(summary.next_due, { month: "short", day: "numeric" }) : "-"} sub={`${money(summary.weekly_cents)} every 7 days`} />
              <Stat Icon={Wallet} label="Balance" value={money(Math.max(summary.balance_cents, 0))} sub={summary.balance_cents < 0 ? `Credit ${money(-summary.balance_cents)}` : summary.balance_cents === 0 ? "All paid up" : "Owed"} tone={summary.balance_cents > 0 ? "warn" : "ok"} />
            </dl>
            <p className="mt-3 px-2 text-sm text-muted">Status: <StatusPill status={summary.status === "active" ? "active" : "completed"} />{summary.room ? ` · Room ${summary.room}` : ""} · Pay by PayPal or cash; our team records every payment.</p>
          </Panel>

          <Panel id="history" title="Payment history">
            {payments.length ? (
              <ul>{payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between border-t border-line px-2 py-2.5 first:border-t-0">
                  <span>{fmtDate(p.paid_at)} <span className="text-sm text-muted">· {p.method.replace("_", " ")}</span></span>
                  <span className="font-semibold">{money(p.amount_cents)}</span>
                </li>
              ))}</ul>
            ) : <EmptyState Icon={Wallet} title="No payments yet" line="Payments appear here once our team records them." />}
          </Panel>

          <Panel id="progress" title="Progress and goals">
            <div className="px-2">
              <div className="flex items-center gap-3">
                <Target aria-hidden="true" className="size-6 text-blue" strokeWidth={1.6} />
                <p className="font-semibold">{goals.length ? `${doneCount} of ${goals.length} goals done` : "Set your first goal"}</p>
              </div>
              <div className="mt-3 h-2 rounded-full bg-ink/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Goals completed">
                <div className="h-2 rounded-full bg-blue" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <ul className="mt-3">
              {goals.map((g) => (
                <li key={g.id} className="flex items-center justify-between gap-3 border-t border-line px-2 py-2.5">
                  <span className={g.done_at ? "text-muted line-through" : "font-medium"}>{g.title}{g.target_date ? <span className="text-sm text-muted"> · by {fmtDate(g.target_date)}</span> : null}</span>
                  {summary!.status === "active" && (
                    <form action={toggleGoal}>
                      <input type="hidden" name="id" value={g.id} />
                      <input type="hidden" name="done" value={g.done_at ? "0" : "1"} />
                      <button className="text-sm font-semibold text-blue hover:underline">{g.done_at ? "Undo" : "Mark done"}</button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
            {summary.status === "active" && (
              <form action={addGoal} className="mt-4 grid gap-3 px-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                <div><label className="field-label" htmlFor="goal">New goal</label><input id="goal" name="title" required maxLength={200} className="field-input" placeholder="Find steady work" /></div>
                <div><label className="field-label" htmlFor="target">By (optional)</label><input id="target" name="target" type="date" className="field-input" /></div>
                <button className="btn-primary">Add goal</button>
              </form>
            )}
          </Panel>

          <Panel id="checkins" title="Check-ins from our team">
            {checkins.length ? (
              <ul>{checkins.map((c) => (
                <li key={c.id} className="border-t border-line px-2 py-3 first:border-t-0">
                  <p className="text-sm text-muted">{fmtDate(c.checked_in_on)}</p>
                  <p className="mt-0.5">{c.note}</p>
                </li>
              ))}</ul>
            ) : <p className="px-2 text-[15px] text-muted">Notes from your regular check-ins with our housing team will show here.</p>}
          </Panel>
        </>
      )}

      {!stay && !latest && <EmptyState Icon={Home} title="No application yet" line="Apply for the sober living program." href="/portal/housing/apply" cta="Apply" />}
    </div>
  );
}

function Stat({ Icon, label, value, sub, tone }: { Icon: typeof Home; label: string; value: string; sub: string; tone?: "ok" | "warn" }) {
  return (
    <div className="rounded-2xl border border-line p-4">
      <dt className="flex items-center gap-2 text-sm text-muted"><Icon aria-hidden="true" className="size-4 text-blue" strokeWidth={1.6} />{label}</dt>
      <dd className={`mt-1 font-display text-3xl font-medium ${tone === "warn" ? "text-warning" : ""}`}>{value}</dd>
      <p className="text-sm text-muted">{sub}</p>
    </div>
  );
}
