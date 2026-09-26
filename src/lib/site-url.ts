import "server-only";
import { headers } from "next/headers";

// Where the site is being served from, for links in emails. Uses
// NEXT_PUBLIC_SITE_URL if set, otherwise the address of the current request,
// so it follows the site from workers.dev to a custom domain on its own.
export async function siteUrl() {
  const fixed = process.env.NEXT_PUBLIC_SITE_URL;
  if (fixed) return fixed.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return "http://localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (/^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? "http" : "https");
  return `${proto}://${host}`;
}
