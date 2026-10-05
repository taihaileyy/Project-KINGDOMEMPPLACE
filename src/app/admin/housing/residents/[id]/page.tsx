import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DashboardBand } from "@/components/app-shell";
import { Panel, StatusPill, fmtDate } from "@/components/portal-ui";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { addCheckin, moveOut, recordPayment, setEmployed } from "../../actions";

export const metadata: Metadata = { title: "Resident" };

const money = (c: number) => (c / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());

export default async function ResidentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff(["housing_staff", "finance_admin"]);
  const { id } = await params;
  const supabase = await createClient();
  const { data: stay } = await supabase.from("housing_residencies").select("id, status, room, employed, move_in_date, move_out_date, move_out_reason, people!housing_residencies_person_id_fkey(first_name, last_name, email, phone)").eq("id", id).maybeSingle();
  if (!stay) notFound();
  const person = (stay as unknown as { people: { first_name: string; last_name: string; email: string | null; phone: string | null } | null }).people;
  const [{ data: s }, { data: pays }, { data: checks }, { data: goals }] = await Promise.all([
    supabase.rpc("housing_summary", { p_residency: id }),
    supabase.from("housing_payments").select("id, amount_cents, method, paid_at, note").eq("residency_id", id).order("paid_at", { ascending: false }),
    supabase.from("housing_checkins").select("id, note, visible_to_resident, checked_in_on").eq("residency_id", id).order("checked_in_on", { ascending: false }),
    supabase.from("housing_goals").select("id, title, done_at").eq("residency_id", id),
  ]);
  const sum = s as { days_housed: number; balance_cents: number; paid_cents: number; charged_cents: number; next_due: string | null; deposit_paid: boolean };
  const active = stay.status === "active";

  return (
    <div className="grid gap-6">
      <DashboardBand title={`${person?.first_name} ${person?.last_name}`} lead={`${person?.email ?? ""}${person?.phone ? ` · ${person.phone}` : ""}`}>
        <Link href="/admin/housing" className="btn border border-white/25 text-white hover:bg-white/10">All housing</Link>
      </DashboardBand>

      <Panel id="numbers" title="Numbers">
        <dl className="grid grid-cols-2 gap-3 px-2 sm:grid-cols-4">
          <div><dt className="text-sm text-muted">Status</dt><dd><StatusPill status={active ? "active" : "completed"} /> {stay.room ? `· ${stay.room}` : ""}</dd></div>
          <div><dt className="text-sm text-muted">Days housed</dt><dd className="font-display text-2xl">{sum.days_housed}</dd></div>
          <div><dt className="text-sm text-muted">Charged / paid</dt><dd>{money(sum.charged_cents)} / {money(sum.paid_cents)}</dd></div>
          <div><dt className="text-sm text-muted">Balance</dt><dd className={`font-display text-2xl ${sum.balance_cents > 0 ? "text-warning" : ""}`}>{money(sum.balance_cents)}</dd></div>
        </dl>
        <p className="mt-2 px-2 text-sm text-muted">Moved in {fmtDate(stay.move_in_date as string)}{sum.next_due ? ` · next rent due ${fmtDate(sum.next_due)}` : ""}{stay.move_out_date ? ` · moved out ${fmtDate(stay.move_out_date as string)} (${stay.move_out_reason})` : ""}</p>
      </Panel>

      <Panel id="pay" title="Record a payment">
        <form action={recordPayment} className="grid items-end gap-3 px-2 sm:grid-cols-[8rem_9rem_10rem_1fr_auto]">
          <input type="hidden" name="id" value={id} />
          <div><label className="field-label" htmlFor="amount">Amount ($)</label><input id="amount" name="amount" type="number" step="0.01" min="1" required className="field-input" /></div>
          <div><label className="field-label" htmlFor="method">Method</label>
            <select id="method" name="method" className="field-input"><option value="cash">Cash</option><option value="paypal">PayPal</option><option value="money_order">Money order</option><option value="other">Other</option></select></div>
          <div><label className="field-label" htmlFor="pdate">Date</label><input id="pdate" name="date" type="date" defaultValue={today()} className="field-input" /></div>
          <div><label className="field-label" htmlFor="pnote">Note</label><input id="pnote" name="note" maxLength={300} className="field-input" /></div>
          <button className="btn-primary">Record</button>
        </form>
        <ul className="mt-4">
          {(pays ?? []).map((p) => (
            <li key={p.id as string} className="flex justify-between border-t border-line px-2 py-2.5 text-[15px]">
              <span>{fmtDate(p.paid_at as string)} · {(p.method as string).replace("_", " ")}{p.note ? ` · ${p.note}` : ""}</span><span className="font-semibold">{money(p.amount_cents as number)}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel id="checkins" title="Check-ins">
        <form action={addCheckin} className="grid gap-3 px-2">
          <input type="hidden" name="id" value={id} />
          <label className="field-label" htmlFor="cnote">New note</label>
          <textarea id="cnote" name="note" rows={3} required maxLength={2000} className="field-input" />
          <label className="flex items-center gap-2 text-[15px]"><input type="checkbox" name="visible" defaultChecked className="size-4" /> Show this note to the resident</label>
          <div><button className="btn-primary">Add check-in</button></div>
        </form>
        <ul className="mt-4">
          {(checks ?? []).map((c) => (
            <li key={c.id as string} className="border-t border-line px-2 py-3 text-[15px]">
              <p className="text-sm text-muted">{fmtDate(c.checked_in_on as string)} · {c.visible_to_resident ? "shared with resident" : "staff only"}</p>
              <p>{c.note as string}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 px-2 text-sm text-muted">Goals: {(goals ?? []).filter((g) => g.done_at).length} of {(goals ?? []).length} done.</p>
      </Panel>

      {active && (
        <Panel id="manage" title="Employment and move-out">
          <form action={setEmployed} className="flex flex-wrap items-center gap-3 px-2">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="employed" value={stay.employed ? "0" : "1"} />
            <span className="text-[15px]">Employed: <strong>{stay.employed ? "Yes" : "No"}</strong></span>
            <button className="btn border border-ink/20">{stay.employed ? "Mark not employed" : "Mark employed"}</button>
          </form>
          <form action={moveOut} className="mt-5 grid items-end gap-3 px-2 sm:grid-cols-[9rem_10rem_auto]">
            <input type="hidden" name="id" value={id} />
            <div><label className="field-label" htmlFor="mdate">Move-out date</label><input id="mdate" name="date" type="date" defaultValue={today()} required className="field-input" /></div>
            <div><label className="field-label" htmlFor="mreason">Reason</label>
              <select id="mreason" name="reason" className="field-input"><option value="graduated">Completed the program</option><option value="left">Left</option><option value="removed">Removed</option><option value="other">Other</option></select></div>
            <button className="btn border border-danger/40 text-danger">Move out</button>
          </form>
        </Panel>
      )}
    </div>
  );
}
