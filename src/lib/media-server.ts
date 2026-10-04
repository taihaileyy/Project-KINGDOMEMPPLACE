import "server-only";
import { isFacebookUrl, youTubeId, type MediaSource } from "@/lib/media";

// Works out how a pasted address should be played. Staff only paste a link or
// upload a file; the rest is detected here.
export async function detectMedia(rawUrl: string): Promise<{ source: MediaSource; embed_url: string | null; orientation: "landscape" | "vertical" | null; poster: string | null }> {
  const url = rawUrl.trim();
  const yt = youTubeId(url);
  if (yt) {
    return { source: "youtube", embed_url: `https://www.youtube-nocookie.com/embed/${yt}`, orientation: /\/shorts\//.test(url) ? "vertical" : null, poster: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` };
  }
  if (isFacebookUrl(url)) {
    const { embed, vertical } = await facebookCanonical(url);
    return { source: "facebook", embed_url: embed, orientation: vertical ? "vertical" : null, poster: null };
  }
  if (url.includes("/storage/v1/object/public/site-media/")) return { source: "upload", embed_url: null, orientation: null, poster: null };
  return { source: "external", embed_url: null, orientation: null, poster: null };
}

// Facebook "share" links hide the real address. When logged out they redirect
// to a login page whose address carries the post's ids, so read them from there.
async function facebookCanonical(url: string): Promise<{ embed: string | null; vertical: boolean }> {
  const direct = url.match(/facebook\.com\/(reel)\/(\d+)/i);
  if (direct) return { embed: url, vertical: true };
  if (/facebook\.com\/[^/]+\/(videos|posts)\/\d+/i.test(url) || /facebook\.com\/watch\/?\?v=/i.test(url)) return { embed: url, vertical: false };
  const share = url.match(/facebook\.com\/share\/([rvp])\//i);
  if (!share) return { embed: null, vertical: false };
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(8000) });
    const final = decodeURIComponent(res.url);
    const story = final.match(/story_fbid=(\d+)/)?.[1];
    const owner = final.match(/[?&%]id=(\d+)/)?.[1];
    if (!story) return { embed: null, vertical: share[1] === "r" };
    if (share[1] === "r") return { embed: `https://www.facebook.com/reel/${story}`, vertical: true };
    if (!owner) return { embed: null, vertical: false };
    return { embed: `https://www.facebook.com/${owner}/${share[1] === "v" ? "videos" : "posts"}/${story}`, vertical: false };
  } catch {
    return { embed: null, vertical: share[1] === "r" };
  }
}
