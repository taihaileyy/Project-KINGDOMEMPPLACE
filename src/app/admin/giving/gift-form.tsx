"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { recordGift, type GiftState } from "./actions";

export function GiftForm({ funds, today }: { funds: { id: string; name: string }[]; today: string }) {
  const [state, action, pending] = useActionState<GiftState, FormData>(recordGift, {});
  return (
    <form action={action} className="grid gap-3 px-2 sm:grid-cols-2 lg:grid-cols-4">
      <div className="sm:col-span-2 lg:col-span-4"><FormMessage error={state.error} notice={state.notice} /></div>
      <div><label className="field-label" htmlFor="g-fund">Fund</label><select id="g-fund" name="fund" className="field-input">{funds.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
      <div><label className="field-label" htmlFor="g-amount">Amount ($)</label><input id="g-amount" name="amount" type="number" step="0.01" min="1" required className="field-input" /></div>
      <div><label className="field-label" htmlFor="g-method">Method</label><select id="g-method" name="method" className="field-input"><option value="cash">Cash</option><option value="check">Check</option><option value="other">Other</option></select></div>
      <div><label className="field-label" htmlFor="g-date">Date</label><input id="g-date" name="date" type="date" defaultValue={today} required className="field-input" /></div>
      <div><label className="field-label" htmlFor="g-name">Giver&apos;s name (optional)</label><input id="g-name" name="donor_name" maxLength={200} className="field-input" /></div>
      <div><label className="field-label" htmlFor="g-email">Giver&apos;s email (links to their account)</label><input id="g-email" name="donor_email" type="email" className="field-input" /></div>
      <div className="sm:col-span-2"><label className="field-label" htmlFor="g-note">Note</label><input id="g-note" name="note" maxLength={500} className="field-input" /></div>
      <div className="sm:col-span-2 lg:col-span-4"><button className="btn-primary" disabled={pending}>{pending ? "Saving..." : "Record gift"}</button></div>
    </form>
  );
}
