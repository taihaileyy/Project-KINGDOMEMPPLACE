import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const { person } = await requireUser("/portal/profile");
  return (
    <div className="grid max-w-2xl gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
      <section className="card p-6 sm:p-8">
        <ProfileForm person={person} />
      </section>
      <section className="card flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-bold">Password</h2>
          <p className="text-sm text-muted">Change the password you use to log in.</p>
        </div>
        <Link href="/portal/password" className="btn-secondary">
          Change password
        </Link>
      </section>
    </div>
  );
}
