import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { DashboardBand } from "@/components/app-shell";
import { EmptyState, Panel, StatusPill } from "@/components/portal-ui";
import { eventDate, eventTime, isUpcoming, type CatalogEvent } from "@/lib/catalog";
import { requireAccess } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";
import { cancelRegistration } from "../actions";

export const metadata: Metadata = { title: "My Events" };

type Row = { id: string; status: string; guests: number; checked_in_at: string | null; events: { slug: string; title: string; starts_at: string; ends_at: string | null; location: string | null } | null };

export default async function MyEvents() {
  await requireAccess("events", "/portal/events");
  const supabase = await createClient();
  const { data } = await supabase.from("event_registrations").select("id, status, guests, checked_in_at, events(slug, title, starts_at, ends_at, location)").order("created_at", { ascending: false });
  const rows = ((data ?? []) as unknown as Row[]).filter((r) => r.events);
  const asEvent = (r: Row) => ({ ...r.events!, id: null, blurb: "", details: null, image: null, requires_registration: true, capacity: null }) as CatalogEvent;
  const now = new Date();
  const upcoming = rows.filter((r) => r.status === "registered" && isUpcoming(asEvent(r), now));
  const earlier = rows.filter((r) => !upcoming.includes(r));
  const Item = ({ r, cancel }: { r: Row; cancel?: boolean }) => (
    <li className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-2 py-3 first:border-t-0">
      <span>
        <span className="block font-semibold">{r.events!.title}</span>
        <span className="text-sm text-muted">{eventDate(asEvent(r))}{eventTime(asEvent(r)) ? ` · ${eventTime(asEvent(r))}` : ""}{r.guests ? ` · +${r.guests} guest${r.guests === 1 ? "" : "s"}` : ""}</span>
      </span>
      <span className="flex items-center gap-3">
        <StatusPill status={r.checked_in_at ? "completed" : r.status} />
        {cancel && !r.checked_in_at && (
          <form action={cancelRegistration}>
            <input type="hidden" name="id" value={r.id} />
            <button className="text-sm font-semibold text-muted underline underline-offset-4 hover:text-danger">Cancel</button>
          </form>
        )}
      </span>
    </li>
  );
  return (
    <div className="grid gap-6">
      <DashboardBand title="My Events" lead="Events you've registered for.">
        <Link href="/events" className="btn-primary">Browse events</Link>
      </DashboardBand>
      <Panel id="upcoming-list" title="Coming up">
        {upcoming.length ? <ul>{upcoming.map((r) => <Item key={r.id} r={r} cancel />)}</ul> : <EmptyState Icon={CalendarDays} title="Nothing coming up" line="Register for an event and it will show here." href="/events" cta="Browse events" />}
      </Panel>
      {earlier.length > 0 && <Panel id="earlier-list" title="Earlier"><ul>{earlier.map((r) => <Item key={r.id} r={r} />)}</ul></Panel>}
    </div>
  );
}
