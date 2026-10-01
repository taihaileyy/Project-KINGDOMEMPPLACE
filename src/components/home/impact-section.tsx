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
export function ImpactSection({ facts }: { facts: Fact[] }) {
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
    <section aria-labelledby="impact-title" className="relative isolate overflow-hidden bg-night text-white">
      {/* One soft glow, the light in the KEP logo. */}
      <div
        aria-hidden="true"
        className="absolute -left-48 -top-56 -z-10 size-[640px] animate-[drift_16s_ease-in-out_infinite_alternate] rounded-full bg-[radial-gradient(circle,rgb(92_107_255/0.28),transparent_62%)]"
      />
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-16">
        <div data-reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2 id="impact-title" className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Our impact
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-chrome">
            {live
              ? "Live totals from KEP's own records. Totals under 5 aren't shown, to protect people's privacy."
              : "Live totals from KEP's records will appear here as our new platform grows. For now, KEP at a glance."}
          </p>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-x-10">
          {live
            ? live.map((m) => (
                <Stat key={m.key} Icon={metricIcons[m.key] ?? Users} label={m.label}>
                  {m.value === null ? <span className="whitespace-normal text-3xl sm:text-4xl">Fewer than 5</span> : <CountUp to={m.value} />}
                </Stat>
              ))
            : facts.map((f) => (
                <Stat key={f.label} Icon={factIcons[f.icon]} label={f.label}>
                  {/^\d+$/.test(f.value) ? <CountUp to={Number(f.value)} /> : f.value}
                </Stat>
              ))}
        </dl>
      </div>
    </section>
  );
}

function Stat({ Icon, label, children }: { Icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col border-t border-white/15">
      {/* Thin blue rule over the start of each figure. */}
      <span aria-hidden="true" className="-mt-px block h-0.5 w-12 bg-electric" />
      <dt className="order-3 mt-2 text-[15px] leading-snug text-chrome">{label}</dt>
      <Icon aria-hidden="true" className="order-1 mt-5 size-6 text-electric" strokeWidth={1.75} />
      <dd className="order-2 mt-3 font-display text-4xl font-extrabold leading-none tracking-tight sm:text-6xl lg:text-7xl">
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
