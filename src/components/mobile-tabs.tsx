"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CirclePlay, Ellipsis, House, TreeDeciduous, type LucideIcon } from "lucide-react";

// App-style navigation for phones: the main places one thumb away, with
// Create Your World in the middle, and More opening the full menu.
const tabs: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/", label: "Home", Icon: House },
  { href: "/watch", label: "Watch", Icon: CirclePlay },
  { href: "/create-your-world", label: "Play", Icon: TreeDeciduous },
  { href: "/events", label: "Events", Icon: CalendarDays },
];

export const OPEN_MENU_EVENT = "kep:open-menu";

export function MobileTabs() {
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));
  const base = "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium tracking-wide transition-colors";
  return (
    <nav aria-label="App" className="mobile-tabs fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-blueblack/95 pb-[env(safe-area-inset-bottom)] text-white backdrop-blur-xl sm:hidden">
      <ul className="mx-auto flex max-w-md items-stretch px-2">
        {tabs.map(({ href, label, Icon }) => {
          const isPlay = href === "/create-your-world";
          return (
            <li key={href} className="flex flex-1">
              <Link href={href} aria-current={active(href) ? "page" : undefined} className={`${base} ${active(href) ? "text-white" : "text-white/60"} ${isPlay ? "-mt-5" : ""}`}>
                {isPlay ? (
                  <span className="grid size-14 place-items-center rounded-full bg-[radial-gradient(circle_at_50%_25%,#5c6bff,#1f33b8_70%)] text-white shadow-[0_8px_24px_-6px_rgb(31_51_184/0.8)] ring-2 ring-white/40">
                    <Icon aria-hidden="true" className="size-7" strokeWidth={1.6} />
                  </span>
                ) : (
                  <Icon aria-hidden="true" className="size-6" strokeWidth={1.6} />
                )}
                <span className={isPlay ? "text-white" : ""}>{label}</span>
                {active(href) && !isPlay && <span aria-hidden="true" className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-electric" />}
              </Link>
            </li>
          );
        })}
        <li className="flex flex-1">
          <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_MENU_EVENT))} className={`${base} text-white/60`} aria-haspopup="dialog">
            <Ellipsis aria-hidden="true" className="size-6" strokeWidth={1.6} />
            <span>More</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
