import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";
import { images, programs as staticPrograms, recentEvents, type Img, type Program } from "@/content/site";

// Programs and events live in the database (staff edit them in Admin). These
// readers use only the public key, so they work on the server and in the
// browser, and fall back to the lists in content/site.ts if the database can't
// be reached, so the public pages never go blank.

const known = new Map<string, Img>(Object.values(images).map((i) => [i.src, i]));
function img(src: string | null, alt: string): Img | null {
  if (!src) return null;
  const k = known.get(src);
  return { src, width: k?.width ?? 1100, height: k?.height ?? 1500, alt: k?.alt || alt };
}

async function rest<T>(path: string): Promise<T[] | null> {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: { apikey: SUPABASE_ANON_KEY }, cache: "no-store" });
    if (!r.ok) return null;
    const rows = await r.json();
    return Array.isArray(rows) ? rows : null;
  } catch {
    return null;
  }
}

export type CatalogProgram = Program & { id: string | null; category: "youth" | "build" | "technology" | "general"; requires_approval: boolean };

const staticCategory: Record<string, CatalogProgram["category"]> = {
  "youth-mentorship": "youth", arts: "youth", entrepreneurship: "build", media: "build", "computer-lab": "technology",
};

type ProgramRow = { id: string; slug: string; name: string; summary: string; body: string[]; highlights: string[]; image_path: string | null; art: "arts" | null; category: CatalogProgram["category"]; requires_approval: boolean };

export async function fetchPrograms(): Promise<CatalogProgram[]> {
  const rows = await rest<ProgramRow>("programs?select=id,slug,name,summary,body,highlights,image_path,art,category,requires_approval&is_active=eq.true&order=sort_order.asc");
  if (!rows || rows.length === 0) {
    return staticPrograms.map((p) => ({ ...p, id: null, category: staticCategory[p.slug] ?? "general", requires_approval: true }));
  }
  return rows.map((r) => ({
    id: r.id, slug: r.slug, name: r.name, summary: r.summary, body: r.body, highlights: r.highlights,
    image: img(r.image_path, r.name) ?? images.celebration, art: r.art ?? undefined, category: r.category, requires_approval: r.requires_approval,
  }));
}

export async function fetchProgram(slug: string): Promise<CatalogProgram | null> {
  return (await fetchPrograms()).find((p) => p.slug === slug) ?? null;
}

export type CatalogEvent = {
  id: string | null;
  slug: string;
  title: string;
  blurb: string;
  details: string | null;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  image: Img | null;
  requires_registration: boolean;
  capacity: number | null;
};

type EventRow = { id: string; slug: string; title: string; blurb: string; details: string | null; starts_at: string; ends_at: string | null; location: string | null; image_path: string | null; requires_registration: boolean; capacity: number | null };

export async function fetchEvents(): Promise<CatalogEvent[]> {
  const rows = await rest<EventRow>("events?select=id,slug,title,blurb,details,starts_at,ends_at,location,image_path,requires_registration,capacity&is_published=eq.true&order=starts_at.desc");
  if (!rows || rows.length === 0) {
    return recentEvents.map((e) => ({
      id: null, slug: e.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), title: e.title, blurb: "", details: null,
      starts_at: null, ends_at: null, location: e.place ?? null, image: e.image, requires_registration: false, capacity: null,
    }));
  }
  return rows.map((r) => ({ ...r, image: img(r.image_path, r.title) }));
}

const TZ = "America/Chicago";
export const isUpcoming = (e: CatalogEvent, now = new Date()) =>
  e.starts_at ? new Date(e.ends_at ?? new Date(new Date(e.starts_at).getTime() + 24 * 3600 * 1000)) >= now : false;

export function eventDate(e: CatalogEvent) {
  return e.starts_at ? new Date(e.starts_at).toLocaleDateString("en-US", { timeZone: TZ, weekday: "short", month: "long", day: "numeric", year: "numeric" }) : "";
}
export function eventTime(e: CatalogEvent) {
  if (!e.starts_at) return "";
  const f = (d: string) => new Date(d).toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" });
  return e.ends_at ? `${f(e.starts_at)} - ${f(e.ends_at)}` : f(e.starts_at);
}
