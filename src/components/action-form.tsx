"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import type { ActionState } from "@/lib/action-state";

// A form that runs a server action and shows the result under it. Used for
// staff actions (approve, decline, record a payment...) so every tap gives a
// visible answer instead of silently doing nothing.
export function ActionForm({
  action,
  className,
  children,
}: {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  className?: string;
  children: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className={className}>
      {children}
      {(state.error || state.notice) && (
        <div className="col-span-full mt-1" aria-live="polite">
          <FormMessage error={state.error} notice={state.notice} />
        </div>
      )}
    </form>
  );
}
