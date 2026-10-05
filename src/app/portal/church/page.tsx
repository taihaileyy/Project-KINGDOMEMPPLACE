import type { Metadata } from "next";
import { Church } from "lucide-react";
import { DashboardBand } from "@/components/app-shell";
import { SubmitButton } from "@/components/submit-button";
import { Panel, StatusPill, fmtDate } from "@/components/portal-ui";
import { requireAccess } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";
import { leaveChurch } from "../actions";

export const metadata: Metadata = { title: "My Church" };

export default async function MyChurch() {
  await requireAccess("church", "/portal/church");
  const supabase = await createClient();
  const { data: m } = await supabase.from("church_memberships").select("status, joined_at").maybeSingle();
  return (
    <div className="grid gap-6">
      <DashboardBand title="My Church" lead="Your place in the KEP church family." />
      <Panel id="membership" title="Membership">
        <div className="flex flex-wrap items-center gap-4 px-2">
          <Church aria-hidden="true" className="size-10 text-blue" strokeWidth={1.4} />
          <div>
            <p className="font-semibold">Kingdom Empowerment Place Church</p>
            <p className="text-[15px] text-muted">{m ? `Member since ${fmtDate(m.joined_at as string, { month: "long", day: "numeric", year: "numeric" })}` : ""}</p>
          </div>
          {m && <StatusPill status={m.status as string} />}
        </div>
        <form action={leaveChurch} className="mt-5 px-2">
          <SubmitButton className="text-sm font-semibold text-muted underline underline-offset-4 hover:text-danger">Leave the church</SubmitButton>
        </form>
      </Panel>
    </div>
  );
}
