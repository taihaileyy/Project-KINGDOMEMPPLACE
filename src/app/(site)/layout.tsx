import { MobileTabs } from "@/components/mobile-tabs";
import { RevealObserver } from "@/components/reveal-observer";
import { ScheduleProvider } from "@/components/schedule-provider";
import { ChromeGate } from "@/components/chrome-gate";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ScheduleProvider>
      <SiteHeader />
      {/* The header is fixed; pages start below it. The homepage hero pulls
          itself back up underneath (see .hero-under-header). */}
      {/* On phones the bottom tab bar covers the last 3.6rem, so leave room for it. */}
      <div className="max-sm:pb-[calc(3.6rem+env(safe-area-inset-bottom))]">
        <main id="main" className="pt-[var(--header-h)]">{children}</main>
        <ChromeGate hideOn={["/watch"]}>
          <SiteFooter />
        </ChromeGate>
      </div>
      <MobileTabs />
      <RevealObserver />
    </ScheduleProvider>
  );
}
