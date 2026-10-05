import type { KepEvent } from "@/content/site";
import { formatTime, type ScheduleItem } from "@/lib/schedule";

// Everything here works from "today in Baton Rouge", so an event stops being
// "upcoming" at the end of its day, whatever time zone the visitor is in.

const TZ = "America/Chicago";

export function todayInBatonRouge(now = new Date()): { iso: string; weekday: number } {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return { iso: `${get("year")}-${get("month")}-${get("day")}`, weekday: days.indexOf(get("weekday")) };
}

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export function formatLongDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
export const shortParts = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`);
  return { month: d.toLocaleDateString("en-US", { timeZone: "UTC", month: "short" }), day: d.getUTCDate(), weekday: d.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long" }) };
};

// What one card on the homepage and Events page needs.
export type UpcomingItem = {
  key: string;
  title: string;
  date: string | null; // YYYY-MM-DD; null when the time varies
  dateLabel?: string; // shown instead of a date when it varies
  time: string | null;
  blurb: string;
  href: string;
  image?: KepEvent["image"];
  recurring?: boolean;
};

// Events with a date today or later, plus the next date of each weekly
// schedule item that has a start time (Bible Study), soonest first.
export function upcomingItems(events: KepEvent[], schedule: ScheduleItem[], now = new Date()): UpcomingItem[] {
  const today = todayInBatonRouge(now);
  const out: UpcomingItem[] = events
    .filter((e) => e.date && e.date >= today.iso)
    .map((e) => ({ key: e.slug, title: e.title, date: e.date!, time: e.time ?? null, blurb: e.blurb, href: `/events#${e.slug}`, image: e.image }));
  for (const it of schedule) {
    if (it.frequency !== "weekly" || it.weekday === null || !it.start_time) continue;
    const ahead = (it.weekday - today.weekday + 7) % 7;
    out.push({
      key: `weekly-${it.id}`,
      title: it.title,
      date: addDays(today.iso, ahead),
      time: formatTime(it.start_time),
      blurb: it.detail ?? "Join us at KEP.",
      href: it.kind === "bible_study" ? "/church#bible-study" : "/church",
      recurring: true,
    });
  }
  // Items whose time varies (worship) come last, so people still see them.
  for (const it of schedule) {
    if (it.frequency === "weekly" && it.weekday !== null && it.start_time) continue;
    if (it.frequency === "weekly" && !it.start_time && it.weekday === null) continue;
    out.push({ key: `varies-${it.id}`, title: it.title, date: null, dateLabel: it.note?.trim() || "Times vary", time: null, blurb: it.detail ?? "Join us at KEP.", href: "/church", recurring: true });
  }
  return out.sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"));
}

export function pastEvents(events: KepEvent[], now = new Date()): KepEvent[] {
  const today = todayInBatonRouge(now).iso;
  return events.filter((e) => !e.date || e.date < today).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

