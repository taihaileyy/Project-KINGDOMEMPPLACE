"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Arms scroll reveal for every [data-reveal] element on the page (each one
// rises into place the first time it scrolls into view) and the gentle image
// parallax. Re-scans after each
// navigation. Reduced-motion users see everything straight away (CSS).
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.classList.add("reveal-ready");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-shown", "");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    document.querySelectorAll("[data-reveal]:not([data-shown])").forEach((el) => io.observe(el));

    // A fast fling can jump clean over an element, so it never "intersects".
    // Reveal anything that has reached or passed the viewport.
    let frame = 0;
    const sweep = () => {
      frame = 0;
      document.querySelectorAll("[data-reveal]:not([data-shown])").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.setAttribute("data-shown", "");
          io.unobserve(el);
        }
      });
    };
    // Subtle parallax: [data-parallax="0.06"] images drift against the
    // scroll by that fraction of their distance from the viewport center.
    // Uses the `translate` property so hover scales still work. Skipped for
    // reduced motion.
    const parallax = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? []
      : Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const drift = () => {
      const mid = window.innerHeight / 2;
      for (const el of parallax) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) continue;
        const f = Number(el.dataset.parallax) || 0.05;
        const y = Math.max(-48, Math.min(48, (r.top + r.height / 2 - mid) * -f));
        el.style.translate = `0 ${y.toFixed(1)}px`;
      }
    };
    drift();

    const onScroll = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          sweep();
          drift();
        });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);
  return null;
}
