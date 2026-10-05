import type { Metadata } from "next";
import Link from "next/link";
import { DashboardBand } from "@/components/app-shell";
import { Panel } from "@/components/portal-ui";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { saveImpact } from "./actions";

export const metadata: Metadata = { title: "Public impact" };

export default async function AdminImpact() {
  await requireStaff(["super_admin"]);
  const supabase = await createClient();
  const { data } = await supabase.from("impact_metrics").select("key, label, is_public").order("sort_order");
  return (
    <div className="grid gap-6">
      <DashboardBand title="Public impact" lead="Choose which numbers appear on the public Our impact page and the homepage. Totals under 5 are always hidden.">
        <Link href="/impact" className="btn border border-white/25 text-white hover:bg-white/10">View public page</Link>
      </DashboardBand>
      <Panel id="metrics" title="Numbers">
        <form action={saveImpact} className="grid gap-3 px-2">
          {(data ?? []).map((m) => (
            <div key={m.key as string} className="grid items-center gap-3 border-t border-line pt-3 first:border-t-0 first:pt-0 sm:grid-cols-[auto_1fr]">
              <input type="hidden" name="key" value={m.key as string} />
              <label className="flex items-center gap-2 text-[15px] font-semibold"><input type="checkbox" name="public" value={m.key as string} defaultChecked={m.is_public as boolean} className="size-4" /> Show</label>
              <input name={`label_${m.key}`} defaultValue={m.label as string} maxLength={80} aria-label={`Label for ${m.key}`} className="field-input" />
            </div>
          ))}
          <div><button className="btn-primary">Save</button></div>
        </form>
      </Panel>
    </div>
  );
}
