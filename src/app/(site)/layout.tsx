import { RevealObserver } from "@/components/reveal-observer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {/* The header is fixed; pages start below it. The homepage hero pulls
          itself back up underneath (see .hero-under-header). */}
      <main id="main" className="pt-[var(--header-h)]">{children}</main>
      <SiteFooter />
      <RevealObserver />
    </>
  );
}
