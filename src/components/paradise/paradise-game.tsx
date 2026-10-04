"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { checkAnswer, getProgress, saveProgress } from "@/app/create-your-world/actions";
import { LessonScreen } from "@/components/paradise/lesson-screen";
import { QuestionScreen, type AnswerState } from "@/components/paradise/question-screen";
import { ParadiseScene, type Motion } from "@/components/paradise/scene";
import { checkPlaceholder } from "@/lib/paradise/placeholder";
import { resolveSettings } from "@/lib/paradise/settings";
import { emptyProgress, type PdCheck, type PdContent, type PdProgress } from "@/lib/paradise/types";

type Phase =
  | "intro" | "entering" | "question" | "checking" | "correct" | "ascending"
  | "wrong" | "descending" | "lesson" | "returning" | "levelComplete" | "complete";
type Pos = { l: number; q: number };

// Timings in ms. With reduced motion there is no camera move, so they shrink.
const T = { enter: 1600, wrong: 1800, descend: 2800, ascend: 1800, ret: 1800, minThink: 450 };

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

const shuffled = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// The Paradise game engine. It plays whatever content it is given: levels,
// questions, answers, lessons and settings all come from the database, and the
// same screens are reused for every question.
export function ParadiseGame({ content }: { content: PdContent }) {
  const settings = useMemo(() => resolveSettings(content.settings), [content.settings]);
  const levels = content.levels;
  const placeholder = content.placeholder;
  const reduced = useReducedMotion();
  const k = reduced ? 0.25 : 1; // time scale

  const total = useMemo(() => levels.reduce((n, l) => n + l.questions.length, 0), [levels]);
  const storeKey = `kep-paradise-v1:${placeholder ? "sample" : "live"}`;

  const [phase, setPhase] = useState<Phase>("intro");
  const [pos, setPos] = useState<Pos>({ l: 0, q: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<PdCheck | null>(null);
  const [learning, setLearning] = useState(false);
  const [progress, setProgress] = useState<PdProgress>(emptyProgress);
  const [loaded, setLoaded] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const target = useRef<{ pos: Pos; phase: Phase } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const level = levels[pos.l];
  const question = level?.questions[pos.q];

  // ── Progress: the browser for guests, the database for signed-in players ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let local: PdProgress | null = null;
      try {
        const raw = localStorage.getItem(storeKey);
        if (raw) local = { ...emptyProgress(), ...JSON.parse(raw) };
      } catch { /* storage unavailable */ }
      let saved = local;
      if (!placeholder) {
        try {
          const r = await getProgress();
          if (cancelled) return;
          setSignedIn(r.signedIn);
          if (r.signedIn && r.progress) saved = r.progress;
        } catch { /* offline: use the browser's copy */ }
      }
      if (!cancelled) {
        if (saved) setProgress(saved);
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [storeKey, placeholder]);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (!loaded) return;
    try { localStorage.setItem(storeKey, JSON.stringify(progress)); } catch { /* ignore */ }
    if (!signedIn || placeholder) return;
    const t = window.setTimeout(() => { void saveProgress(progress, level?.id ?? null, total).catch(() => {}); }, 700);
    return () => window.clearTimeout(t);
  }, [progress, loaded, signedIn, placeholder, storeKey, level?.id, total]);

  const completedSet = useMemo(() => new Set(progress.completed), [progress.completed]);
  const overallPercent = total ? Math.min(100, Math.round((progress.completed.filter((id) => levels.some((l) => l.questions.some((q) => q.id === id))).length / total) * 100)) : 0;
  const canResume = loaded && (progress.completed.length > 0 || progress.attempted > 0) && overallPercent < 100;

  const firstOpen = (): Pos => {
    for (let l = 0; l < levels.length; l++) {
      for (let q = 0; q < levels[l].questions.length; q++) if (!completedSet.has(levels[l].questions[q].id)) return { l, q };
    }
    return { l: 0, q: 0 };
  };

  // ── Audio (starts from the Begin button, so browsers allow it) ──
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const src = level?.ambient_audio_url;
    if (phase === "intro" || !src) { a.pause(); return; }
    if (a.getAttribute("src") !== src) a.setAttribute("src", src);
    a.volume = 0.35;
    a.muted = muted;
    void a.play().catch(() => {});
  }, [level?.ambient_audio_url, phase, muted]);

  // ── The flow ──
  const begin = (resume: boolean) => {
    let start: Pos = { l: 0, q: 0 };
    let p = progress;
    if (resume) {
      const saved = progress.currentQuestionId;
      let found: Pos | null = null;
      if (saved) levels.forEach((l, li) => l.questions.forEach((q, qi) => { if (q.id === saved) found = { l: li, q: qi }; }));
      start = found ?? firstOpen();
    } else {
      p = emptyProgress();
      setProgress(p);
    }
    setPos(start);
    setSelected(null); setResult(null); setLearning(false); setError(null);
    setAttempt((n) => n + 1);
    setPhase("entering");
  };

  const answers = useMemo(() => {
    if (!question) return [];
    return settings.shuffle_answers ? shuffled(question.answers) : question.answers;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reshuffle per attempt, not per render
  }, [question?.id, attempt, settings.shuffle_answers]);

  const select = async (answerId: string) => {
    if (phase !== "question" || !question) return;
    setSelected(answerId);
    setError(null);
    setPhase("checking");
    const started = Date.now();
    let res: PdCheck | null = null;
    try {
      res = placeholder ? checkPlaceholder(question.id, answerId) : await checkAnswer(question.id, answerId);
    } catch { res = null; }
    const wait = Math.max(0, T.minThink * k - (Date.now() - started));
    await new Promise((r) => setTimeout(r, wait));
    if (!res) {
      setSelected(null);
      setError("We couldn't check that answer. Please try again.");
      setPhase("question");
      return;
    }
    setResult(res);
    setProgress((p) => ({
      ...p,
      attempted: p.attempted + 1,
      correct: p.correct + (res.correct ? 1 : 0),
      incorrect: p.incorrect + (res.correct ? 0 : 1),
      completed: res.correct && !p.completed.includes(question.id) ? [...p.completed, question.id] : p.completed,
      currentQuestionId: question.id,
    }));
    setPhase(res.correct ? "correct" : "wrong");
  };

  const goNext = useCallback(() => {
    // Ascend, then the next question, or the end of the level.
    const last = pos.q >= (level?.questions.length ?? 1) - 1;
    target.current = last ? { pos, phase: "levelComplete" } : { pos: { l: pos.l, q: pos.q + 1 }, phase: "question" };
    setPhase("ascending");
  }, [pos, level]);

  // After a wrong answer and the lesson, the player ALWAYS retries the same
  // question. There is no way forward except answering it correctly.
  const leaveLesson = () => {
    target.current = { pos, phase: "question" };
    setAttempt((n) => n + 1);
    setPhase("returning");
  };

  const continueFromLevel = () => {
    if (pos.l < levels.length - 1) {
      target.current = { pos: { l: pos.l + 1, q: 0 }, phase: "question" };
      setPhase("returning");
    } else {
      setPhase("complete");
    }
  };

  // Each phase hands over to the next on a timer.
  useEffect(() => {
    let t: number | undefined;
    const after = (ms: number, fn: () => void) => { t = window.setTimeout(fn, ms * k); };
    const arrive = () => {
      const tg = target.current;
      if (!tg) return;
      target.current = null;
      setPos(tg.pos);
      setSelected(null); setResult(null); setError(null);
      if (tg.phase === "levelComplete") {
        setProgress((p) => ({ ...p, completedLevels: p.completedLevels.includes(level.id) ? p.completedLevels : [...p.completedLevels, level.id], currentQuestionId: null }));
      } else {
        setProgress((p) => ({ ...p, currentQuestionId: levels[tg.pos.l].questions[tg.pos.q].id }));
      }
      setPhase(tg.phase);
    };
    switch (phase) {
      case "entering": after(T.enter, () => setPhase("question")); break;
      case "wrong": after(T.wrong, () => setPhase("descending")); break;
      case "descending":
        after(1500, () => setLearning(true));
        t = window.setTimeout(() => setPhase("lesson"), T.descend * k);
        break;
      case "correct": if (settings.auto_advance) after(settings.auto_advance_seconds * 1000, goNext); break;
      case "ascending": after(T.ascend, arrive); break;
      case "returning":
        after(800, () => setLearning(false));
        t = window.setTimeout(arrive, T.ret * k);
        break;
    }
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- timers follow the phase only
  }, [phase]);

  // ── What the screens need ──
  const motion: Motion = phase === "ascending" || phase === "returning" ? "ascend" : phase === "descending" ? "descend" : phase === "entering" ? "enter" : "idle";
  const tone = phase === "correct" ? "correct" : phase === "wrong" ? "wrong" : "neutral";
  const stateFor = (id: string): AnswerState => {
    if (!selected) return "idle";
    if (phase === "checking") return id === selected ? "picked" : "dim";
    if (phase === "correct" || phase === "ascending") return id === result?.correct_answer_id ? "correct" : "dim";
    if (id === selected) return "wrong";
    return "dim";
  };
  const questionPhases: Phase[] = ["question", "checking", "correct", "wrong", "ascending", "descending"];
  const doneInLevel = level ? level.questions.map((q) => completedSet.has(q.id)) : [];
  const lastLevel = pos.l >= levels.length - 1;

  return (
    <ParadiseScene level={level ?? null} motion={motion} mode={learning || phase === "lesson" ? "learning" : "garden"} tone={tone} fire={phase === "wrong" || (phase === "descending" && !learning)} reducedMotion={reduced}>
      <audio ref={audioRef} loop preload="none" />

      {phase !== "intro" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-[max(1rem,env(safe-area-inset-left))] pt-[max(0.75rem,env(safe-area-inset-top))]">
          <Link href="/" className="pd-link pd-focus pointer-events-auto inline-flex min-h-11 items-center gap-2" aria-label="Return to KEP">
            <span aria-hidden="true">←</span> <span className="hidden sm:inline">Return to KEP</span>
          </Link>
          <div className="pointer-events-auto flex items-center gap-3">
            {placeholder && <span className="rounded-full border border-white/30 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-white/80 uppercase">Sample content</span>}
            {level?.ambient_audio_url && (
              <button type="button" onClick={() => setMuted((m) => !m)} className="pd-link pd-focus inline-flex min-h-11 items-center" aria-pressed={muted}>
                {muted ? "Sound off" : "Sound on"}
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "intro" && (
        <div className="pd-ui items-center justify-center text-center">
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center">
            <p className="pd-eyebrow pd-card-in" style={{ "--d": "50ms" } as React.CSSProperties}>Begin in Paradise</p>
            <h1 className="pd-title-in mt-4 font-display text-[clamp(2.3rem,10.5vw,5.6rem)] font-medium uppercase leading-[1.02] text-balance [--ls:0.12em] [text-shadow:0_4px_40px_rgb(0_0_0/0.6)]" style={{ "--d": "150ms" } as React.CSSProperties}>
              Create Your World
            </h1>
            <p className="pd-card-in mt-6 font-display text-[clamp(1.4rem,5vw,2.2rem)] italic leading-snug text-[var(--pd-gold)]" style={{ "--d": "600ms" } as React.CSSProperties}>
              {settings.intro_headline}
            </p>
            <p className="pd-card-in mt-4 max-w-md text-[15px] leading-relaxed text-white/80 sm:text-base" style={{ "--d": "800ms" } as React.CSSProperties}>
              {settings.intro_body}
            </p>
            {placeholder && (
              <p className="pd-card-in mt-4 text-xs tracking-wide text-white/60" style={{ "--d": "900ms" } as React.CSSProperties}>
                Sample content is showing. KEP&rsquo;s real questions are added by the team.
              </p>
            )}
            <div className="pd-card-in mt-9 flex w-full max-w-xs flex-col items-stretch gap-3" style={{ "--d": "1000ms" } as React.CSSProperties}>
              {canResume ? (
                <>
                  <button type="button" className="pd-btn pd-btn-gold" onClick={() => begin(true)}>Continue journey</button>
                  <button type="button" className="pd-btn pd-btn-ghost" onClick={() => begin(false)}>Start over</button>
                </>
              ) : (
                <button type="button" className="pd-btn pd-btn-gold" onClick={() => begin(true)} disabled={!loaded}>Begin journey</button>
              )}
            </div>
          </div>
          <Link href="/" className="pd-link pd-focus pd-card-in mb-2 inline-flex min-h-11 items-center" style={{ "--d": "1200ms" } as React.CSSProperties}>
            ← Return to KEP
          </Link>
        </div>
      )}

      {question && level && questionPhases.includes(phase) && (
        <QuestionScreen
          key={`${question.id}-${attempt}`}
          levelNumber={level.level_number}
          levelName={level.name}
          index={pos.q}
          total={level.questions.length}
          doneInLevel={doneInLevel}
          overallPercent={overallPercent}
          questionText={question.question_text}
          answers={answers}
          stateFor={stateFor}
          locked={phase !== "question"}
          onSelect={select}
          leaving={phase === "ascending" ? "up" : phase === "descending" ? "down" : null}
        >
          {error && <p role="alert" className="text-sm text-[#f0b7a6]">{error}</p>}
          {(phase === "correct" || phase === "ascending") && result && (
            <div className="pd-card-in">
              <p className="pd-correct-word font-display text-2xl text-[var(--pd-gold)] uppercase">Correct</p>
              {settings.show_scripture && result.scripture_reference && <p className="mt-1 text-sm tracking-[0.06em] text-white/85">{result.scripture_reference}</p>}
              {settings.show_explanation && result.explanation && <p className="mx-auto mt-1 max-w-xl text-sm leading-relaxed text-white/70">{result.explanation}</p>}
              {!settings.auto_advance && phase === "correct" && (
                <button type="button" className="pd-btn pd-btn-gold mt-4" onClick={goNext}>Continue journey <span aria-hidden="true">→</span></button>
              )}
            </div>
          )}
          {phase === "wrong" && <p className="font-display text-xl text-white/85">Not quite&hellip;</p>}
        </QuestionScreen>
      )}

      {phase === "descending" && (
        <div className="pd-ui pointer-events-none items-center justify-center text-center" aria-live="assertive">
          <p className="pd-descend-word font-display text-[clamp(1.6rem,6vw,2.6rem)] tracking-[0.35em] uppercase">Descending&hellip;</p>
        </div>
      )}

      {(phase === "lesson" || (phase === "returning" && target.current && learning)) && result && (
        <LessonScreen
          key={`lesson-${question?.id}-${attempt}`}
          lesson={result.lesson ?? null}
          scripture={result.scripture_reference}
          explanation={result.explanation}
          requireWatch={settings.require_video_watch}
          fallbackSeconds={settings.fallback_wait_seconds}
          actionLabel="Try again"
          onAction={leaveLesson}
          leaving={phase === "returning"}
        />
      )}

      {phase === "levelComplete" && level && (
        <div className="pd-ui items-center justify-center text-center">
          <div className="mx-auto max-w-xl">
            <p className="pd-eyebrow pd-card-in">Level {String(level.level_number).padStart(2, "0")}</p>
            <h2 className="pd-title-in mt-4 font-display text-[clamp(2.2rem,9vw,4.4rem)] font-medium uppercase leading-none [--ls:0.14em]" style={{ "--d": "200ms" } as React.CSSProperties}>Level complete</h2>
            <p className="pd-card-in mt-5 font-display text-2xl italic text-[var(--pd-gold)]" style={{ "--d": "700ms" } as React.CSSProperties}>{level.name}</p>
            <p className="pd-card-in mt-3 text-sm text-white/70" style={{ "--d": "900ms" } as React.CSSProperties}>{overallPercent}% of the journey complete</p>
            <div className="pd-card-in mt-8" style={{ "--d": "1100ms" } as React.CSSProperties}>
              <button type="button" className="pd-btn pd-btn-gold" onClick={continueFromLevel}>
                {lastLevel ? "Finish journey" : "Continue journey"} <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "complete" && (
        <div className="pd-ui items-center justify-center text-center">
          <div className="mx-auto max-w-xl">
            <h2 className="pd-title-in font-display text-[clamp(2.2rem,9vw,4.4rem)] font-medium uppercase leading-none [--ls:0.14em]">Journey complete</h2>
            <p className="pd-card-in mt-5 text-base text-white/80" style={{ "--d": "700ms" } as React.CSSProperties}>
              You answered {progress.completed.length} of {total} questions correctly. Keep learning the Word.
            </p>
            <div className="pd-card-in mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row" style={{ "--d": "1000ms" } as React.CSSProperties}>
              <button type="button" className="pd-btn pd-btn-gold" onClick={() => begin(false)}>Play again</button>
              <Link href="/" className="pd-btn pd-btn-ghost">Return to KEP</Link>
            </div>
          </div>
        </div>
      )}
    </ParadiseScene>
  );
}
