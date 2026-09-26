import { headers } from "next/headers";

// Public values only. The Supabase URL and publishable key are meant to be
// visible in the browser; access is enforced by Row Level Security. The
// defaults point at KEP's live project, so the site works without any
// variables set in Cloudflare. Set the variables to use a different project.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://njnuvgitrryxbdmfuugx.supabase.co";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_x0HqrTsIwWhPLal51HO9vA_oJmaKPt2";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

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
