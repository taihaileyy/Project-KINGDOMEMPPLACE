"use client";

import { useSchedule } from "@/components/schedule-provider";
import { describe } from "@/lib/schedule";
import { org } from "@/content/site";

// The same schedule, shown the way each part of the site needs it.

export function ScheduleHero() {
  const items = useSchedule();
  return (
    <>
      {items.map((it) => (
        <div key={it.id} className="flex flex-wrap items-baseline gap-x-2 sm:block">
          <dt className="text-[13px] text-chrome">{it.title}</dt>
          <dd className="text-[14.5px] font-semibold sm:mt-1 sm:text-[15px]">{describe(it, org.phone).line}</dd>
        </div>
      ))}
    </>
  );
}

export function ScheduleFooter({ className = "mt-4 leading-7 text-chrome" }: { className?: string }) {
  const items = useSchedule();
  return (
    <ul className={className}>
      {items.map((it) => (
        <li key={it.id}>{it.title}: {describe(it, org.phone).line}</li>
      ))}
    </ul>
  );
}

export function ScheduleCards() {
  const items = useSchedule();
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {items.map((it) => {
        const d = describe(it, org.phone);
        return (
          <li key={it.id} className="card p-8">
            {d.day ? (
              <>
                <p className="text-muted">{d.day}</p>
                <p className="mt-1 font-display text-5xl font-medium">{d.time ?? "Time to be announced"}</p>
              </>
            ) : (
              <p className="font-display text-3xl font-medium leading-tight">{d.message}</p>
            )}
            <p className="mt-4 font-display text-2xl font-medium">{it.title}</p>
            {it.detail && <p className="mt-2 text-muted">{it.detail}</p>}
          </li>
        );
      })}
    </ul>
  );
}

export function ScheduleEvents() {
  const items = useSchedule();
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {items.map((it) => {
        const d = describe(it, org.phone);
        return (
          <li key={it.id} className="card flex items-center gap-6 p-6">
            <div className="grid size-24 shrink-0 place-items-center rounded-2xl bg-blue px-2 text-center text-white">
              <span className="font-display text-lg font-semibold leading-tight">{d.day ?? "Varies"}</span>
            </div>
            <div>
              <p className="font-display text-2xl font-medium">{it.title}</p>
              <p className="mt-1 text-muted">{d.day ? `${d.time ?? "Time to be announced"} at KEP, ${org.address.line1}` : d.message}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// "Bible Study, Wednesdays, 6:30 PM · Worship Service, ..." for running text.
export function ScheduleInline() {
  const items = useSchedule();
  return <>{items.map((it) => `${it.title}: ${describe(it, org.phone).line}`).join(" · ")}</>;
}
