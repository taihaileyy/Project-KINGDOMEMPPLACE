"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { updatePassword } from "../actions";

export default function PasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, {});
  return (
    <div className="grid max-w-md gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Change password</h1>
      <form action={action} className="card grid gap-5 p-6 sm:p-8" noValidate>
        <FormMessage error={state.error} notice={state.notice} />
        <div>
          <label htmlFor="password" className="field-label">New password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required className="field-input" aria-describedby="password-help" />
          <p id="password-help" className="mt-1.5 text-sm text-muted">At least 10 characters.</p>
        </div>
        <div>
          <label htmlFor="confirm" className="field-label">Confirm new password</label>
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="field-input" />
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Change password"}
        </button>
      </form>
    </div>
  );
}
