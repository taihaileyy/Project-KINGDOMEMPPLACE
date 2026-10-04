"use client";

import { MediaDetails, MediaPlayer } from "@/components/media/media-player";
import type { MediaItem } from "@/lib/media";

export function FeaturedPlayer({ item }: { item: MediaItem }) {
  return (
    <div className={item.orientation === "vertical" ? "mx-auto max-w-sm" : ""}>
      <MediaPlayer item={item} />
      <MediaDetails item={item} />
    </div>
  );
}
