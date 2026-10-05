import Link from "next/link";
import type { Metadata } from "next";
import { DashboardBand } from "@/components/app-shell";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Panel, StatusPill } from "@/components/portal-ui";
import { canManageStudio, requireCapability } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { todayChicago } from "@/lib/time";
import { addBlock, decideStudio, removeBlock } from "./actions";

export const metadata: Metadata = { title: "Studio" };

type Req = { id: string; name: string; email: string; phone: string | null; service: string; preferred_date: string; start_time: string; duration_minutes: number; attendees: number; details: string | null; status: string };
type Block = { id: string; block_date: string; start_time: string; end_time: string; reason: string | null };

const t12 = (t: string) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`; };
const longDay = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" });
const addMin = (t: string, m: number) => { const [h, mm] = t.split(":").map(Number); const total = h * 60 + mm + m; return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`; };

export default async function AdminStudio({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  await requireCapability(canManageStudio, "/admin/studio");
  const { m } = await searchParams;
  const today = todayChicago();
  const month = /^\d{4}-\d{2}$/.test(m ?? "") ? (m as string) : today.slice(0, 7);
  const [y, mo] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, mo - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const from = `${month}-01`, to = `${month}-${String(daysInMonth).padStart(2, "0")}`;
  const prev = new Date(Date.UTC(y, mo - 2, 1)).toISOString().slice(0, 7);
  const next = new Date(Date.UTC(y, mo, 1)).toISOString().slice(0, 7);

  const supabase = await createClient();
  const [{ data: reqs }, { data: blocks }, { data: pending }] = await Promise.all([
    supabase.from("studio_requests").select("id, name, email, phone, service, preferred_date, start_time, duration_minutes, attendees, details, status").gte("preferred_date", from).lte("preferred_date", to).in("status", ["approved", "pending"]).order("start_time"),
    supabase.from("studio_blocks").select("id, block_date, start_time, end_time, reason").gte("block_date", today).order("block_date").order("start_time"),
    supabase.from("studio_requests").select("id, name, email, phone, service, preferred_date, start_time, duration_minutes, attendees, details, status").eq("status", "pending").order("preferred_date"),
  ]);
  const monthReqs = (reqs ?? []) as Req[];
  const monthBlocks = ((blocks ?? []) as Block[]).filter((b) => b.block_date >= from && b.block_date <= to);
  const cells: (number | null)[] = [...Array(first.getUTCDay()).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="grid gap-6">
      <DashboardBand title="Studio" lead="Approve requests, see the calendar and block off times." />

      <Panel id="pending" title={`Requests waiting (${(pending ?? []).length})`}>
        {(pending ?? []).length === 0 ? <p className="px-2 text-[15px] text-muted">No requests waiting.</p> : (
          <ul className="grid gap-3">{((pending ?? []) as Req[]).map((r) => (
            <li key={r.id} className="rounded-2xl border border-line p-4">
              <p className="font-semibold">{r.name} <span className="font-normal text-muted">· {r.service}</span></p>
              <p className="text-[15px]">{longDay(r.preferred_date)}, {t12(r.start_time)} to {t12(addMin(r.start_time, r.duration_minutes))} · {r.attendees} {r.attendees === 1 ? "person" : "people"}</p>
              <p className="text-sm text-muted">{r.email}{r.phone ? ` · ${r.phone}` : ""}</p>
              {r.details && <p className="mt-2 rounded-xl bg-surface p-3 text-[15px]">{r.details}</p>}
              <ActionForm action={decideStudio} className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                <input type="hidden" name="id" value={r.id} />
                <input name="note" aria-label="Note to add" placeholder="Note (optional)" maxLength={500} className="field-input" />
                <span className="flex gap-2"><SubmitButton name="status" value="approved" className="btn-primary">Approve</SubmitButton><SubmitButton name="status" value="declined" className="btn border border-danger/40 text-danger">Decline</SubmitButton></span>
              </ActionForm>
            </li>
          ))}</ul>
        )}
      </Panel>

      <Panel id="calendar" title={first.toLocaleDateString("en-US", { timeZone: "UTC", month: "long", year: "numeric" })} action={
        <span className="flex gap-4 text-sm font-semibold"><Link href={`/admin/studio?m=${prev}`} className="text-blue hover:underline">Previous</Link><Link href={`/admin/studio?m=${next}`} className="text-blue hover:underline">Next</Link></span>
      }>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-line bg-line text-xs sm:text-sm" role="grid" aria-label="Studio calendar">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="bg-surface px-1 py-1.5 text-center font-semibold text-muted" role="columnheader">{d}</div>)}
          {cells.map((day, i) => {
            const date = day ? `${month}-${String(day).padStart(2, "0")}` : "";
            const items = day ? monthReqs.filter((r) => r.preferred_date === date) : [];
            const bl = day ? monthBlocks.filter((b) => b.block_date === date) : [];
            return (
              <div key={i} role="gridcell" className={`min-h-16 bg-paper p-1 sm:min-h-24 sm:p-1.5 ${date === today ? "ring-2 ring-inset ring-blue" : ""}`}>
                {day && <p className="font-semibold">{day}</p>}
                {items.map((r) => <p key={r.id} className={`mt-0.5 truncate rounded px-1 ${r.status === "approved" ? "bg-blue/15 text-blue" : "bg-warning/15 text-warning"}`} title={`${r.name}, ${t12(r.start_time)}`}>{t12(r.start_time)} {r.name.split(" ")[0]}</p>)}
                {bl.map((b) => <p key={b.id} className="mt-0.5 truncate rounded bg-ink/10 px-1 text-muted" title={b.reason ?? "Blocked"}>{b.reason || "Blocked"}</p>)}
              </div>
            );
          })}
        </div>
        <p className="mt-3 flex flex-wrap gap-4 px-2 text-sm text-muted"><span><StatusPill status="approved" /> booked</span><span><StatusPill status="pending" /> waiting</span><span>Gray: blocked</span></p>
      </Panel>

      <Panel id="blocks" title="Blocked times">
        <ActionForm action={addBlock} className="grid items-end gap-3 px-2 sm:grid-cols-[9rem_7rem_7rem_1fr_auto]">
          <div><label className="field-label" htmlFor="bdate">Date</label><input id="bdate" name="date" type="date" min={today} required className="field-input" /></div>
          <div><label className="field-label" htmlFor="bstart">From</label><input id="bstart" name="start" type="time" defaultValue="00:00" className="field-input" /></div>
          <div><label className="field-label" htmlFor="bend">To</label><input id="bend" name="end" type="time" defaultValue="23:59" className="field-input" /></div>
          <div><label className="field-label" htmlFor="breason">Reason</label><input id="breason" name="reason" maxLength={200} placeholder="Maintenance, church event..." className="field-input" /></div>
          <SubmitButton className="btn-primary">Block time</SubmitButton>
        </ActionForm>
        <ul className="mt-4">
          {((blocks ?? []) as Block[]).map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-2 py-2.5 text-[15px]">
              <span>{longDay(b.block_date)} · {t12(b.start_time)} to {t12(b.end_time)}{b.reason ? ` · ${b.reason}` : ""}</span>
              <ActionForm action={removeBlock}><input type="hidden" name="id" value={b.id} /><SubmitButton className="text-sm font-semibold text-muted underline underline-offset-4 hover:text-danger">Remove</SubmitButton></ActionForm>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
