"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { registerForEvent, type JoinState } from "@/app/(site)/join-actions";

// Event registration, signed in or not. Opens inline under the event.
export function RegisterForm({ eventId, capacity }: { eventId: string; capacity: number | null }) {
  const [state, action, pending] = useActionState<JoinState, FormData>(registerForEvent, {});
  if (state.notice) return <FormMessage notice={state.notice} />;
  return (
    <details className="group rounded-[var(--radius-control)] border border-line">
      <summary className="btn-primary cursor-pointer list-none !rounded-[var(--radius-control)] group-open:hidden">Register</summary>
      <form action={action} className="grid gap-3 p-4">
        <input type="hidden" name="event" value={eventId} />
        <FormMessage error={state.error} />
        <div>
          <label className="field-label" htmlFor={`n-${eventId}`}>Your name</label>
          <input id={`n-${eventId}`} name="name" required maxLength={120} autoComplete="name" className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor={`e-${eventId}`}>Email</label>
          <input id={`e-${eventId}`} name="email" type="email" required autoComplete="email" className="field-input" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor={`p-${eventId}`}>Phone (optional)</label>
            <input id={`p-${eventId}`} name="phone" type="tel" autoComplete="tel" className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor={`g-${eventId}`}>Guests</label>
            <input id={`g-${eventId}`} name="guests" type="number" min={0} max={10} defaultValue={0} className="field-input" />
          </div>
        </div>
        {capacity && <p className="text-sm text-muted">Space is limited to {capacity} people.</p>}
        <div><button className="btn-primary" disabled={pending}>{pending ? "Registering..." : "Confirm registration"}</button></div>
      </form>
    </details>
  );
}
