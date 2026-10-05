import Link from "next/link";
import type { Metadata } from "next";
import { DashboardBand } from "@/components/app-shell";
import { Panel, StatusPill } from "@/components/portal-ui";
import { canManageEvents, requireCapability } from "@/lib/auth";
import { eventDate, eventTime, isUpcoming, type CatalogEvent } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Events" };

type Row = { id: string; slug: string; title: string; starts_at: string; ends_at: string | null; is_published: boolean; requires_registration: boolean };

export default async function AdminEvents() {
  await requireCapability(canManageEvents, "/admin/events");
  const supabase = await createClient();
  const [{ data }, { data: regs }] = await Promise.all([
    supabase.from("events").select("id, slug, title, starts_at, ends_at, is_published, requires_registration").order("starts_at", { ascending: false }),
    supabase.from("event_registrations").select("event_id, guests").eq("status", "registered"),
  ]);
  const rows = (data ?? []) as Row[];
  const taken = (id: string) => (regs ?? []).filter((r) => r.event_id === id).reduce((s, r) => s + 1 + (r.guests as number), 0);
  const asEvent = (r: Row) => ({ ...r, blurb: "", details: null, location: null, image: null, capacity: null, id: r.id }) as CatalogEvent;
  const now = new Date();
  const upcoming = rows.filter((r) => isUpcoming(asEvent(r), now)).reverse();
  const past = rows.filter((r) => !isUpcoming(asEvent(r), now));
  const List = ({ list }: { list: Row[] }) => (
    <ul>{list.map((r) => (
      <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-2 py-3 first:border-t-0">
        <span>
          <Link href={`/admin/events/${r.id}`} className="font-semibold text-blue hover:underline">{r.title}</Link>
          <span className="block text-sm text-muted">{eventDate(asEvent(r))} · {eventTime(asEvent(r))}</span>
        </span>
        <span className="flex items-center gap-3 text-sm">
          {r.requires_registration && <span><strong>{taken(r.id)}</strong> registered</span>}
          {!r.is_published && <StatusPill status="inactive" />}
        </span>
      </li>
    ))}</ul>
  );
  return (
    <div className="grid gap-6">
      <DashboardBand title="Events" lead="Create events, see who registered, and check people in.">
        <Link href="/admin/events/new" className="btn-primary">New event</Link>
      </DashboardBand>
      <Panel id="up" title={`Upcoming (${upcoming.length})`}>{upcoming.length ? <List list={upcoming} /> : <p className="px-2 text-[15px] text-muted">No upcoming events. Create one to get started.</p>}</Panel>
      {past.length > 0 && <Panel id="past" title="Past"><List list={past} /></Panel>}
    </div>
  );
}
