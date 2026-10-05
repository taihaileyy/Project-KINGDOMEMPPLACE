import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, Church, HandHeart, Mic, Sparkles, UserRound, Users, type LucideIcon } from "lucide-react";
import { DashboardBand } from "@/components/app-shell";
import { EmptyState, Panel, StatusPill, fmtDate } from "@/components/portal-ui";
import { displayName, requireUser } from "@/lib/auth";
import { eventDate, eventTime, fetchEvents, isUpcoming } from "@/lib/catalog";
import { getPortalAccess } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My KEP" };

const quickActions: { href: string; title: string; line: string; Icon: LucideIcon }[] = [
  { href: "/programs", title: "Explore programs", line: "Youth, arts, business, media and the computer lab.", Icon: Users },
  { href: "/events", title: "Upcoming events", line: "Conferences, workshops and gatherings.", Icon: CalendarDays },
  { href: "/studio/book", title: "Book the studio", line: "Record, film and create at KEP.", Icon: Mic },
  { href: "/give", title: "Give", line: "Support the work on North Foster Drive.", Icon: HandHeart },
  { href: "/portal/profile", title: "Update your profile", line: "Your name, contact details and password.", Icon: UserRound },
];

const missing: Record<string, string> = {
  church: "You haven't joined the church yet. You can do that from the Church page.",
  programs: "You aren't in any programs yet. Explore programs to join one.",
  events: "You haven't registered for any events yet.",
  giving: "You don't have any gifts on record yet.",
  housing: "That area is for KEP housing residents and applicants.",
};

type Activity = { kind: string; title: string; detail: string | null; at: string; href: string };

