"use client";

import type { PdAnswer } from "@/lib/paradise/types";

export type AnswerState = "idle" | "picked" | "correct" | "wrong" | "dim";

// ONE question template for every question in the game. It knows nothing about
// any particular question: it renders whatever text and 2 to 4 answers it is given.
export function QuestionScreen({
  levelNumber,
  levelName,
  index,
  total,
  doneInLevel,
  overallPercent,
  questionText,
  answers,
  stateFor,
  locked,
  onSelect,
  leaving,
  children,
}: {
  levelNumber: number;
  levelName: string;
  index: number; // 0-based position within the level
  total: number; // questions in the level
  doneInLevel: boolean[]; // which of the level's questions are completed
  overallPercent: number;
  questionText: string;
  answers: PdAnswer[];
  stateFor: (answerId: string) => AnswerState;
  locked: boolean;
  onSelect: (answerId: string) => void;
  leaving: "up" | "down" | null;
  children?: React.ReactNode; // the result panel (CORRECT, Scripture, Continue)
}) {
  const keys = ["A", "B", "C", "D"];
  return (
    <div className={`pd-ui ${leaving === "up" ? "pd-card-out-up" : leaving === "down" ? "pd-card-out-down" : ""}`}>
      {/* room for the exit and sound buttons */}
      <div className="h-11 shrink-0" />

      <header className="pd-card-in mx-auto w-full max-w-3xl text-center" aria-label="Progress">
        <p className="pd-eyebrow">
          Level {String(levelNumber).padStart(2, "0")} <span aria-hidden="true">·</span> {levelName}
        </p>
        <div className="mt-3 flex items-center justify-center gap-3">
          {total <= 14 ? (
            <ol className="flex items-center gap-1.5" aria-label={`Question ${index + 1} of ${total}`}>
              {Array.from({ length: total }, (_, i) => (
                <li key={i} className="pd-track-dot" data-s={i === index ? "now" : doneInLevel[i] ? "done" : "todo"} />
              ))}
            </ol>
          ) : (
            <div className="h-1 w-40 overflow-hidden rounded-full bg-white/20" role="img" aria-label={`Question ${index + 1} of ${total}`}>
              <div className="h-full bg-[var(--pd-gold)] transition-all duration-700" style={{ width: `${((index + 1) / total) * 100}%` }} />
            </div>
          )}
          <span className="text-xs tabular-nums tracking-wide text-white/65">{overallPercent}%</span>
        </div>
        <p className="mt-2 text-xs tracking-[0.14em] text-white/60 uppercase">
          Question {index + 1} of {total}
        </p>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col justify-between gap-5 pt-5 sm:justify-center sm:gap-9">
        <h2
          key={questionText}
          className="pd-card-in font-display text-[clamp(1.65rem,6.2vw,3.1rem)] font-medium leading-[1.12] text-balance text-center [text-shadow:0_2px_24px_rgb(0_0_0/0.55)]"
          style={{ "--d": "150ms" } as React.CSSProperties}
        >
          {questionText}
        </h2>

        <div>
          <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-3" aria-label="Answers">
            {answers.map((a, i) => (
              <li key={a.id} className={`pd-card-in ${answers.length === 3 && i === 2 ? "sm:col-span-2" : ""}`} style={{ "--d": `${260 + i * 90}ms` } as React.CSSProperties}>
                <button type="button" className="pd-answer" data-state={stateFor(a.id)} disabled={locked} onClick={() => onSelect(a.id)}>
                  <span className="pd-key" aria-hidden="true">{keys[i]}</span>
                  <span>{a.text}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="min-h-[7.5rem] pt-4 text-center" aria-live="polite">{children}</div>
        </div>
      </div>
    </div>
  );
}
