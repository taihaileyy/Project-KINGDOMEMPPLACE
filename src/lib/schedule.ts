// The church schedule. Staff edit it in Admin > Schedule; these helpers turn a
// row into the words people read, and supply safe defaults for before the
// schedule has loaded (or if it can't).

export type ScheduleItem = {
  id: string;
  kind: "bible_study" | "worship" | "other";
  title: string;
  detail: string | null;
  frequency: "weekly" | "varies" | "custom";
  weekday: number | null; // 0 = Sunday
  start_time: string | null; // "18:30:00"
  note: string | null;
  sort_order: number;
};

export const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { id: "default-bible-study", kind: "bible_study", title: "Bible Study", detail: "A midweek Bible study taught by a Kingdom minister.", frequency: "weekly", weekday: 3, start_time: "18:30:00", note: null, sort_order: 10 },
  { id: "default-worship", kind: "worship", title: "Worship Service", detail: "Worship, the Word and fellowship with the KEP church family.", frequency: "varies", weekday: null, start_time: null, note: null, sort_order: 20 },
];

const DAYS = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];

export function formatTime(t: string | null): string | null {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return null;
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m || 0).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

// What to show for one item: `day` and `time` when they are fixed, otherwise a
// single friendly `message`.
export function describe(item: ScheduleItem, phone: string) {
  const time = formatTime(item.start_time);
  if (item.frequency === "weekly" && item.weekday !== null) {
    const day = DAYS[item.weekday];
    return { day, time, message: null as string | null, line: time ? `${day}, ${time}` : `${day} (time to be announced)` };
  }
  const fallback = item.kind === "worship" ? `Worship times vary. Check back soon or call ${phone}.` : `Time to be announced. Call ${phone} for details.`;
  const message = item.note?.trim() || (item.frequency === "custom" && time ? time : null) || fallback;
  return { day: null as string | null, time, message, line: message };
}
