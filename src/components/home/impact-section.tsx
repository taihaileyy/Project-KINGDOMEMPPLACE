"use client";

import { useEffect, useRef, useState } from "react";
import {
  Award,
  Briefcase,
  CalendarDays,
  Church,
  GraduationCap,
  HandHeart,
  House,
  KeyRound,
  Mic,
  Sprout,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

type Metric = { key: string; label: string; value: number | null };

// Each public metric gets a quiet icon; unknown keys fall back to people.
const metricIcons: Record<string, LucideIcon> = {
  people_served: Users,
  currently_housed: House,
  transitioned_from_housing: KeyRound,
  residents_employed: Briefcase,
  program_participants: GraduationCap,
  youth_mentored: Sprout,
  program_completions: Award,
  events_held: CalendarDays,
  event_attendance: Ticket,
};

const factIcons = { programs: GraduationCap, church: Church, studio: Mic, ages: HandHeart } satisfies Record<string, LucideIcon>;
export type Fact = { value: string; label: string; icon: keyof typeof factIcons };

// Live totals come from public_impact(), which only returns aggregate numbers
// an admin has switched on (totals under 5 come back as null). Until any are
// switched on, the section shows plain facts about KEP, never made-up numbers.
export function ImpactSection({ facts, className = "", tone = "dark" }: { facts: Fact[]; className?: string; tone?: "dark" | "light" }) {
  const light = tone === "light";
  const [metrics, setMetrics] = useState<Metric[] | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`${SUPABASE_URL}/rest/v1/rpc/public_impact`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: "{}",
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Metric[]) => setMetrics(Array.isArray(rows) ? rows : []))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  const live = metrics && metrics.length > 0 ? metrics.slice(0, 8) : null;

  return (
    <section aria-labelledby="impact-title" className={`relative isolate overflow-hidden ${light ? "bg-[#f5f0e6] text-ink" : "bg-night text-white"} ${className}`}>
      {/* One slow glow from the navy of the KEP artwork. */}
      <div
        aria-hidden="true"
        className={`absolute -right-56 -top-64 -z-10 size-[760px] animate-[drift_18s_ease-in-out_infinite_alternate] rounded-full bg-[radial-gradient(circle,rgb(31_51_184/0.35),transparent_62%)] ${light ? "hidden" : ""}`}
      />
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-20">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end">
          <h2 id="impact-title" data-reveal="mask" className="font-display text-[2.9rem] font-medium leading-[0.95] sm:text-8xl">
            Our impact
          </h2>
          <p data-reveal style={{ "--d": "150ms" } as React.CSSProperties} className={`max-w-md text-[15px] leading-relaxed sm:text-lg lg:justify-self-end ${light ? "text-muted" : "text-chrome"}`}>
            {live
              ? "Live totals from KEP's own records. Totals under 5 aren't shown, to protect people's privacy."
              : "Live totals from KEP's records will appear here as our new platform grows. For now, KEP at a glance."}
          </p>
        </div>

        <dl className={`mt-7 grid grid-cols-2 border-t sm:mt-10 lg:grid-cols-4 ${light ? "border-ink/15" : "border-white/15"}`}>
          {live
            ? live.map((m, i) => (
                <Stat light={light} key={m.key} i={i} Icon={metricIcons[m.key] ?? Users} label={m.label} wide={m.value === null}>
                  {m.value === null ? <span className="whitespace-normal text-3xl sm:text-4xl">Fewer than 5</span> : <CountUp to={m.value} />}
                </Stat>
              ))
            : facts.map((f, i) => (
                <Stat light={light} key={f.label} i={i} Icon={factIcons[f.icon]} label={f.label} wide={!/^\d+\+?$/.test(f.value)}>
                  {/^\d+$/.test(f.value) ? <CountUp to={Number(f.value)} /> : f.value}
                </Stat>
              ))}
        </dl>
      </div>
    </section>
  );
}

// On phones a long figure ("All ages", "Fewer than 5") takes a full row so it
// stays on one line at the same size as its neighbours, instead of wrapping.
function Stat({ Icon, label, i, wide = false, light = false, children }: { Icon: LucideIcon; label: string; i: number; wide?: boolean; light?: boolean; children: React.ReactNode }) {
  return (
    <div
      data-reveal
      style={{ "--d": `${i * 120}ms` } as React.CSSProperties}
      className={`flex flex-col border-b py-6 pr-4 even:border-l even:pl-5 sm:py-8 lg:border-b-0 lg:border-l lg:px-8 lg:py-10 lg:first:border-l-0 lg:first:pl-0 ${light ? "border-ink/15" : "border-white/15"}`}
    >
      <dt className={`order-3 mt-3 text-[15px] leading-snug ${light ? "text-muted" : "text-chrome"}`}>{label}</dt>
      <Icon aria-hidden="true" className={`order-1 size-5 ${light ? "text-blue" : "text-electric"}`} strokeWidth={1.5} />
      <dd
        className={`order-2 mt-4 flex items-end font-display font-normal leading-none max-sm:h-[3.4rem] sm:mt-6 sm:text-7xl lg:whitespace-nowrap lg:text-[clamp(4.5rem,6.4vw,6rem)] ${
          wide ? "text-[2.4rem] max-sm:whitespace-nowrap sm:text-7xl" : "text-[3.4rem] sm:text-7xl"
        }`}
      >
        {children}
      </dd>
    </div>
  );
}

// Counts up once when the number scrolls into view; shows the total straight
// away for people who prefer reduced motion.
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(to);
      return;
    }
    let frame = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / 1200);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to]);

  return <span ref={ref}>{n.toLocaleString("en-US")}</span>;
}
