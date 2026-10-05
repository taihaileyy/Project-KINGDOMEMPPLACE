import Link from "next/link";
import type { Metadata } from "next";
import { Users } from "lucide-react";
import { DashboardBand } from "@/components/app-shell";
import { EmptyState, Panel, StatusPill, fmtDate } from "@/components/portal-ui";
import { requireAccess } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";
import { withdrawEnrollment } from "../actions";

export const metadata: Metadata = { title: "My Programs" };

type Row = { id: string; status: string; requested_at: string; programs: { name: string; slug: string } | null };

export default async function MyPrograms() {
  await requireAccess("programs", "/portal/programs");
  const supabase = await createClient();
  const { data } = await supabase.from("program_enrollments").select("id, status, requested_at, programs(name, slug)").order("requested_at", { ascending: false });
  const rows = (data ?? []) as unknown as Row[];
  return (
    <div className="grid gap-6">
      <DashboardBand title="My Programs" lead="Programs you've joined or asked to join.">
        <Link href="/programs" className="btn-primary">Explore programs</Link>
      </DashboardBand>
      <Panel id="programs-list" title="Your programs">
        {rows.length === 0 ? (
          <EmptyState Icon={Users} title="No programs yet" line="Pick a program that fits you." href="/programs" cta="Explore programs" />
        ) : (
          <ul className="grid">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-2 py-3 first:border-t-0">
                <span>
                  <Link href={`/programs/${r.programs?.slug}`} className="block font-semibold hover:text-blue">{r.programs?.name}</Link>
                  <span className="text-sm text-muted">Requested {fmtDate(r.requested_at)}</span>
                </span>
                <span className="flex items-center gap-3">
                  <StatusPill status={r.status} />
                  {(r.status === "pending" || r.status === "approved") && (
                    <form action={withdrawEnrollment}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-sm font-semibold text-muted underline underline-offset-4 hover:text-danger">Withdraw</button>
                    </form>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
