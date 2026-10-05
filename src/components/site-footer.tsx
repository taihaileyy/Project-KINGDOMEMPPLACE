import Link from "next/link";
import { SocialLinks } from "@/components/social-links";
import { Wordmark } from "@/components/wordmark";
import { fullAddress, org } from "@/content/site";

// Compact footer: who we are, how to reach us, and the main places to go.
const links = [
  { href: "/", label: "Home" },
  { href: "/church", label: "Church" },
  { href: "/programs", label: "Programs" },
  { href: "/housing", label: "Sober Living" },
  { href: "/events", label: "Events" },
  { href: "/give", label: "Give" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-night text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 sm:grid-cols-2 sm:py-10 lg:grid-cols-[1fr_1fr_1.2fr] lg:items-start">
        <div>
          <Wordmark nameClass="" logoClass="h-12 w-auto sm:h-14" priority={false} />
          <p className="mt-3 text-[0.95rem] text-chrome">Faith. Community. Opportunity.</p>
          <SocialLinks className="mt-4" />
        </div>
        <address className="text-[0.9rem] not-italic leading-6 text-white/85">
          <a href={org.mapsUrl} className="hover:underline" target="_blank" rel="noopener noreferrer">{fullAddress}</a>
          <br />
          <a href={org.phoneHref} className="hover:underline">{org.phone}</a>
          <br />
          <a href={`mailto:${org.email}`} className="break-all hover:underline">{org.email}</a>
        </address>
        <nav aria-label="Footer" className="sm:col-span-2 lg:col-span-1 lg:justify-self-end">
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[0.9rem] text-white/85">
            {links.map((l) => (
              <li key={l.href}><Link href={l.href} className="inline-flex min-h-9 items-center hover:underline">{l.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-6 py-4 text-[13px] text-chrome">
          <p>© {new Date().getFullYear()} {org.name}</p>
          <p className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/login" className="hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
