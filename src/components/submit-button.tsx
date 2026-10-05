"use client";

import { useFormStatus } from "react-dom";

// A submit button for server-action forms. While the request is running it
// looks busy and ignores further taps, so a slow connection never looks like a
// dead button and the form can't be sent twice. Plain text-style buttons get a
// comfortable tap size on phones.
//
// It does not use the `disabled` attribute (a disabled button leaves its own
// name and value out of what the form sends), and it adds its own name and value
// itself, because several forms rely on them (Approve / Decline / Start review,
// Check in, Mark completed).
export function SubmitButton({ className = "", children, pendingLabel, onClick, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  const base = /(^|\s)btn/.test(className) ? "" : "inline-flex min-h-11 items-center px-1";
  return (
    <button
      {...rest}
      onClick={(e) => {
        if (pending) return e.preventDefault();
        // Put this button's own name and value into the form before it is sent.
        // (Relying on the browser to add the clicked button's value was not
        // reliable with server actions: Approve and Decline arrived blank.)
        const form = e.currentTarget.form;
        if (form && rest.name) {
          let h = form.querySelector<HTMLInputElement>("input[data-submitter]");
          if (!h) {
            h = document.createElement("input");
            h.type = "hidden";
            h.setAttribute("data-submitter", "1");
            form.appendChild(h);
          }
          h.name = rest.name;
          h.value = String(rest.value ?? "");
        }
        onClick?.(e);
      }}
      aria-disabled={pending || undefined}
      aria-busy={pending || undefined}
      className={`${base} ${className} ${pending ? "cursor-wait opacity-60" : ""}`}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
