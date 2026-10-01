"use client";

import { GardenBackdrop } from "@/components/paradise/garden";
import type { PdLevel } from "@/lib/paradise/types";

export type Motion = "idle" | "ascend" | "descend" | "enter";

const MOTES = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  s: `${2 + ((i * 5) % 4)}px`,
  t: `${13 + ((i * 7) % 11)}s`,
  d: `-${(i * 3) % 13}s`,
  x: `${((i * 23) % 60) - 30}px`,
}));

// The world behind every screen: the garden (or a level's own artwork), the
// quiet blue learning room, drifting light, and the camera moves between them.
// The game sets `motion`, `mode` and `tone`; CSS does the cinematography.
export function ParadiseScene({
  level,
  motion,
  mode,
  tone,
  children,
  reducedMotion,
}: {
  level: PdLevel | null;
  motion: Motion;
  mode: "garden" | "learning";
  tone: "neutral" | "correct" | "wrong";
  children: React.ReactNode;
  reducedMotion: boolean;
}) {
  const image = level?.background_image_url;
  const video = level?.background_video_url;
  return (
    <div className="pd-stage absolute inset-0" data-motion={motion} data-mode={mode} data-tone={tone}>
      <div className="pd-world">
        <GardenBackdrop />
        {image && (
          // eslint-disable-next-line @next/next/no-img-element -- admin-supplied artwork from any address
          <img src={image} alt="" className="pd-bg-image" />
        )}
        {video && !reducedMotion && <video src={video} autoPlay muted loop playsInline className="pd-bg-image" aria-hidden="true" />}
        {(image || video) && <div className="pd-bg-shade" />}
        <div className="pd-motes" aria-hidden="true">
          {MOTES.map((m, i) => (
            <span key={i} className="pd-mote" style={{ left: m.left, "--s": m.s, "--t": m.t, "--d": m.d, "--x": m.x } as React.CSSProperties} />
          ))}
        </div>
      </div>
      <div className="pd-learning" aria-hidden="true">
        <div className="pd-learning-bg" />
        <div className="pd-learning-lines" />
      </div>
      <div className="pd-dim" aria-hidden="true" />
      <div className="pd-vignette" aria-hidden="true" />
      <div className="pd-bloom" aria-hidden="true" />
      <div className="pd-veil" aria-hidden="true" />
      {children}
    </div>
  );
}
