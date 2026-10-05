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
      <div>
        <main id="main" className="pt-[var(--header-h)]">{children}</main>
        <ChromeGate hideOn={["/watch"]}>
          <SiteFooter />
        </ChromeGate>
      </div>
      <RevealObserver />
    </ScheduleProvider>
  );
}
