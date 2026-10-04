import Link from "next/link";
import { CalendarDays, Church, CirclePlay, HandHeart, House, Mic, TreeDeciduous, Users, type LucideIcon } from "lucide-react";

// A single swipeable row of places to go, like an app's home shortcuts. One row
// instead of a stack of tiles keeps the page short.
const chips: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/create-your-world", label: "Play the game", Icon: TreeDeciduous },
  { href: "/watch", label: "Watch & Listen", Icon: CirclePlay },
  { href: "/church", label: "Worship", Icon: Church },
  { href: "/events", label: "Events", Icon: CalendarDays },
  { href: "/programs", label: "Programs", Icon: Users },
  { href: "/housing", label: "Sober Living", Icon: House },
  { href: "/studio/book", label: "Studio", Icon: Mic },
  { href: "/give", label: "Give", Icon: HandHeart },
];

export function ChipNav() {
  return (
    <nav aria-label="Quick links" className="bg-ivory">
      <ul className="mx-auto flex max-w-7xl snap-x scroll-pl-4 gap-2 overflow-x-auto px-4 py-4 [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:px-6 sm:py-6 [&::-webkit-scrollbar]:hidden">
        {chips.map(({ href, label, Icon }, i) => (
          <li key={href} className="shrink-0 snap-start">
            <Link
              href={href}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition-colors ${
                i === 0 ? "border-blue bg-blue text-white hover:bg-blue-hover" : "border-ink/20 bg-white/60 hover:border-blue hover:text-blue"
              }`}
            >
              <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.7} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
