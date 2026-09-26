"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import type { FormState } from "./actions";

type Field = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  help?: string;
};

export function AuthForm({
  action,
  fields,
  submitLabel,
  hidden,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  fields: Field[];
  submitLabel: string;
  hidden?: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <FormMessage error={state.error} notice={state.notice} />
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="field-label">
            {f.label}
          </label>
          <input
            id={f.name}
            name={f.name}
            type={f.type ?? "text"}
            autoComplete={f.autoComplete}
            required
            aria-describedby={f.help ? `${f.name}-help` : undefined}
            className="field-input"
          />
          {f.help && (
            <p id={`${f.name}-help`} className="mt-1.5 text-sm text-muted">
              {f.help}
            </p>
          )}
        </div>
      ))}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Please wait…" : submitLabel}
      </button>
    </form>
  );
}
