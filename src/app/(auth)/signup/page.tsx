import Link from "next/link";
import type { Metadata } from "next";
import { signUp } from "../actions";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="card p-6 sm:p-8">
      <h1 className="text-3xl font-medium">Create your KEP account</h1>
      <p className="mt-2 text-muted">
        Register for events, join programs, give and book the studio, all from one account. We only ask for the
        basics now.
      </p>
      <div className="mt-8">
        <AuthForm
          action={signUp}
          hidden={{ next: next ?? "/portal" }}
          submitLabel="Create account"
          fields={[
            { name: "first_name", label: "First name", autoComplete: "given-name" },
            { name: "last_name", label: "Last name", autoComplete: "family-name" },
            { name: "email", label: "Email", type: "email", autoComplete: "email" },
            {
              name: "password",
              label: "Password",
              type: "password",
              autoComplete: "new-password",
              help: "At least 10 characters.",
            },
          ]}
        />
      </div>
      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-semibold text-blue hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
