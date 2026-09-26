import Link from "next/link";
import { AppMenu, AppTabs, type NavItem } from "@/components/app-nav";
import { Wordmark } from "@/components/wordmark";

export type { NavItem };

// Shared frame for the portal and the admin area, in the same black, white and
// electric-blue language as the public site's menu drawer.
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
  switchLink?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-night text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Wordmark showName={false} />
          <span className="rounded-full border border-electric/40 bg-electric/15 px-2.5 py-1 text-xs font-semibold text-white">{area}</span>
          <div className="ml-auto flex items-center gap-3">
            {switchLink && (
              <Link href={switchLink.href} className="btn hidden border border-white/20 text-white hover:bg-white/10 sm:inline-flex">
                {switchLink.label}
              </Link>
            )}
            <span className="hidden text-sm text-chrome md:inline">{name}</span>
            <form action="/auth/signout" method="post" className="hidden sm:block">
              <button className="btn border border-white/20 text-white hover:bg-white/10">Log out</button>
            </form>
            <AppMenu nav={nav} title={area} label={`${area} sections`} switchLink={switchLink} />
          </div>
        </div>
        <AppTabs nav={nav} label={`${area} sections`} />
      </header>
      <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

// The black band that opens each dashboard: a title, a short line and
// optional actions, with the same soft blue glow as the public site.
export function DashboardBand({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-night p-6 text-white sm:p-8">
      <div
        aria-hidden="true"
        className="absolute -right-40 -top-64 -z-10 size-[640px] rounded-full bg-[radial-gradient(circle,rgb(92_107_255/0.3),transparent_70%)] blur-2xl"
      />
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
      {lead && <p className="mt-3 max-w-2xl text-lg leading-relaxed text-chrome">{lead}</p>}
      {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
    </section>
  );
}
