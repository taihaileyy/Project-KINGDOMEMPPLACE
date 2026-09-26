"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MenuButton, SideDrawer, isActivePath, type DrawerGroup } from "@/components/side-drawer";
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

// The slide-out menu groups every page under a plain heading, each with an
// icon and a one-line description, so people can find their way in by need.
const drawerGroups: DrawerGroup[] = [
  {
    title: "Get connected",
    items: [
      { href: "/church", title: "Church", line: "Worship times and what to expect.", icon: "church" },
      { href: "/events", title: "Events", line: "Conferences, workshops and gatherings.", icon: "events" },
      { href: "/programs", title: "Programs", line: "Youth, arts, business, media and tech.", icon: "programs" },
    ],
  },
  {
    title: "Take your next step",
    items: [
      { href: "/housing", title: "Housing", line: "Sober living with structure and support.", icon: "housing" },
      { href: "/studio", title: "Book the Studio", line: "Record, film and create at KEP.", icon: "studio" },
      { href: "/give", title: "Give", line: "Support the work on North Foster Drive.", icon: "give" },
    ],
  },
  {
    title: "Discover",
    items: [
      { href: "/about", title: "About KEP", line: "Our story, our leaders and where to find us.", icon: "about" },
      { href: "/gallery", title: "Gallery", line: "Photos from life at KEP.", icon: "gallery" },
    ],
  },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const signedIn = useSignedIn();
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);

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
                  aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
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
          <MenuButton
            buttonRef={triggerRef}
            open={open}
            onOpen={() => setOpen(true)}
            className="border-line bg-paper text-ink hover:bg-surface xl:hidden"
          />
        </div>
      </div>

      <div className="xl:hidden">
        <SideDrawer
          open={open}
          onClose={() => setOpen(false)}
          triggerRef={triggerRef}
          label="Menu"
          groups={drawerGroups}
          footer={
            signedIn ? (
              <Link href="/portal" className="btn-primary w-full">My account</Link>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <Link href="/signup" className="btn-primary">Create account</Link>
                <Link href="/login" className="btn border border-white/25 text-white hover:bg-white/10">Log in</Link>
              </div>
            )
          }
        />
      </div>
    </header>
  );
}
