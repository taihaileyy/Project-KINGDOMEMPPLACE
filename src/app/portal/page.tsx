import Link from "next/link";
import type { Metadata } from "next";
import { displayName, requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "My KEP" };

export default async function PortalHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const session = await requireUser();
  const { denied } = await searchParams;

  return (
    <div className="grid gap-8">
      {denied && (
        <p role="alert" className="rounded-[var(--radius-control)] border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
          That area is for KEP staff. If you think you should have access, ask a KEP administrator.
        </p>
      )}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">Welcome, {displayName(session.person)}</h1>
        <p className="mt-2 max-w-prose text-muted">
          This is your home at Kingdom Empowerment Place. Your events, programs, giving and more will show up here
          as you get involved.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/portal/profile" className="card block p-6 hover:border-blue">
          <h2 className="text-lg font-bold">My Profile</h2>
          <p className="mt-1 text-sm text-muted">Your name, contact details and password.</p>
        </Link>
      </div>
    </div>
  );
}
