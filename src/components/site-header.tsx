"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/wordmark";
import { siteNav } from "@/content/site";


// Public pages stay static, so the header doesn't check the session. Signed-in
// people who click "Log in" are sent straight to My KEP.
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
          <Link href="/login" className="btn-secondary hidden sm:inline-flex">Log in</Link>
          <Link href="/signup" className="btn-primary hidden sm:inline-flex">Create account</Link>
          <button
            type="button"
            className="btn-secondary xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-[64px] overflow-y-auto bg-paper xl:hidden">
          <nav aria-label="Main" className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6">
            <ul className="grid gap-1">
              {siteNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="flex min-h-14 items-center rounded-2xl px-4 font-display text-2xl font-extrabold tracking-tight hover:bg-surface aria-[current=page]:text-blue"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link href="/signup" className="btn-primary">Create account</Link>
              <Link href="/login" className="btn-secondary">Log in</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
