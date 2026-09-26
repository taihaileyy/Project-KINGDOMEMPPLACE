"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import type { Person } from "@/lib/auth";
import { updateProfile } from "../actions";

const fields = [
  { name: "first_name", label: "First name", autoComplete: "given-name", required: true },
  { name: "last_name", label: "Last name", autoComplete: "family-name", required: true },
  { name: "preferred_name", label: "Preferred name", autoComplete: "nickname", required: false },
  { name: "phone", label: "Phone", autoComplete: "tel", type: "tel", required: false },
] as const;

export function ProfileForm({ person }: { person: Person }) {
  const [state, action, pending] = useActionState(updateProfile, {});
  return (
    <form action={action} className="grid gap-5" noValidate>
      <FormMessage error={state.error} notice={state.notice} />
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name}>
            <label htmlFor={f.name} className="field-label">
              {f.label}
              {!f.required && <span className="font-normal text-muted"> (optional)</span>}
            </label>
            <input
              id={f.name}
              name={f.name}
              type={"type" in f ? f.type : "text"}
              autoComplete={f.autoComplete}
              required={f.required}
              defaultValue={person[f.name] ?? ""}
              className="field-input"
            />
          </div>
        ))}
      </div>
      <div>
        <p className="field-label">Email</p>
        <p className="text-muted">{person.email}</p>
      </div>
      <div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
