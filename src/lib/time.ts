// Dates in KEP's home time zone. Staff type times as they'd say them in Baton
// Rouge; these helpers turn that into a real instant and back.
const TZ = "America/Chicago";

function offsetMs(at: number): number {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(new Date(at));
  const g = (t: string) => Number(p.find((x) => x.type === t)?.value);
  return Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second")) - at;
}

// "2026-10-12T18:30" (Baton Rouge wall time) -> ISO instant.
export function chicagoToISO(local: string): string | null {
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return null;
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  const t = guess - offsetMs(guess - offsetMs(guess));
  return new Date(t).toISOString();
}

// ISO instant -> "2026-10-12T18:30" for a datetime-local input.
export function isoToChicagoLocal(iso: string): string {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date(iso));
  const g = (t: string) => p.find((x) => x.type === t)?.value;
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
}

export const todayChicago = () => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
