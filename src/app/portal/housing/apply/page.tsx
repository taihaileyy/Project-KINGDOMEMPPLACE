import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { DashboardBand } from "@/components/app-shell";
import { Panel } from "@/components/portal-ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = { title: "Apply for sober living" };

export default async function ApplyPage() {
  const session = await requireUser("/portal/housing/apply");
  const supabase = await createClient();
  const [{ count: open }, { count: stay }] = await Promise.all([
    supabase.from("housing_applications").select("id", { count: "exact", head: true }).in("status", ["submitted", "in_review", "approved"]),
    supabase.from("housing_residencies").select("id", { count: "exact", head: true }).eq("status", "active"),
  ]);
  if ((open ?? 0) > 0 || (stay ?? 0) > 0) redirect("/portal/housing");
  return (
    <div className="grid gap-6">
      <DashboardBand title="Apply for sober living" lead="A short application. Our housing team reviews each one personally and will contact you." />
      <Panel id="apply" title="Your application">
        <div className="px-2"><ApplyForm phone={session.person.phone ?? ""} /></div>
      </Panel>
    </div>
  );
}
