"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Lock } from "lucide-react";
import { FormMessage } from "@/components/form-message";
import { funds } from "@/content/site";
import { startGift, type GiveState } from "./actions";

const presets = [25, 50, 100, 250];

export function GiveForm({ signedInAs, enabled }: { signedInAs: string | null; enabled: boolean }) {
  const [state, action, pending] = useActionState<GiveState, FormData>(startGift, {});
  const [amount, setAmount] = useState("50");
  const [frequency, setFrequency] = useState<"once" | "monthly">("once");
  const [fund, setFund] = useState<string>("tithe");

  const chip =
    "flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border border-line bg-paper px-3 font-semibold transition-colors hover:border-blue has-[:checked]:border-blue has-[:checked]:bg-blue has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue";

  const fundCard =
    "flex cursor-pointer flex-col items-start rounded-2xl border border-line bg-paper px-4 py-3 text-left font-semibold transition-colors hover:border-blue has-[:checked]:border-blue has-[:checked]:bg-blue-soft has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue";

  return (
    <form action={action} className="grid gap-7">
      <FormMessage error={state.error} />

      <fieldset>
        <legend className="field-label">How often</legend>
        <div className="mt-1 grid grid-cols-2 gap-2 rounded-2xl bg-surface p-1.5">
          {(["once", "monthly"] as const).map((f) => (
            <label key={f} className={`${chip} border-transparent bg-transparent has-[:checked]:bg-night`}>
              <input type="radio" name="frequency" value={f} checked={frequency === f} onChange={() => setFrequency(f)} className="sr-only" />
              {f === "once" ? "One time" : "Every month"}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="field-label">Amount</legend>
        <div className="mt-1 grid grid-cols-4 gap-2">
          {presets.map((p) => (
            <label key={p} className={chip}>
              <input
                type="radio"
                name="preset"
                value={p}
                checked={amount === String(p)}
                onChange={() => setAmount(String(p))}
                className="sr-only"
              />
              ${p}
            </label>
          ))}
        </div>
        <label htmlFor="amount" className="mt-3 block text-sm text-muted">Or enter an amount</label>
        <div className="relative mt-1">
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 grid place-items-center font-display text-2xl font-extrabold text-muted">$</span>
          <input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            min={1}
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="field-input min-h-14 pl-10 font-display text-2xl font-extrabold"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="field-label">Give to</legend>
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {funds.map((f) => (
            <label key={f.slug} className={fundCard}>
              <input type="radio" name="fund" value={f.slug} checked={fund === f.slug} onChange={() => setFund(f.slug)} className="sr-only" />
              <span>{f.name}</span>
              <span className="text-sm font-normal text-muted">{f.detail}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {signedInAs ? (
        <p className="rounded-2xl bg-blue-soft px-4 py-3 text-sm">
          Giving as <strong>{signedInAs}</strong>. This gift will appear in{" "}
          <Link href="/portal/giving" className="font-semibold text-blue hover:underline">My Giving</Link>.
        </p>
      ) : (
        <div>
          <label htmlFor="name" className="field-label">
            Your name <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="name" name="name" autoComplete="name" className="field-input" />
          <p className="mt-2 text-sm text-muted">
            No account needed.{" "}
            <Link href="/login?next=/give" className="font-semibold text-blue hover:underline">Log in</Link> or{" "}
            <Link href="/signup" className="font-semibold text-blue hover:underline">create an account</Link> to keep track of
            your giving.
          </p>
        </div>
      )}

      <button type="submit" className="btn-primary min-h-14 text-lg" disabled={pending || !enabled}>
        <Lock aria-hidden="true" className="size-4" />
        {pending ? "Opening secure checkout…" : `Give $${Number(amount || 0).toLocaleString("en-US")}${frequency === "monthly" ? " every month" : ""}`}
      </button>
      <p className="-mt-3 text-center text-sm text-muted">
        {enabled
          ? "You'll pay on Stripe's secure checkout. KEP never sees your card or bank details."
          : "Online giving is almost ready. Until then, give in person on Sunday or Wednesday."}
      </p>
    </form>
  );
}
