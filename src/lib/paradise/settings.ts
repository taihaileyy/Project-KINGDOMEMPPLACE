// Game behavior that administrators control (Admin > Paradise > Game Settings).
// Every setting has a safe default, so the game works before any are saved.

export type PdSettings = {
  auto_advance: boolean; // after a correct answer, continue on its own
  auto_advance_seconds: number; // how long the CORRECT screen stays before ascending
  after_lesson: "retry" | "continue"; // what follows a teaching video
  require_video_watch: boolean; // the player must finish the video first
  fallback_wait_seconds: number; // when a video can't report its end, wait this long
  shuffle_answers: boolean;
  show_scripture: boolean;
  show_explanation: boolean;
  intro_headline: string;
  intro_body: string;
};

export const SETTING_DEFAULTS: PdSettings = {
  auto_advance: true,
  auto_advance_seconds: 3.5,
  after_lesson: "retry",
  require_video_watch: true,
  fallback_wait_seconds: 45,
  shuffle_answers: false,
  show_scripture: true,
  show_explanation: true,
  intro_headline: "How well do you know the Word?",
  intro_body: "Journey through Scripture. Answer correctly to continue your journey.",
};

type Field =
  | { key: keyof PdSettings; label: string; help: string; type: "boolean" }
  | { key: keyof PdSettings; label: string; help: string; type: "number"; min: number; max: number; step: number }
  | { key: keyof PdSettings; label: string; help: string; type: "choice"; options: { value: string; label: string }[] }
  | { key: keyof PdSettings; label: string; help: string; type: "text"; max: number };

// The admin form is built from this list, so a new setting is one line here.
export const SETTING_FIELDS: Field[] = [
  { key: "auto_advance", label: "Continue automatically after a correct answer", help: "Off: the player taps Continue Journey.", type: "boolean" },
  { key: "auto_advance_seconds", label: "Seconds to show CORRECT before continuing", help: "Only used when automatic continue is on.", type: "number", min: 1, max: 15, step: 0.5 },
  { key: "after_lesson", label: "After a teaching video", help: "Try Again repeats the same question; Continue Journey moves to the next one. A question's own lesson can override this.", type: "choice", options: [{ value: "retry", label: "Try Again (repeat the question)" }, { value: "continue", label: "Continue Journey (next question)" }] },
  { key: "require_video_watch", label: "Players must finish the teaching video", help: "Off: the button is available right away.", type: "boolean" },
  { key: "fallback_wait_seconds", label: "Wait (seconds) when a video can't report that it finished", help: "Some outside videos can't tell us when they end; the button unlocks after this long.", type: "number", min: 5, max: 600, step: 5 },
  { key: "shuffle_answers", label: "Shuffle answer order", help: "Off: answers show in the order you wrote them.", type: "boolean" },
  { key: "show_scripture", label: "Show the Scripture reference after a correct answer", help: "", type: "boolean" },
  { key: "show_explanation", label: "Show the explanation after a correct answer", help: "Only when the question has one.", type: "boolean" },
  { key: "intro_headline", label: "Opening headline", help: "Shown under PARADISE on the opening screen.", type: "text", max: 120 },
  { key: "intro_body", label: "Opening text", help: "A line or two under the headline.", type: "text", max: 240 },
];

// Reads saved values, ignoring anything missing or the wrong type.
export function resolveSettings(raw: Record<string, unknown> | null | undefined): PdSettings {
  const out: PdSettings = { ...SETTING_DEFAULTS };
  if (!raw) return out;
  for (const f of SETTING_FIELDS) {
    const v = raw[f.key];
    if (f.type === "boolean" && typeof v === "boolean") (out[f.key] as boolean) = v;
    else if (f.type === "number" && typeof v === "number" && Number.isFinite(v)) (out[f.key] as number) = Math.min(f.max, Math.max(f.min, v));
    else if (f.type === "choice" && typeof v === "string" && f.options.some((o) => o.value === v)) (out[f.key] as string) = v;
    else if (f.type === "text" && typeof v === "string" && v.trim()) (out[f.key] as string) = v.slice(0, f.max);
  }
  return out;
}
