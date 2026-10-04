"use client";

import { usePathname } from "next/navigation";

// Hides its children on certain pages (the reels use the whole screen).
export function ChromeGate({ hideOn, children }: { hideOn: string[]; children: React.ReactNode }) {
  const pathname = usePathname();
  return hideOn.includes(pathname) ? null : <>{children}</>;
}
