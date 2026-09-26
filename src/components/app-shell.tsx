import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export type NavItem = { href: string; label: string };

// Shared frame for the portal and the admin area, so both feel like one KEP.
export function AppShell({
  nav,
  name,
  area,
  switchLink,
  children,
}: {
  nav: NavItem[];
  name: string;
  area: string;
  switchLink?: NavItem;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <Wordmark />
          <span className="rounded-full bg-blue-soft px-2.5 py-1 text-xs font-semibold text-blue">{area}</span>
          <div className="ml-auto flex items-center gap-3">
            {switchLink && (
              <Link href={switchLink.href} className="btn-secondary hidden sm:inline-flex">
                {switchLink.label}
              </Link>
            )}
            <span className="hidden text-sm text-muted md:inline">{name}</span>
            <form action="/auth/signout" method="post">
              <button className="btn-secondary">Log out</button>
            </form>
          </div>
        </div>
        <nav aria-label={`${area} sections`} className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6">
          <ul className="flex gap-1 pb-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold text-muted hover:bg-surface hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {switchLink && (
              <li className="sm:hidden">
                <Link href={switchLink.href} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold text-blue">
                  {switchLink.label}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </header>
      <main id="main" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
