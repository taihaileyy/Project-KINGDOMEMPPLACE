import Link from "next/link";
import type { Metadata } from "next";
import { requestPasswordReset } from "../actions";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <div className="card p-6 sm:p-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Reset your password</h1>
      <p className="mt-2 text-muted">Enter your email and we&apos;ll send you a link to choose a new password.</p>
      <div className="mt-8">
        <AuthForm
          action={requestPasswordReset}
          submitLabel="Send reset link"
          fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }]}
        />
      </div>
      <p className="mt-6 text-sm">
        <Link href="/login" className="font-semibold text-blue hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
