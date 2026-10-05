import Link from "next/link";
import type { Metadata } from "next";
import { DashboardBand } from "@/components/app-shell";
import { Panel } from "@/components/portal-ui";
import { canManagePrograms, requireCapability } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Programs" };

export default async function AdminPrograms() {
  await requireCapability(canManagePrograms, "/admin/programs");
  const supabase = await createClient();
  const [{ data: programs }, { data: enrolls }] = await Promise.all([
    supabase.from("programs").select("id, name, is_active, requires_approval, capacity").order("sort_order"),
    supabase.from("program_enrollments").select("program_id, status").in("status", ["pending", "approved"]),
  ]);
  const count = (id: string, status: string) => (enrolls ?? []).filter((e) => e.program_id === id && e.status === status).length;
  return (
    <div className="grid gap-6">
      <DashboardBand title="Programs" lead="Review requests and see who is in each program." />
      <Panel id="list" title="Your programs">
        <ul>
          {(programs ?? []).map((p) => (
            <li key={p.id as string} className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-2 py-3 first:border-t-0">
              <span>
                <Link href={`/admin/programs/${p.id}`} className="font-semibold text-blue hover:underline">{p.name as string}</Link>
                <span className="block text-sm text-muted">{p.is_active ? (p.requires_approval ? "Approval required" : "Open enrollment") : "Hidden from the site"}</span>
              </span>
              <span className="text-sm">
                <strong>{count(p.id as string, "pending")}</strong> waiting · <strong>{count(p.id as string, "approved")}</strong> in{p.capacity ? ` of ${p.capacity}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
