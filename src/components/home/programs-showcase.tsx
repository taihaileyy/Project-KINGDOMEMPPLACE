"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Arrow } from "@/components/arrow";
import type { Img } from "@/content/site";

// `mobileHidden` drops a row on phones when the next section already features it.
type Item = { href: string; name: string; summary: string; image: Img; mobileHidden?: boolean };

// An editorial index of programs. On large screens, pointing at (or tabbing
// to) a program brings its photograph forward in the frame beside the list.
export function ProgramsShowcase({ items }: { items: Item[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
      <div data-reveal="image" className="relative hidden aspect-[4/5] self-start overflow-hidden lg:sticky lg:top-[calc(var(--header-h)+32px)] lg:block">
        {items.map((it, i) => (
          <Image
            key={it.href}
            src={it.image.src}
            alt={i === active ? it.image.alt : ""}
            width={it.image.width}
            height={it.image.height}
            sizes="40vw"
            className={`absolute inset-0 h-full w-full object-cover transition-[opacity,scale] duration-[900ms] ease-out ${
              i === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
            }`}
          />
        ))}
      </div>

      <ul className="border-t border-ink/15">
        {items.map((it, i) => (
          <li key={it.href} data-reveal style={{ "--d": `${i * 70}ms` } as React.CSSProperties} className={`border-b border-ink/15 ${it.mobileHidden ? "max-sm:hidden" : ""}`}>
            <Link
              href={it.href}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="group grid grid-cols-[auto_1fr] items-center gap-4 py-4 sm:gap-5 sm:py-7 lg:grid-cols-[1fr_auto]"
            >
              <Image
                src={it.image.src}
                alt=""
                width={it.image.width}
                height={it.image.height}
                sizes="96px"
                className="size-[4.5rem] object-cover sm:size-24 lg:hidden"
              />
              <span className="min-w-0">
                <span
                  className={`block font-display text-[1.65rem] leading-[1.05] transition-colors duration-300 sm:text-4xl lg:text-[44px] ${
                    i === active ? "lg:text-blue" : ""
                  } group-hover:text-blue`}
                >
                  {it.name}
                </span>
                <span className="mt-1.5 block max-w-md text-[14px] leading-snug text-muted max-sm:line-clamp-2 sm:mt-2 sm:text-[15px] sm:leading-relaxed">{it.summary}</span>
              </span>
              <Arrow className="hidden text-blue lg:block" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
