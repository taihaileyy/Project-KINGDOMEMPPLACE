"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type RefObject } from "react";
import {
  CalendarDays,
  Church,
  HandHeart,
  House,
  Images,
  Info,
  KeyRound,
  LayoutDashboard,
  Mic,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Wordmark } from "@/components/wordmark";

// Icons are named so server components (the portal and admin layouts) can
// describe their menus without passing components across the boundary.
export const drawerIcons = {
  church: Church,
  events: CalendarDays,
  programs: Users,
  housing: House,
  studio: Mic,
  give: HandHeart,
  about: Info,
  gallery: Images,
  dashboard: LayoutDashboard,
  profile: UserRound,
  password: KeyRound,
} satisfies Record<string, LucideIcon>;
export type DrawerIcon = keyof typeof drawerIcons;

export type DrawerItem = { href: string; title: string; line?: string; icon: DrawerIcon };
export type DrawerGroup = { title?: string; items: DrawerItem[] };

export function isActivePath(pathname: string, href: string) {
  if (href === "/portal" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

// KEP's slide-out menu: a see-through black panel that slides in from the
// right over half the screen, with grouped rows, each an icon, a title
// and an optional one-line description. The current page gets a thin electric
// blue bar, a blue icon and a faint blue tint. It stays mounted so it can
// slide; `inert` keeps it out of reach while closed.
export function SideDrawer({
  open,
  onClose,
  triggerRef,
  label,
  groups,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  label: string;
  groups: DrawerGroup[];
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => onCloseRef.current(), [pathname]);

  // While open: lock page scroll, close on Escape, keep Tab inside the panel,
  // and hand focus back to the button that opened it.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const trigger = triggerRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onCloseRef.current();
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
  }, [open, triggerRef]);

  return (
    <div className={`fixed inset-0 z-40 overflow-hidden ${open ? "" : "pointer-events-none"}`} inert={!open}>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-black/25 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`absolute inset-y-0 right-0 flex w-[82vw] max-w-[560px] flex-col overflow-hidden rounded-l-[28px] border-l border-white/10 bg-black/70 text-white shadow-2xl backdrop-blur-2xl backdrop-saturate-150 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none sm:w-1/2 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-4 px-6 pb-2 pt-5">
          <Wordmark showName={false} logoClass="h-12 w-auto" priority={false} />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-11 place-items-center rounded-full text-white/85 hover:bg-white/10 hover:text-white"
          >
            <X aria-hidden="true" className="size-7" strokeWidth={1.75} />
          </button>
        </div>

        <nav aria-label={label} className="flex-1 overflow-y-auto px-3 pb-4">
          {groups.map((group, gi) => (
            <section key={group.title ?? gi} className="mt-4 first:mt-2">
              {group.title && <h2 className="px-3 font-display text-2xl font-extrabold tracking-tight">{group.title}</h2>}
              <ul className="mt-2 grid gap-0.5">
                {group.items.map(({ href, title, line, icon }, ii) => {
                  const Icon = drawerIcons[icon];
                  return (
                    <li
                      key={href}
                      className={open ? "rise" : ""}
                      style={{ "--d": `${120 + (gi * 3 + ii) * 40}ms` } as React.CSSProperties}
                    >
                      <Link
                        href={href}
                        aria-current={isActivePath(pathname, href) ? "page" : undefined}
                        className="group relative flex items-center gap-4 rounded-2xl px-3 py-2.5 before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-full before:bg-electric before:opacity-0 hover:bg-white/10 aria-[current=page]:bg-electric/15 aria-[current=page]:before:opacity-100"
                      >
                        <Icon
                          aria-hidden="true"
                          className="size-7 shrink-0 text-chrome group-hover:text-white group-aria-[current=page]:text-electric"
                          strokeWidth={1.5}
                        />
                        <span>
                          <span className="block text-lg font-semibold leading-tight">{title}</span>
                          {line && <span className="mt-0.5 block text-[15px] leading-snug text-white/70">{line}</span>}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>

        {footer && <div className="border-t border-white/10 p-4">{footer}</div>}
      </div>
    </div>
  );
}

export function MenuButton({
  buttonRef,
  open,
  onOpen,
  className = "",
}: {
  buttonRef: RefObject<HTMLButtonElement | null>;
  open: boolean;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label="Open menu"
      aria-expanded={open}
      aria-haspopup="dialog"
      onClick={onOpen}
      className={`grid size-11 place-items-center rounded-[var(--radius-control)] border ${className}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
  );
}
