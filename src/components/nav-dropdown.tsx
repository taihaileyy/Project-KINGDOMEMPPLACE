"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { isActivePath } from "@/components/side-drawer";
import type { NavItem } from "@/content/site";

const linkClass =
  "relative inline-flex min-h-11 items-center whitespace-nowrap text-[14px] font-medium tracking-[0.02em] text-white/75 transition-colors after:absolute after:inset-x-0 after:bottom-2 after:h-px after:origin-left after:scale-x-0 after:bg-electric after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100 aria-[current=page]:text-white aria-[current=page]:after:scale-x-100";

// One top-level item of the desktop menu. Items with children open a panel on
// hover, on focus, or when the small arrow is pressed; Escape and clicking
// elsewhere close it. The label itself always goes to the parent page.
export function NavItemView({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLLIElement>(null);
  const kids = item.children;
  const current = item.href === "/" ? pathname === "/" : isActivePath(pathname, item.href) || Boolean(kids?.some((k) => !k.href.includes("#") && isActivePath(pathname, k.href)));

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  if (!kids) {
    return (
      <li>
        <Link href={item.href} aria-current={current ? "page" : undefined} className={linkClass}>{item.label}</Link>
      </li>
    );
  }
  return (
    <li
      ref={root}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => { if (!root.current?.contains(e.relatedTarget as Node)) setOpen(false); }}
    >
      <div className="flex items-center">
        <Link href={item.href} aria-current={current ? "page" : undefined} className={linkClass}>{item.label}</Link>
        <button
          type="button"
          aria-expanded={open}
          aria-label={`${item.label} menu`}
          onClick={() => setOpen((o) => !o)}
          className="grid size-8 place-items-center rounded text-white/60 hover:text-white"
        >
          <ChevronDown aria-hidden="true" className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} strokeWidth={1.8} />
        </button>
      </div>
      {open && (
        <div className="absolute left-1/2 top-full z-40 -translate-x-1/2 pt-2">
          <ul className="w-72 rounded-2xl border border-white/10 bg-blueblack/95 p-2 shadow-2xl backdrop-blur-xl">
            {kids.map((k) => (
              <li key={k.href}>
                <Link href={k.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 hover:bg-white/10 focus-visible:bg-white/10">
                  <span className="block text-[15px] font-semibold leading-tight text-white">{k.label}</span>
                  {k.line && <span className="mt-0.5 block text-[13px] leading-snug text-white/60">{k.line}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
