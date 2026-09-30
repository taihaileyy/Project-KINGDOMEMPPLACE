import Link from "next/link";
import { SocialLinks } from "@/components/social-links";
import { Wordmark } from "@/components/wordmark";
import { fullAddress, moreNav, org, siteNav, weekly } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="bg-night text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark showName={false} />
          <p className="mt-5 max-w-sm font-display text-2xl font-extrabold leading-tight tracking-tight">{org.tagline}</p>
          <p className="mt-4 text-sm text-chrome">Led by {org.pastors}</p>
          <SocialLinks className="mt-6" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-chrome">Visit</h2>
          <address className="mt-3 not-italic leading-7">
            <a href={org.mapsUrl} className="hover:underline" target="_blank" rel="noopener noreferrer">{fullAddress}</a>
            <br />
            <a href={org.phoneHref} className="hover:underline">{org.phone}</a>
            <br />
            <a href={`mailto:${org.email}`} className="break-all hover:underline">{org.email}</a>
          </address>
          <ul className="mt-4 leading-7 text-chrome">
            {weekly.map((w) => (
              <li key={w.title}>{w.title}: {w.day}s, {w.time}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold text-chrome">Explore</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 leading-8 md:grid-cols-1">
            {[...siteNav, moreNav[0]].map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:underline">{l.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-4 py-6 text-sm text-chrome sm:px-6">
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
