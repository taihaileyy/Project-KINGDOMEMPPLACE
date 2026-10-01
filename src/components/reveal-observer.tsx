"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Arms scroll reveal for every [data-reveal] element on the page: each one
// rises into place the first time it scrolls into view. Re-scans after each
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
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sweep);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);
  return null;
}
