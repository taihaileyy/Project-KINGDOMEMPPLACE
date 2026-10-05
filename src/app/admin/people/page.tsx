import type { Metadata } from "next";
import { DashboardBand } from "@/components/app-shell";
import { Panel, StatusPill, fmtDate } from "@/components/portal-ui";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "People" };

type Row = { id: string; first_name: string; last_name: string; email: string | null; phone: string | null; created_at: string; church_memberships: { status: string }[] | null };

export default async function AdminPeople({ searchParams }: { searchParams: Promise<{ q?: string; member?: string }> }) {
  await requireStaff(["church_staff", "finance_admin"]);
  const { q, member } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("people").select("id, first_name, last_name, email, phone, created_at, church_memberships(status)").is("merged_into_id", null).order("last_name").limit(300);
  const term = (q ?? "").trim().replace(/[%,()]/g, "");
  if (term) query = query.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`);
  const { data } = await query;
  let rows = (data ?? []) as unknown as Row[];
  if (member === "1") rows = rows.filter((r) => r.church_memberships?.some((m) => m.status === "active"));
  return (
    <div className="grid gap-6">
      <DashboardBand title="People" lead="Everyone with a KEP record: members, participants, residents and guests." />
      <Panel id="people" title={`${rows.length} ${member === "1" ? "church members" : "people"}`}>
        <form className="mb-3 flex flex-wrap gap-3 px-2">
          <input name="q" defaultValue={q ?? ""} placeholder="Search name or email" aria-label="Search people" className="field-input max-w-sm" />
          <label className="flex items-center gap-2 text-[15px]"><input type="checkbox" name="member" value="1" defaultChecked={member === "1"} className="size-4" /> Church members only</label>
          <button className="btn-primary">Search</button>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[15px]">
            <thead className="text-sm text-muted"><tr><th className="px-2 py-2 font-medium">Name</th><th className="px-2 py-2 font-medium">Email</th><th className="px-2 py-2 font-medium">Phone</th><th className="px-2 py-2 font-medium">Joined KEP</th><th className="px-2 py-2 font-medium">Church</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-2 py-2.5 font-semibold">{r.first_name} {r.last_name}</td>
                  <td className="px-2 py-2.5">{r.email}</td>
                  <td className="px-2 py-2.5">{r.phone ?? ""}</td>
                  <td className="px-2 py-2.5">{fmtDate(r.created_at)}</td>
                  <td className="px-2 py-2.5">{r.church_memberships?.some((m) => m.status === "active") ? <StatusPill status="active" /> : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
