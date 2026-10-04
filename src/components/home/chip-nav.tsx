import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { CalendarDays, Church, HandHeart, House, Mic, Users, type LucideIcon } from "lucide-react";

// Where to go from the homepage, all in view at once and nothing to swipe:
// icon tiles in two columns on phones, and an icon index from tablet width up.
// (Create Your World and Watch have their own big spots and tab-bar buttons.)
const links: { href: string; label: string; title: string; line: string; Icon: LucideIcon }[] = [
  { href: "/church", label: "Worship", title: "Worship with us", line: "Worship with the KEP church family and join Bible study every Wednesday.", Icon: Church },
  { href: "/housing", label: "Sober Living", title: "The Sober Living Program", line: "A sober home with structure, support and a plan.", Icon: House },
  { href: "/programs", label: "Programs", title: "Join a program", line: "Youth mentorship, arts, entrepreneurship, media and the computer lab.", Icon: Users },
  { href: "/studio/book", label: "Studio", title: "Book the studio", line: "Record, film and create in KEP's media studio.", Icon: Mic },
  { href: "/events", label: "Events", title: "Attend an event", line: "Conferences, workshops and community gatherings.", Icon: CalendarDays },
  { href: "/give", label: "Give", title: "Give", line: "Support the work happening on North Foster Drive.", Icon: HandHeart },
];

export function ChipNav() {
  return (
    <section aria-labelledby="quick-title" className="bg-ivory">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-10 sm:px-6 sm:pb-6 sm:pt-16">
        <h2 id="quick-title" className="font-display text-[2.1rem] font-medium leading-[1] sm:text-6xl sm:leading-[0.98] lg:text-7xl">
          What brings you to KEP?
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:hidden">
          {links.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link href={href} className="flex min-h-[5.75rem] flex-col items-center justify-center gap-2.5 rounded-[var(--radius-control)] border border-ink/15 bg-white/55 px-3 py-4 text-[15px] font-medium transition-colors active:bg-white">
                <Icon aria-hidden="true" className="size-7 text-blue" strokeWidth={1.5} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="mt-9 hidden border-t border-ink/15 sm:grid lg:grid-cols-2 lg:gap-x-16">
          {links.map(({ href, title, line, Icon }) => (
            <li key={href} className="border-b border-ink/15">
              <Link href={href} className="group flex items-center gap-5 py-6">
                <Icon aria-hidden="true" className="size-9 shrink-0 text-blue" strokeWidth={1.4} />
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-3xl leading-tight transition-colors duration-300 group-hover:text-blue sm:text-4xl">{title}</span>
                  <span className="mt-1 block text-[15px] leading-relaxed text-muted">{line}</span>
                </span>
                <Arrow className="text-blue" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
