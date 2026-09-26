"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { MenuButton, SideDrawer, isActivePath, type DrawerIcon } from "@/components/side-drawer";

export type NavItem = { href: string; label: string; line?: string; icon: DrawerIcon };

// Section tabs for the portal and admin headers, from tablet width up. The
// current tab gets a thin electric-blue underline.
export function AppTabs({ nav, label }: { nav: NavItem[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="mx-auto hidden max-w-7xl px-4 sm:block sm:px-6">
      <ul className="flex gap-1 overflow-x-auto">
        {nav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
              className="relative inline-flex min-h-12 items-center whitespace-nowrap px-3 text-sm font-semibold text-chrome after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-electric after:opacity-0 hover:text-white aria-[current=page]:text-white aria-[current=page]:after:opacity-100"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// On phones the same sections open in KEP's black slide-out drawer.
export function AppMenu({
  nav,
  title,
  label,
  switchLink,
}: {
  nav: NavItem[];
  title: string;
  label: string;
  switchLink?: { href: string; label: string };
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <div className="sm:hidden">
      <MenuButton
        buttonRef={triggerRef}
        open={open}
        onOpen={() => setOpen(true)}
        className="border-white/20 text-white hover:bg-white/10"
      />
      <SideDrawer
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        label={label}
        groups={[{ title, items: nav.map((n) => ({ href: n.href, title: n.label, line: n.line, icon: n.icon })) }]}
        footer={
          <div className="grid gap-2">
            {switchLink && (
              <Link href={switchLink.href} className="btn border border-white/25 text-white hover:bg-white/10">
                {switchLink.label}
              </Link>
            )}
            <form action="/auth/signout" method="post" className="grid">
              <button className="btn border border-white/25 text-white hover:bg-white/10">Log out</button>
            </form>
          </div>
        }
      />
    </div>
  );
}
