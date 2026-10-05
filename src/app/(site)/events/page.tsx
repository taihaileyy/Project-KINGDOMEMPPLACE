import Image from "next/image";
import type { Metadata } from "next";
import { CollectionVideos } from "@/components/media/collection-videos";
import { RegisterForm } from "@/components/join/register-form";
import { PageIntro, Section } from "@/components/section";
import { ScheduleEvents } from "@/components/schedule-views";
import { eventDate, eventTime, fetchEvents, isUpcoming, type CatalogEvent } from "@/lib/catalog";

export const metadata: Metadata = { title: "Events" };
export const dynamic = "force-dynamic";

function EventCard({ e, past = false }: { e: CatalogEvent; past?: boolean }) {
  return (
    <li id={e.slug} className="card flex scroll-mt-24 flex-col overflow-hidden">
      {e.image && (
        <Image src={e.image.src} alt={e.image.alt} width={e.image.width} height={e.image.height} sizes="(min-width: 1024px) 25vw, 50vw" className={`h-auto w-full ${past ? "grayscale-[35%]" : ""}`} />
      )}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="font-display text-2xl leading-tight">{e.title}</p>
        {e.starts_at && <p className="text-sm font-semibold text-blue">{eventDate(e)}{eventTime(e) ? ` · ${eventTime(e)}` : ""}</p>}
        {e.location && <p className="text-sm text-muted">{e.location}</p>}
        {e.blurb && <p className="text-[15px] text-muted">{e.blurb}</p>}
        {!past && e.id && e.requires_registration && <div className="mt-3"><RegisterForm eventId={e.id} capacity={e.capacity} /></div>}
      </div>
    </li>
  );
}

export default async function EventsPage() {
  const all = await fetchEvents();
  const now = new Date();
  const upcoming = all.filter((e) => isUpcoming(e, now)).sort((a, b) => (a.starts_at ?? "").localeCompare(b.starts_at ?? ""));
  const past = all.filter((e) => !isUpcoming(e, now));
  return (
    <>
      <PageIntro
        title="Events"
        lead="Worship, conferences, workshops, youth activities and community gatherings."
      />
      <Section title="Every week">
        <ScheduleEvents />
      </Section>
      <Section title="Upcoming events" id="upcoming">
        {upcoming.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{upcoming.map((e) => <EventCard key={e.slug} e={e} />)}</ul>
        ) : (
          <p className="max-w-xl text-lg text-muted">No events are scheduled right now. New ones are posted here as soon as they are planned, and the weekly gatherings above are always open.</p>
        )}
      </Section>
      {past.length > 0 && (
        <Section title="Past events" id="past">
          <ul className="grid grid-cols-2 gap-5 lg:grid-cols-4">{past.map((e) => <EventCard key={e.slug} e={e} past />)}</ul>
        </Section>
      )}
      <CollectionVideos prefix="event:" title="Watch from our events" lead="Highlights and recordings from KEP gatherings." />
    </>
  );
}
