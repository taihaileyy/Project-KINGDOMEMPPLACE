"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { applyForHousing, type HousingState } from "../actions";

export function ApplyForm({ phone }: { phone: string }) {
  const [state, action, pending] = useActionState<HousingState, FormData>(applyForHousing, {});
  return (
    <form action={action} className="grid max-w-2xl gap-5">
      <FormMessage error={state.error} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="phone">Your phone</label>
          <input id="phone" name="phone" type="tel" defaultValue={phone} autoComplete="tel" className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="desired">Hoping to move in around</label>
          <input id="desired" name="desired" type="date" className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="emergency_name">Emergency contact name</label>
          <input id="emergency_name" name="emergency_name" className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="emergency_phone">Emergency contact phone</label>
          <input id="emergency_phone" name="emergency_phone" type="tel" className="field-input" />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="employment">Work right now</label>
        <select id="employment" name="employment" className="field-input" defaultValue="">
          <option value="">Choose one</option>
          <option value="employed">Working</option>
          <option value="seeking">Looking for work</option>
          <option value="unable">Not able to work right now</option>
          <option value="other">Something else</option>
        </select>
      </div>
      <div>
        <label className="field-label" htmlFor="about">Tell us a little about where you are and what you&apos;re hoping for</label>
        <textarea id="about" name="about" rows={5} maxLength={3000} className="field-input" />
        <p className="mt-1.5 text-sm text-muted">Share only what you&apos;re comfortable with. We never ask for medical records.</p>
      </div>
      <div><button className="btn-primary" disabled={pending}>{pending ? "Sending..." : "Send my application"}</button></div>
    </form>
  );
}