export default async function PortalHome({ searchParams }: { searchParams: Promise<{ denied?: string; missing?: string }> }) {
  const session = await requireUser();
  const { denied, missing: miss } = await searchParams;
  const supabase = await createClient();
  const access = await getPortalAccess();

  const [{ data: activity }, { data: regs }, { data: enrolls }, { data: member }, events] = await Promise.all([
    supabase.rpc("my_activity", { p_limit: 6 }),
    supabase.from("event_registrations").select("id, event_id, status").eq("status", "registered"),
    supabase.from("program_enrollments").select("id, status, programs(name)").in("status", ["pending", "approved"]),
    supabase.from("church_memberships").select("status, joined_at").eq("status", "active").maybeSingle(),
    fetchEvents(),
  ]);

  const now = new Date();
  const registered = new Set((regs ?? []).map((r) => r.event_id as string));
  const upcoming = events
    .filter((e) => isUpcoming(e, now))
    .sort((a, b) => (a.starts_at ?? "").localeCompare(b.starts_at ?? ""))
    .slice(0, 4);
  const programsNow = (enrolls ?? []) as unknown as { id: string; status: string; programs: { name: string } | null }[];
  const recent = (activity ?? []) as Activity[];
  const firstName = displayName(session.person);

  return (
    <div className="grid gap-6">
      {denied && (
        <p role="alert" className="rounded-[var(--radius-control)] border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
          That area is for KEP staff. If you think you should have access, ask a KEP administrator.
        </p>
      )}
      {miss && missing[miss] && (
        <p role="status" className="rounded-[var(--radius-control)] border border-blue/25 bg-blue/5 px-4 py-3 text-sm text-ink">{missing[miss]}</p>
      )}

      <DashboardBand
        title={`Welcome back, ${firstName}`}
        lead="This is your home at Kingdom Empowerment Place: your church family, programs, events and giving in one place."
      >
        <Link href="/programs" className="btn-primary">Explore programs</Link>
        <Link href="/portal/profile" className="btn border border-white/25 text-white hover:bg-white/10">Update profile</Link>
      </DashboardBand>

      {/* My KEP: one tile per part of KEP; an empty tile says what to do next */}
      <Panel id="my-title" title="My KEP">
        <ul className="grid gap-3 sm:grid-cols-2">
          <li className="rounded-2xl border border-line p-4">
            <p className="flex items-center gap-2 font-semibold"><Church aria-hidden="true" className="size-5 text-blue" strokeWidth={1.6} />Church</p>
            {member ? (
              <p className="mt-2 text-[15px] text-muted">Member since {fmtDate(member.joined_at as string, { month: "long", year: "numeric" })}. <Link href="/portal/church" className="font-semibold text-blue hover:underline">View</Link></p>
            ) : (
              <p className="mt-2 text-[15px] text-muted">Not a member yet. <Link href="/church#join" className="font-semibold text-blue hover:underline">Join the church</Link></p>
            )}
          </li>
          <li className="rounded-2xl border border-line p-4">
            <p className="flex items-center gap-2 font-semibold"><Users aria-hidden="true" className="size-5 text-blue" strokeWidth={1.6} />Programs</p>
            {programsNow.length > 0 ? (
              <ul className="mt-2 grid gap-1.5 text-[15px]">
                {programsNow.slice(0, 3).map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-2">{p.programs?.name} <StatusPill status={p.status} /></li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[15px] text-muted">No programs yet. <Link href="/programs" className="font-semibold text-blue hover:underline">Explore programs</Link></p>
            )}
          </li>
          <li className="rounded-2xl border border-line p-4">
            <p className="flex items-center gap-2 font-semibold"><CalendarDays aria-hidden="true" className="size-5 text-blue" strokeWidth={1.6} />Events</p>
            <p className="mt-2 text-[15px] text-muted">
              {registered.size > 0 ? `You're registered for ${registered.size} event${registered.size === 1 ? "" : "s"}.` : "You haven't registered for an event yet."}{" "}
              <Link href={access.events ? "/portal/events" : "/events"} className="font-semibold text-blue hover:underline">{access.events ? "View" : "Browse events"}</Link>
            </p>
          </li>
          <li className="rounded-2xl border border-line p-4">
            <p className="flex items-center gap-2 font-semibold"><HandHeart aria-hidden="true" className="size-5 text-blue" strokeWidth={1.6} />Giving</p>
            <p className="mt-2 text-[15px] text-muted">
              {access.giving ? "Your gifts and yearly totals." : "Support the work at KEP."}{" "}
              <Link href={access.giving ? "/portal/giving" : "/give"} className="font-semibold text-blue hover:underline">{access.giving ? "View" : "Give"}</Link>
            </p>
          </li>
        </ul>
      </Panel>

      <Panel id="upcoming-title" title="Upcoming" action={<Link href="/events" className="text-sm font-semibold text-blue hover:underline">All events</Link>}>
        {upcoming.length > 0 ? (
          <ul className="grid">
            {upcoming.map((e) => (
              <li key={e.slug} className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-2 py-3 first:border-t-0">
                <span>
                  <span className="block font-semibold">{e.title}</span>
                  <span className="text-[15px] text-muted">{eventDate(e)}{eventTime(e) ? ` · ${eventTime(e)}` : ""}</span>
                </span>
                {e.id && registered.has(e.id) ? <StatusPill status="registered" /> : <Link href={`/events#${e.slug}`} className="text-sm font-semibold text-blue hover:underline">Details</Link>}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState Icon={CalendarDays} title="Nothing scheduled right now" line="New events appear here as soon as they're planned. Bible Study is every Wednesday evening." href="/church#bible-study" cta="See weekly gatherings" />
        )}
      </Panel>

      <Panel id="recent-title" title="Recent activity">
        {recent.length > 0 ? (
          <ul className="grid">
            {recent.map((a, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-2 py-3 first:border-t-0">
                <span>
                  <Link href={a.href} className="font-semibold hover:text-blue">{a.title}</Link>
                  <span className="block text-sm text-muted">{fmtDate(a.at)}</span>
                </span>
                {a.detail && <StatusPill status={a.detail} />}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState Icon={Sparkles} title="Your story starts here" line="When you join a program, register for an event or give, it shows up here." href="/programs" cta="Explore programs" />
        )}
      </Panel>

      <section aria-labelledby="quick-title" className="rounded-3xl border border-line bg-paper p-4 sm:p-6">
        <h2 id="quick-title" className="px-2 font-display text-2xl font-extrabold tracking-tight">Quick actions</h2>
        <ul className="mt-3 grid sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3">
          {quickActions.map(({ href, title, line, Icon }) => (
            <li key={href} className="border-t border-line">
              <Link
                href={href}
                className="group relative flex items-start gap-4 rounded-2xl px-3 py-4 before:absolute before:inset-y-4 before:left-0 before:w-[3px] before:rounded-full before:bg-blue before:opacity-0 hover:bg-surface hover:before:opacity-100"
              >
                <Icon aria-hidden="true" className="mt-0.5 size-7 shrink-0 text-ink/70 group-hover:text-blue" strokeWidth={1.5} />
                <span>
                  <span className="block text-lg font-semibold leading-tight">{title}</span>
                  <span className="mt-0.5 block text-[15px] leading-snug text-muted">{line}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
