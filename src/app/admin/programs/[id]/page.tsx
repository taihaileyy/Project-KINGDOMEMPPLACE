import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DashboardBand } from "@/components/app-shell";
import { EmptyState, Panel, StatusPill, fmtDate } from "@/components/portal-ui";
import { Users } from "lucide-react";
import { canManagePrograms, requireCapability } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { decideEnrollment, saveProgramSettings } from "../actions";

export const metadata: Metadata = { title: "Program roster" };

type Row = { id: string; status: string; note: string | null; requested_at: string; people: { first_name: string; last_name: string; email: string | null; phone: string | null } | null };

export default async function ProgramRoster({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireCapability(canManagePrograms, "/admin/programs");
  const { id } = await params;
  const supabase = await createClient();
  const { data: program } = await supabase.from("programs").select("id, name, capacity, requires_approval, is_active").eq("id", id).maybeSingle();
  if (!program) notFound();
  const { data } = await supabase.from("program_enrollments").select("id, status, note, requested_at, people!program_enrollments_person_id_fkey(first_name, last_name, email, phone)").eq("program_id", id).in("status", ["pending", "approved", "completed"]).order("requested_at");
  const rows = (data ?? []) as unknown as Row[];
  const group = (s: string) => rows.filter((r) => r.status === s);
  const isAdmin = session.roles.some((r) => r.role === "super_admin");

  const Person = ({ r }: { r: Row }) => (
    <span>
      <span className="block font-semibold">{r.people?.first_name} {r.people?.last_name}</span>
      <span className="text-sm text-muted">{r.people?.email}{r.people?.phone ? ` · ${r.people.phone}` : ""} · {fmtDate(r.requested_at)}</span>
      {r.note && <span className="mt-1 block text-sm">&ldquo;{r.note}&rdquo;</span>}
    </span>
  );
  const Decide = ({ r, status, label, cls }: { r: Row; status: string; label: string; cls: string }) => (
    <form action={decideEnrollment}>
      <input type="hidden" name="id" value={r.id} /><input type="hidden" name="program" value={id} />
      <button name="status" value={status} className={cls}>{label}</button>
    </form>
  );

  return (
    <div className="grid gap-6">
      <DashboardBand title={program.name as string} lead="Requests and roster">
        <Link href="/admin/programs" className="btn border border-white/25 text-white hover:bg-white/10">All programs</Link>
      </DashboardBand>

      <Panel id="pending" title={`Waiting for review (${group("pending").length})`}>
        {group("pending").length === 0 ? <EmptyState Icon={Users} title="No requests waiting" line="New requests from the website show here." /> : (
          <ul>{group("pending").map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-2 py-3 first:border-t-0">
              <Person r={r} />
              <span className="flex gap-2"><Decide r={r} status="approved" label="Approve" cls="btn-primary" /><Decide r={r} status="declined" label="Decline" cls="btn border border-danger/40 text-danger" /></span>
            </li>
          ))}</ul>
        )}
      </Panel>

      <Panel id="roster" title={`In the program (${group("approved").length}${program.capacity ? ` of ${program.capacity}` : ""})`}>
        {group("approved").length === 0 ? <p className="px-2 text-[15px] text-muted">No one is enrolled yet.</p> : (
          <ul>{group("approved").map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-2 py-3 first:border-t-0">
              <Person r={r} />
              <span className="flex items-center gap-3"><StatusPill status="approved" /><Decide r={r} status="completed" label="Mark completed" cls="text-sm font-semibold text-blue hover:underline" /></span>
            </li>
          ))}</ul>
        )}
      </Panel>

      {group("completed").length > 0 && (
        <Panel id="done" title={`Completed (${group("completed").length})`}>
          <ul>{group("completed").map((r) => <li key={r.id} className="border-t border-line px-2 py-3 first:border-t-0"><Person r={r} /></li>)}</ul>
        </Panel>
      )}

      {isAdmin && (
        <Panel id="settings" title="Program settings">
          <form action={saveProgramSettings} className="grid gap-3 px-2 sm:grid-cols-[8rem_auto_auto_auto] sm:items-end">
            <input type="hidden" name="id" value={id} />
            <div><label className="field-label" htmlFor="capacity">Spots (0 = no limit)</label><input id="capacity" name="capacity" type="number" min={0} defaultValue={(program.capacity as number | null) ?? 0} className="field-input" /></div>
            <label className="flex items-center gap-2 text-[15px]"><input type="checkbox" name="requires_approval" defaultChecked={program.requires_approval as boolean} className="size-4" /> Staff approve each request</label>
            <label className="flex items-center gap-2 text-[15px]"><input type="checkbox" name="is_active" defaultChecked={program.is_active as boolean} className="size-4" /> Show on the website</label>
            <button className="btn-primary">Save</button>
          </form>
        </Panel>
      )}
    </div>
  );
}
