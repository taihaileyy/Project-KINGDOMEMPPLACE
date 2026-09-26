"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, Church, HandHeart, House, Images, Info, Mic, Users, X, type LucideIcon } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { siteNav } from "@/content/site";

// Public pages stay static, so the header doesn't ask the server who is signed
// in. It only looks for Supabase's session cookie to pick which links to show;
// /portal still checks the session properly on the server.
function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    setSignedIn(/(?:^|;\s*)sb-[^=]+-auth-token(?:\.\d+)?=/.test(document.cookie));
  }, []);
  return signedIn;
}

type DrawerLink = { href: string; title: string; line: string; Icon: LucideIcon };

// The slide-out menu groups every page under a plain heading, each with an
// icon and a one-line description, so people can find their way in by need.
const drawerGroups: { title: string; links: DrawerLink[] }[] = [
  {
    title: "Get connected",
    links: [
      { href: "/church", title: "Church", line: "Worship times and what to expect.", Icon: Church },
      { href: "/events", title: "Events", line: "Conferences, workshops and gatherings.", Icon: CalendarDays },
      { href: "/programs", title: "Programs", line: "Youth, arts, business, media and tech.", Icon: Users },
    ],
  },
  {
    title: "Take your next step",
    links: [
      { href: "/housing", title: "Housing", line: "Sober living with structure and support.", Icon: House },
      { href: "/studio", title: "Book the Studio", line: "Record, film and create at KEP.", Icon: Mic },
      { href: "/give", title: "Give", line: "Support the work on North Foster Drive.", Icon: HandHeart },
    ],
  },
  {
    title: "Discover",
    links: [
      { href: "/about", title: "About KEP", line: "Our story, our leaders and where to find us.", Icon: Info },
      { href: "/gallery", title: "Gallery", line: "Photos from life at KEP.", Icon: Images },
    ],
  },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const signedIn = useSignedIn();
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [pathname]);

  // While open: lock page scroll, close on Escape, keep Tab inside the panel,
  // and hand focus back to the menu button on close.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const trigger = triggerRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = panelRef.current.querySelectorAll<HTMLElement>("a[href], button");
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-30 bg-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Wordmark nameClass="hidden sm:inline xl:hidden 2xl:inline" />
        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-0.5 rounded-full border border-line bg-paper px-2 py-1.5 shadow-[var(--shadow-card)]">
            {siteNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-3 text-[15px] font-semibold text-ink/80 hover:bg-surface hover:text-ink aria-[current=page]:bg-blue-soft aria-[current=page]:text-blue"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          {signedIn ? (
            <Link href="/portal" className="btn-primary hidden sm:inline-flex">My account</Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary hidden sm:inline-flex">Log in</Link>
              <Link href="/signup" className="btn-primary hidden sm:inline-flex">Create account</Link>
            </>
          )}
          <button
            ref={triggerRef}
            type="button"
            className="grid size-11 place-items-center rounded-[var(--radius-control)] border border-line bg-paper text-ink hover:bg-surface xl:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(true)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Slide-out menu. It stays mounted so it can slide; `inert` keeps it out
          of reach while closed. */}
      <div className={`fixed inset-0 z-40 xl:hidden ${open ? "" : "pointer-events-none"}`} inert={!open}>
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          ref={panelRef}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute inset-y-3 left-3 flex w-[min(420px,calc(100vw-24px))] flex-col overflow-hidden rounded-3xl border border-white/10 bg-night/85 text-white shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
            open ? "translate-x-0" : "-translate-x-[calc(100%+24px)]"
          }`}
        >
          <div className="flex items-center justify-between gap-4 px-6 pb-2 pt-5">
            <Wordmark showName={false} />
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="grid size-11 place-items-center rounded-full text-white/85 hover:bg-white/10 hover:text-white"
            >
              <X aria-hidden="true" className="size-7" strokeWidth={1.75} />
            </button>
          </div>

          <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 pb-4">
            {drawerGroups.map((group) => (
              <section key={group.title} className="mt-4 first:mt-2">
                <h2 className="px-3 font-display text-2xl font-extrabold tracking-tight">{group.title}</h2>
                <ul className="mt-2 grid gap-0.5">
                  {group.links.map(({ href, title, line, Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={isActive(href) ? "page" : undefined}
                        className="group flex items-center gap-4 rounded-2xl px-3 py-2.5 hover:bg-white/10 aria-[current=page]:bg-white/10"
                      >
                        <Icon aria-hidden="true" className="size-7 shrink-0 text-chrome group-hover:text-white" strokeWidth={1.5} />
                        <span>
                          <span className="block text-lg font-semibold leading-tight">{title}</span>
                          <span className="mt-0.5 block text-[15px] leading-snug text-white/70">{line}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>

          <div className="grid gap-2 border-t border-white/10 p-4 sm:grid-cols-2">
            {signedIn ? (
              <Link href="/portal" className="btn-primary sm:col-span-2">My account</Link>
            ) : (
              <>
                <Link href="/signup" className="btn-primary">Create account</Link>
                <Link href="/login" className="btn border border-white/25 text-white hover:bg-white/10">Log in</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
