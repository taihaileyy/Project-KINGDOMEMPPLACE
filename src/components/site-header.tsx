"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { OPEN_MENU_EVENT } from "@/components/mobile-tabs";
import { MenuButton, SideDrawer, type DrawerGroup } from "@/components/side-drawer";
import { Wordmark } from "@/components/wordmark";
import { NavItemView } from "@/components/nav-dropdown";
import { navTree } from "@/content/site";

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

// The phone and tablet menu follows the desktop hierarchy: direct links, and
// accordion groups that open to show what is inside.
const drawerGroups: DrawerGroup[] = [
  ...navTree.map<DrawerGroup>((n) =>
    n.children
      ? { title: n.label, collapsible: true, href: n.href, items: n.children.map((c) => ({ href: c.href, title: c.label, line: c.line })) }
      : { items: [{ href: n.href, title: n.label, icon: n.href === "/" ? "home" : n.href === "/housing" ? "housing" : "give" }] },
  ),
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

  // The phone tab bar's "More" opens this same menu.
  useEffect(() => {
    const open = () => setOpen(true);
    window.addEventListener(OPEN_MENU_EVENT, open);
    return () => window.removeEventListener(OPEN_MENU_EVENT, open);
  }, []);

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
          <ul className="flex items-center gap-5 2xl:gap-7">
            {navTree.map((item) => (
              <NavItemView key={item.href} item={item} />
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
              <Link
                href="/login"
                className="hidden min-h-10 items-center rounded-[var(--radius-control)] border border-white/35 px-5 text-[14px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10 sm:inline-flex"
              >
                Log in
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
