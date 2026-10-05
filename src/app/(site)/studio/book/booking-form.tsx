"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { CalendarCheck, Camera, Clapperboard, Mic, Podcast, Sparkles, type LucideIcon } from "lucide-react";
import { FormMessage } from "@/components/form-message";
import { requestStudioBooking, type StudioState } from "../actions";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

const services: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "recording", label: "Recording", Icon: Mic },
  { value: "filming", label: "Filming", Icon: Clapperboard },
  { value: "podcast", label: "Podcast", Icon: Podcast },
  { value: "photography", label: "Photography", Icon: Camera },
  { value: "other", label: "Something else", Icon: Sparkles },
];

const durations = [
  { value: 60, label: "1 hour" },
  { value: 90, label: "1½ hours" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
  { value: 240, label: "4 hours" },
  { value: 360, label: "6 hours" },
  { value: 480, label: "8 hours" },
];

// Times already taken on the chosen day (never who booked), so people can pick a free one.
function BusyTimes({ date }: { date: string }) {
  const [busy, setBusy] = useState<{ start_time: string; end_time: string }[]>([]);
  useEffect(() => {
    if (!date) return;
    let live = true;
    fetch(`${SUPABASE_URL}/rest/v1/rpc/studio_busy`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ p_from: date, p_to: date }),
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => { if (live) setBusy(Array.isArray(rows) ? rows : []); })
      .catch(() => {});
    return () => { live = false; };
  }, [date]);
  const t12 = (t: string) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`; };
  if (!date || busy.length === 0) return null;
  return <p className="mt-1.5 text-sm text-muted">Already booked that day: {busy.map((b) => `${t12(b.start_time)} to ${t12(b.end_time)}`).join(", ")}.</p>;
}

function todayInBatonRouge() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
}

function formatWhen(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const when = new Date(y, m - 1, d, hh, mm);
  return `${when.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at ${when.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

export function BookingForm({ defaults }: { defaults: { name: string; email: string; phone: string } }) {
  const [state, action, pending] = useActionState<StudioState, FormData>(requestStudioBooking, {});
  const [service, setService] = useState("recording");
  const [day, setDay] = useState("");
  const fe = state.fieldErrors ?? {};

  if (state.done) {
    return (
      <div role="status" className="rounded-3xl bg-night p-8 text-white sm:p-10">
        <CalendarCheck aria-hidden="true" className="size-10 text-electric" strokeWidth={1.5} />
        <h2 className="mt-5 font-display text-3xl font-medium sm:text-4xl">Request sent, {state.done.name}.</h2>
        <p className="mt-3 max-w-lg text-lg text-chrome">
          We&apos;ve got your request for {formatWhen(state.done.date, state.done.time)}. Our team will confirm your time
          or suggest another one by email or phone.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn-primary">Back to home</Link>
          <Link href="/signup" className="btn border border-white/25 text-white hover:bg-white/10">Create an account</Link>
        </div>
      </div>
    );
  }

  const field = (name: string) => ({
    id: name,
    name,
    "aria-invalid": fe[name] ? true : undefined,
    "aria-describedby": fe[name] ? `${name}-error` : undefined,
  });
  const err = (name: string) =>
    fe[name] ? (
      <p id={`${name}-error`} className="mt-1.5 text-sm text-danger">
        {fe[name]}
      </p>
    ) : null;

  return (
    <form action={action} className="grid gap-8" noValidate>
      <FormMessage error={state.error} />

      <fieldset>
        <legend className="field-label">What will you be doing?</legend>
        <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {services.map(({ value, label, Icon }) => (
            <label
              key={value}
              className="group relative flex cursor-pointer flex-col items-start gap-3 rounded-2xl border border-line bg-paper p-4 transition-colors hover:border-blue has-[:checked]:border-blue has-[:checked]:bg-blue-soft has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-blue"
            >
              <input
                type="radio"
                name="service"
                value={value}
                checked={service === value}
                onChange={() => setService(value)}
                className="sr-only"
              />
              <Icon aria-hidden="true" className="size-7 text-ink/70 group-has-[:checked]:text-blue" strokeWidth={1.5} />
              <span className="font-semibold">{label}</span>
            </label>
          ))}
        </div>
        {err("service")}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="date" className="field-label">Date</label>
          <input {...field("date")} type="date" min={todayInBatonRouge()} required className="field-input" onChange={(e) => setDay(e.target.value)} />
          <BusyTimes date={day} />
          {err("date")}
        </div>
        <div>
          <label htmlFor="start" className="field-label">Start time</label>
          <input {...field("start")} type="time" step={1800} required defaultValue="10:00" className="field-input" />
          {err("start")}
        </div>
        <div>
          <label htmlFor="minutes" className="field-label">How long</label>
          <select {...field("minutes")} defaultValue={120} className="field-input">
            {durations.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          {err("minutes")}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">Your name</label>
          <input {...field("name")} autoComplete="name" required defaultValue={defaults.name} className="field-input" />
          {err("name")}
        </div>
        <div>
          <label htmlFor="attendees" className="field-label">How many people are coming</label>
          <input {...field("attendees")} type="number" inputMode="numeric" min={1} max={50} defaultValue={1} className="field-input" />
          {err("attendees")}
        </div>
        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input {...field("email")} type="email" autoComplete="email" required defaultValue={defaults.email} className="field-input" />
          {err("email")}
        </div>
        <div>
          <label htmlFor="phone" className="field-label">
            Phone <span className="font-normal text-muted">(optional)</span>
          </label>
          <input {...field("phone")} type="tel" autoComplete="tel" defaultValue={defaults.phone} className="field-input" />
          {err("phone")}
        </div>
      </div>

      <div>
        <label htmlFor="details" className="field-label">
          Tell us about your project <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          {...field("details")}
          rows={4}
          maxLength={2000}
          placeholder="What you're working on and anything you'll need from us."
          className="field-input min-h-28 py-3"
        />
        {err("details")}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn-primary min-w-48" disabled={pending}>
          {pending ? "Sending…" : "Send booking request"}
        </button>
        <p className="text-sm text-muted">Every booking is confirmed by our team. You won&apos;t be charged.</p>
      </div>
    </form>
  );
}
