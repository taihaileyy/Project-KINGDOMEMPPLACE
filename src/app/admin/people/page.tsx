import Link from "next/link";
import type { Metadata } from "next";
import { DashboardBand } from "@/components/app-shell";
import { Panel, StatusPill, fmtDate } from "@/components/portal-ui";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "People" };

type Row = {
  id: string; first_name: string; last_name: string; email: string | null; phone: string | null; created_at: string;
  address_line1: string | null; city: string | null; state: string | null; postal_code: string | null;
  // One membership per person, so the database returns a single record (or none), not a list.
  church_memberships: { status: string } | { status: string }[] | null;
};

export default async function AdminPeople({ searchParams }: { searchParams: Promise<{ q?: string; member?: string }> }) {
  await requireStaff(["church_staff", "finance_admin"]);
  const { q, member } = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("people")
    .select("id, first_name, last_name, email, phone, created_at, address_line1, city, state, postal_code, church_memberships(status)")
    .is("merged_into_id", null)
    .order("last_name")
    .limit(300);
  const term = (q ?? "").trim().replace(/[%,()]/g, "");
  if (term) query = query.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`);
  const { data } = await query;
  let rows = (data ?? []) as unknown as Row[];
  const isMember = (r: Row) => [r.church_memberships ?? []].flat().some((m) => m.status === "active");
  if (member === "1") rows = rows.filter(isMember);
  const address = (r: Row) => [r.address_line1, r.city, [r.state, r.postal_code].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  return (
    <div className="grid gap-6">
      <DashboardBand title="People" lead="Everyone with a KEP record: members, participants, residents and guests. Select a name for the full record." />
      <Panel id="people" title={`${rows.length} ${member === "1" ? "church members" : "people"}`}>
        <form className="mb-3 flex flex-wrap items-center gap-3 px-2">
          <input name="q" defaultValue={q ?? ""} placeholder="Search name or email" aria-label="Search people" className="field-input max-w-sm" />
          <label className="flex min-h-11 items-center gap-2 text-[15px]"><input type="checkbox" name="member" value="1" defaultChecked={member === "1"} className="size-4" /> Church members only</label>
          <button className="btn-primary">Search</button>
        </form>

        {/* Phones: one card per person with everything on it, nothing to scroll sideways */}
        <ul className="grid gap-3 md:hidden">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={`/admin/people/${r.id}`} className="block rounded-2xl border border-line p-4 active:bg-surface">
                <span className="flex items-start justify-between gap-3">
                  <span className="font-display text-xl font-semibold">{r.first_name} {r.last_name}</span>
                  {isMember(r) && <StatusPill status="active" />}
                </span>
                <span className="mt-1 block break-all text-[15px] text-muted">{r.email}</span>
                {r.phone && <span className="block text-[15px] text-muted">{r.phone}</span>}
                {address(r) && <span className="block text-[15px] text-muted">{address(r)}</span>}
                <span className="mt-1 block text-sm text-muted">Joined KEP {fmtDate(r.created_at)}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Larger screens: a table that scrolls sideways if it is wider than the screen */}
        <div className="hidden overflow-x-auto md:block" tabIndex={0} aria-label="People table, scrolls sideways">
          <table className="w-full min-w-[56rem] text-left text-[15px]">
            <thead className="text-sm text-muted"><tr><th className="px-2 py-2 font-medium">Name</th><th className="px-2 py-2 font-medium">Email</th><th className="px-2 py-2 font-medium">Phone</th><th className="px-2 py-2 font-medium">Address</th><th className="px-2 py-2 font-medium">Joined KEP</th><th className="px-2 py-2 font-medium">Church</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-2 py-2.5"><Link href={`/admin/people/${r.id}`} className="font-semibold text-blue hover:underline">{r.first_name} {r.last_name}</Link></td>
                  <td className="px-2 py-2.5">{r.email}</td>
                  <td className="px-2 py-2.5">{r.phone ?? ""}</td>
                  <td className="px-2 py-2.5">{address(r)}</td>
                  <td className="px-2 py-2.5">{fmtDate(r.created_at)}</td>
                  <td className="px-2 py-2.5">{isMember(r) ? <StatusPill status="active" /> : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <p className="px-2 py-4 text-[15px] text-muted">No one matches that search.</p>}
      </Panel>
    </div>
  );
}
