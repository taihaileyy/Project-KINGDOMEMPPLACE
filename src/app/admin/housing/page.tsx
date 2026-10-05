import Link from "next/link";
import type { Metadata } from "next";
import { Home } from "lucide-react";
import { DashboardBand } from "@/components/app-shell";
import { EmptyState, Panel, StatusPill, fmtDate } from "@/components/portal-ui";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { decideApplication, moveIn } from "./actions";

export const metadata: Metadata = { title: "Housing" };

const money = (c: number) => (c / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());

type App = { id: string; status: string; created_at: string; desired_move_in: string | null; phone: string | null; emergency_name: string | null; emergency_phone: string | null; employment: string | null; about: string | null; staff_note: string | null; people: { first_name: string; last_name: string; email: string | null } | null };
type Stay = { id: string; room: string | null; move_in_date: string; people: { first_name: string; last_name: string } | null };

export default async function AdminHousing() {
  await requireStaff(["housing_staff"]);
  const supabase = await createClient();
  const [{ data: apps }, { data: stays }] = await Promise.all([
    supabase.from("housing_applications").select("id, status, created_at, desired_move_in, phone, emergency_name, emergency_phone, employment, about, staff_note, people!housing_applications_person_id_fkey(first_name, last_name, email)").in("status", ["submitted", "in_review", "approved"]).order("created_at"),
    supabase.from("housing_residencies").select("id, room, move_in_date, people!housing_residencies_person_id_fkey(first_name, last_name)").eq("status", "active").order("move_in_date"),
  ]);
  const queue = (apps ?? []) as unknown as App[];
  const residents = (stays ?? []) as unknown as Stay[];
  const summaries = await Promise.all(residents.map((r) => supabase.rpc("housing_summary", { p_residency: r.id })));

  return (
    <div className="grid gap-6">
      <DashboardBand title="Housing" lead="Review applications, move people in, and keep up with everyone who lives at the KEP house." />

      <Panel id="queue" title={`Applications (${queue.length})`}>
        {queue.length === 0 ? (
          <EmptyState Icon={Home} title="No applications waiting" line="New applications from the website appear here." />
        ) : (
          <ul className="grid gap-4">
            {queue.map((a) => (
              <li key={a.id} className="rounded-2xl border border-line p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl font-semibold">{a.people?.first_name} {a.people?.last_name}</p>
                    <p className="text-sm text-muted">{a.people?.email}{a.phone ? ` · ${a.phone}` : ""} · applied {fmtDate(a.created_at)}</p>
                  </div>
                  <StatusPill status={a.status} />
                </div>
                <dl className="mt-3 grid gap-1 text-[15px] sm:grid-cols-2">
                  {a.desired_move_in && <div><dt className="inline text-muted">Hoping to move in: </dt><dd className="inline">{fmtDate(a.desired_move_in)}</dd></div>}
                  {a.employment && <div><dt className="inline text-muted">Work: </dt><dd className="inline">{a.employment}</dd></div>}
                  {a.emergency_name && <div><dt className="inline text-muted">Emergency contact: </dt><dd className="inline">{a.emergency_name} {a.emergency_phone}</dd></div>}
                </dl>
                {a.about && <p className="mt-3 whitespace-pre-line rounded-xl bg-surface p-3 text-[15px]">{a.about}</p>}
                {a.staff_note && <p className="mt-2 text-sm text-muted">Note: {a.staff_note}</p>}

                {a.status !== "approved" ? (
                  <form action={decideApplication} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input type="hidden" name="id" value={a.id} />
                    <input name="note" placeholder="Note (optional)" maxLength={2000} aria-label="Note" className="field-input" />
                    <div className="flex flex-wrap gap-2">
                      {a.status === "submitted" && <button name="status" value="in_review" className="btn border border-ink/20">Start review</button>}
                      <button name="status" value="approved" className="btn-primary">Approve</button>
                      <button name="status" value="declined" className="btn border border-danger/40 text-danger">Decline</button>
                    </div>
                  </form>
                ) : (
                  <form action={moveIn} className="mt-4 grid items-end gap-3 sm:grid-cols-[auto_1fr_auto]">
                    <input type="hidden" name="id" value={a.id} />
                    <div><label className="field-label" htmlFor={`d-${a.id}`}>Move-in date</label><input id={`d-${a.id}`} name="date" type="date" defaultValue={today()} required className="field-input" /></div>
                    <div><label className="field-label" htmlFor={`r-${a.id}`}>Room</label><input id={`r-${a.id}`} name="room" maxLength={60} className="field-input" /></div>
                    <button className="btn-primary">Move in</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel id="residents" title={`Current residents (${residents.length})`}>
        {residents.length === 0 ? (
          <EmptyState Icon={Home} title="No one is moved in yet" line="Approved applicants move in from the list above." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[15px]">
              <thead className="text-sm text-muted"><tr><th className="px-2 py-2 font-medium">Resident</th><th className="px-2 py-2 font-medium">Room</th><th className="px-2 py-2 font-medium">Days</th><th className="px-2 py-2 font-medium">Balance</th></tr></thead>
              <tbody>
                {residents.map((r, i) => {
                  const s = summaries[i].data as { days_housed: number; balance_cents: number } | null;
                  return (
                    <tr key={r.id} className="border-t border-line">
                      <td className="px-2 py-3"><Link href={`/admin/housing/residents/${r.id}`} className="font-semibold text-blue hover:underline">{r.people?.first_name} {r.people?.last_name}</Link></td>
                      <td className="px-2 py-3">{r.room ?? "-"}</td>
                      <td className="px-2 py-3">{s?.days_housed ?? "-"}</td>
                      <td className={`px-2 py-3 ${s && s.balance_cents > 0 ? "font-semibold text-warning" : ""}`}>{s ? money(s.balance_cents) : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
