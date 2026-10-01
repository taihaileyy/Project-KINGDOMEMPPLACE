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
      { href: "/housing", title: "Sober Living Program", line: "A sober home with structure and support.", icon: "housing" },
      { href: "/studio/book", title: "Book the Studio", line: "Record, film and create at KEP.", icon: "studio" },
      { href: "/give", title: "Give", line: "Support the work on North Foster Drive.", icon: "give" },
    ],
  },
  {
    title: "Discover",
    items: [
      { href: "/about", title: "About KEP", line: "Our story, our leaders and where to find us.", icon: "about" },
      { href: "/paradise", title: "Paradise", line: "An interactive Bible experience.", icon: "paradise" },
      { href: "/gallery", title: "Gallery", line: "Photos from life at KEP.", icon: "gallery" },
    ],
  },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const signedIn = useSignedIn();
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);

  // On the homepage the header sits transparently over the hero; once the
  // page scrolls (and on every other page) it becomes a translucent
  // blue-black bar.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const solid = scrolled || pathname !== "/";

  return (
    <header className="site-header fixed inset-x-0 top-0 z-30 text-white">
      {/* Legibility over the hero photo while the bar is transparent. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 via-black/30 to-transparent transition-opacity duration-500 ${
          solid ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        className={`absolute inset-0 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ${
          solid ? "border-white/10 bg-blueblack/90 backdrop-blur-xl backdrop-saturate-150" : "border-transparent bg-transparent"
        }`}
      />
      <div className="relative mx-auto flex h-[var(--header-h)] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Wordmark nameClass="max-[359px]:hidden xl:hidden 2xl:inline" logoClass="h-8 w-auto sm:h-9" />
        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-7">
            {siteNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                  className="relative inline-flex min-h-11 items-center whitespace-nowrap text-[14px] font-medium tracking-[0.02em] text-white/75 transition-colors after:absolute after:inset-x-0 after:bottom-2 after:h-px after:origin-left after:scale-x-0 after:bg-electric after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100 aria-[current=page]:text-white aria-[current=page]:after:scale-x-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-5">
          {signedIn ? (
            <Link href="/portal" className="hidden min-h-11 items-center text-[14px] font-semibold text-white hover:text-chrome sm:inline-flex">
              My account
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden min-h-11 items-center text-[14px] font-medium text-white/75 hover:text-white sm:inline-flex">
                Log in
              </Link>
              <Link
                href="/signup"
                className="hidden min-h-10 items-center rounded-[var(--radius-control)] border border-white/35 px-4 text-[14px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10 sm:inline-flex"
              >
                Create account
              </Link>
            </>
          )}
          <MenuButton
            buttonRef={triggerRef}
            open={open}
            onOpen={() => setOpen(true)}
            className="border-white/25 text-white hover:bg-white/10 xl:hidden"
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
