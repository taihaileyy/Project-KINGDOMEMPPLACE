import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

// The video and audio library (Admin > Videos). Pages ask for media by
// collection, so adding a video never needs a code change.

export type MediaSource = "youtube" | "facebook" | "upload" | "external";

export type MediaItem = {
  id: string;
  kind: "video" | "audio";
  source: MediaSource;
  url: string;
  embed_url: string | null;
  title: string;
  description: string | null;
  orientation: "landscape" | "vertical";
  poster_url: string | null;
  transcript: string | null;
  captions_url: string | null;
  collections: string[];
  sort_order: number;
};

const FIELDS = "id,kind,source,url,embed_url,title,description,orientation,poster_url,transcript,captions_url,collections,sort_order";

// Reads active media, optionally only items tagged with `collection`. Works in
// the browser and on the server (it only uses the public key; RLS hides drafts).
export async function fetchMedia(collection?: string): Promise<MediaItem[]> {
  const filter = collection ? `&collections=cs.%7B${encodeURIComponent(collection)}%7D` : "";
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/media_items?select=${FIELDS}&is_active=eq.true${filter}&order=sort_order.asc,created_at.desc`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      cache: "no-store",
    });
    if (!r.ok) return [];
    const rows = await r.json();
    // Never show unfinished placeholder titles such as "reel 1" or "video 2".
    const placeholder = /(^|:\s*)(reel|video|post)\s*\d*$/i;
    return Array.isArray(rows) ? rows.filter((m: MediaItem) => !placeholder.test((m.title ?? "").trim())) : [];
  } catch {
    return [];
  }
}

export function youTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (u.hostname.endsWith("youtube.com") || u.hostname.endsWith("youtube-nocookie.com")) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const m = u.pathname.match(/\/(embed|shorts|live|v)\/([\w-]{6,})/);
      if (m) return m[2];
    }
  } catch {
    /* not a URL */
  }
  return null;
}

export const isFacebookUrl = (url: string) => /^https?:\/\/(www\.|m\.|web\.)?(facebook\.com|fb\.watch)\//i.test(url);
export const isDirectFile = (url: string) => /\.(mp4|webm|mov|m4v|ogv|mp3|m4a|ogg|wav)(\?|#|$)/i.test(url);

// The address Facebook's embed plugin needs: posts use the post plugin, everything else the video plugin.
export function facebookPluginUrl(item: Pick<MediaItem, "url" | "embed_url">): string {
  const href = encodeURIComponent(item.embed_url || item.url);
  const isPost = /\/posts\/|\/permalink|story_fbid/.test(item.embed_url || item.url);
  return isPost
    ? `https://www.facebook.com/plugins/post.php?href=${href}&show_text=true&width=500`
    : `https://www.facebook.com/plugins/video.php?href=${href}&show_text=false&autoplay=true&allowfullscreen=true`;
}

export function posterFor(item: MediaItem): string | null {
  if (item.poster_url) return item.poster_url;
  if (item.source === "youtube") {
    const id = youTubeId(item.embed_url || item.url);
    if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  }
  return null;
}

export const sourceLabel: Record<MediaSource, string> = { youtube: "YouTube", facebook: "Facebook", upload: "KEP video", external: "Video" };

// Collections an item can belong to, as used by the pages.
export const COLLECTION = {
  featured: "featured",
  shorts: "shorts",
  watch: "watch",
  program: (slug: string) => `program:${slug}`,
  event: (slug: string) => `event:${slug}`,
} as const;

export const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
