import type { Metadata } from "next";
import { ReelsFeed } from "@/components/reels/reels-feed";
import { fetchMedia } from "@/lib/media";

export const metadata: Metadata = {
  title: "Watch",
  description: "Short videos, teaching and conversations from Kingdom Empowerment Place. Like, comment and share.",
};

// Always read fresh, so new videos added in Admin appear right away.
export const dynamic = "force-dynamic";

export default async function WatchPage({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  const { v } = await searchParams;
  const items = await fetchMedia();
  // Vertical shorts first, like a reels feed, then the rest.
  const ordered = [...items.filter((m) => m.orientation === "vertical"), ...items.filter((m) => m.orientation !== "vertical")];
  return <ReelsFeed items={ordered} startId={v} />;
}
