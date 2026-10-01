"use client";

import { useEffect, useRef, useState } from "react";
import { VideoPlayer } from "@/components/paradise/video-player";
import type { PdLesson } from "@/lib/paradise/types";

// The learning level: the video for the missed question, and a way back.
export function LessonScreen({
  lesson,
  scripture,
  explanation,
  requireWatch,
  fallbackSeconds,
  actionLabel,
  onAction,
  leaving,
}: {
  lesson: PdLesson | null;
  scripture: string | null;
  explanation: string | null;
  requireWatch: boolean;
  fallbackSeconds: number;
  actionLabel: string;
  onAction: () => void;
  leaving: boolean;
}) {
  const hasVideo = Boolean(lesson?.video_url);
  const [done, setDone] = useState(!hasVideo || !requireWatch);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  // Some outside videos can't tell us when they end; unlock after a set wait.
  const untracked = () => {
    if (done || timer.current) return;
    timer.current = window.setTimeout(() => setDone(true), fallbackSeconds * 1000);
  };

  return (
    <div className={`pd-ui overflow-y-auto ${leaving ? "pd-card-out-up" : ""}`}>
      <div className="h-11 shrink-0" />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-5 py-4 text-center">
        <header className="pd-card-in">
          <p className="pd-eyebrow">Learning level</p>
          <h2 className="mt-2 font-display text-[clamp(1.9rem,6vw,3rem)] font-medium leading-tight">Let&rsquo;s revisit the Word.</h2>
        </header>

        {hasVideo && lesson?.video_url && (
          <div className="pd-card-in" style={{ "--d": "200ms" } as React.CSSProperties}>
            <VideoPlayer type={lesson.video_type} url={lesson.video_url} title={lesson.title || "Teaching video"} onEnded={() => setDone(true)} onUntracked={untracked} />
          </div>
        )}

        {(lesson?.title || lesson?.description || scripture || explanation) && (
          <div className="pd-card-in text-left sm:text-center" style={{ "--d": "320ms" } as React.CSSProperties}>
            {lesson?.title && <h3 className="font-display text-2xl font-medium sm:text-3xl">{lesson.title}</h3>}
            {lesson?.description && <p className="mt-2 text-[15px] leading-relaxed text-white/80 sm:text-base">{lesson.description}</p>}
            {explanation && <p className="mt-2 text-[15px] leading-relaxed text-white/70">{explanation}</p>}
            {scripture && <p className="mt-3 text-sm tracking-[0.08em] text-[var(--pd-gold)]">{scripture}</p>}
          </div>
        )}

        <div className="pd-card-in pb-2" style={{ "--d": "420ms" } as React.CSSProperties}>
          <button type="button" className="pd-btn pd-btn-gold" disabled={!done} onClick={onAction}>
            {actionLabel} <span aria-hidden="true">→</span>
          </button>
          {!done && <p className="mt-3 text-xs tracking-wide text-white/60">Watch the video to continue.</p>}
        </div>
      </div>
    </div>
  );
}
