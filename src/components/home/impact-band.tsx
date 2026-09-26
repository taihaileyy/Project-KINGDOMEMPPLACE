"use client";

import { useEffect, useRef, useState } from "react";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

type Metric = { key: string; label: string; value: number | null };
export type Fact = { value: string; label: string };

// Live totals come from public_impact(), which only returns aggregate numbers
// an admin has switched on. Until any are switched on, the band shows plain
// facts about KEP instead of made-up statistics.
export function ImpactBand({ facts }: { facts: Fact[] }) {
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

  const live = metrics && metrics.length > 0 ? metrics : null;

  return (
    <section aria-labelledby="impact-title" className="relative isolate overflow-hidden bg-blue text-white">
      {/* The logo's light: a soft glow from the upper right, nothing more. */}
      <div
        aria-hidden="true"
        className="absolute -right-40 -top-40 -z-10 size-[520px] rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.22),transparent_65%)]"
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2 id="impact-title" className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            {live ? "Impact you can see" : "KEP at a glance"}
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-white/85">
            {live
              ? "Live totals from KEP's own records. Totals under 5 aren't shown, to protect people's privacy."
              : "A church and community home on North Foster Drive, open to every age and every season."}
          </p>
        </div>
        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {live
            ? live.map((m) => (
                <div key={m.key} className="flex flex-col border-t border-white/25 pt-4">
                  <dt className="text-sm leading-snug text-white/80">{m.label}</dt>
                  <dd className="order-first mb-1 whitespace-nowrap font-display text-4xl font-extrabold tracking-tight text-chrome sm:text-6xl lg:text-7xl">
                    {m.value === null ? <span className="whitespace-normal text-3xl sm:text-4xl lg:text-5xl">Fewer than 5</span> : <CountUp to={m.value} />}
                  </dd>
                </div>
              ))
            : facts.map((f) => (
                <div key={f.label} className="flex flex-col border-t border-white/25 pt-4">
                  <dt className="text-sm leading-snug text-white/80">{f.label}</dt>
                  <dd className="order-first mb-1 whitespace-nowrap font-display text-4xl font-extrabold tracking-tight text-chrome sm:text-6xl lg:text-7xl">
                    {f.value}
                  </dd>
                </div>
              ))}
        </dl>
      </div>
    </section>
  );
}

// Counts up once when the number scrolls into view; jumps straight to the
// total for people who prefer reduced motion.
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
