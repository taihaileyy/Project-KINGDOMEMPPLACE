"use client";

import { useFormStatus } from "react-dom";

// A submit button for server-action forms. While the request is running it is
// disabled and says so, so a slow connection never looks like a dead button,
// and a second tap can't send the form twice. Plain text-style buttons get a
// comfortable tap size on phones.
export function SubmitButton({ className = "", children, pendingLabel, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  const base = /(^|\s)btn/.test(className) ? "" : "inline-flex min-h-11 items-center px-1";
  return (
    <button {...rest} disabled={pending || rest.disabled} aria-busy={pending || undefined} className={`${base} ${className} ${pending ? "cursor-wait opacity-60" : ""}`}>
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
