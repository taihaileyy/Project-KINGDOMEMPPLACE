import Link from "next/link";
import type { Metadata } from "next";
import { signIn } from "../actions";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="card p-6 sm:p-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Log in</h1>
      <p className="mt-2 text-muted">One account for everything you do at KEP.</p>
      <div className="mt-8">
        <AuthForm
          action={signIn}
          submitLabel="Log in"
          hidden={{ next: next ?? "/portal" }}
          fields={[
            { name: "email", label: "Email", type: "email", autoComplete: "email" },
            { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
          ]}
        />
      </div>
      <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm">
        <Link href="/forgot-password" className="font-semibold text-blue hover:underline">
          Forgot your password?
        </Link>
        <Link href="/signup" className="font-semibold text-blue hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
