import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, HandHeart, Mic, UserRound, Users, type LucideIcon } from "lucide-react";
import { DashboardBand } from "@/components/app-shell";
import { displayName, requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "My KEP" };

// Real destinations only; the portal's own sections (My Church, My Programs,
// My Events, My Giving, My Housing) arrive with their modules.
const quickActions: { href: string; title: string; line: string; Icon: LucideIcon }[] = [
  { href: "/programs", title: "Explore programs", line: "Youth, arts, business, media and the computer lab.", Icon: Users },
  { href: "/events", title: "Upcoming events", line: "Conferences, workshops and gatherings.", Icon: CalendarDays },
  { href: "/studio/book", title: "Book the studio", line: "Record, film and create at KEP.", Icon: Mic },
  { href: "/give", title: "Give", line: "Support the work on North Foster Drive.", Icon: HandHeart },
  { href: "/portal/profile", title: "Update your profile", line: "Your name, contact details and password.", Icon: UserRound },
];

export default async function PortalHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const session = await requireUser();
  const { denied } = await searchParams;

  return (
    <div className="grid gap-6">
      {denied && (
        <p role="alert" className="rounded-[var(--radius-control)] border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
          That area is for KEP staff. If you think you should have access, ask a KEP administrator.
        </p>
      )}
      <DashboardBand
        title={`Welcome back, ${displayName(session.person)}`}
        lead="This is your home at Kingdom Empowerment Place. Your programs, events, giving and more will show up here as you get involved."
      >
        <Link href="/programs" className="btn-primary">Explore programs</Link>
        <Link href="/portal/profile" className="btn border border-white/25 text-white hover:bg-white/10">Update profile</Link>
      </DashboardBand>

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
