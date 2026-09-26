import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";

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
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="mt-2 max-w-prose text-muted">
          Live numbers appear here as each part of the platform comes online: people, church, programs, housing,
          events, studio and giving.
        </p>
      </div>
      <section className="card p-6">
        <h2 className="text-lg font-bold">Your access</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {session.roles.map((r, i) => (
            <li key={i} className="rounded-full bg-blue-soft px-3 py-1 text-sm font-semibold text-blue">
              {roleLabels[r.role] ?? r.role}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
