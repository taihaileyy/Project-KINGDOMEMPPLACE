import type { Metadata } from "next";
import { DashboardBand } from "@/components/app-shell";
import { displayName, requireStaff } from "@/lib/auth";

export const metadata: Metadata = { title: "Staff dashboard" };

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  finance_admin: "Finance Admin",
  housing_staff: "Housing Staff",
  program_staff: "Program Staff",
  church_staff: "Church Staff",
};

export default async function AdminHome() {
  const session = await requireStaff();
  return (
    <div className="grid gap-6">
      <DashboardBand
        title="Dashboard"
        lead={`Signed in as ${displayName(session.person)}. Live numbers appear here as each part of the platform comes online: people, church, programs, housing, events, studio and giving.`}
      >
        <ul aria-label="Your access" className="flex flex-wrap gap-2">
          {session.roles.map((r, i) => (
            <li key={i} className="rounded-full border border-electric/40 bg-electric/15 px-3 py-1 text-sm font-semibold text-white">
              {roleLabels[r.role] ?? r.role}
            </li>
          ))}
        </ul>
      </DashboardBand>
    </div>
  );
}
