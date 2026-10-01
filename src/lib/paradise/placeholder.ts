import type { PdCheck, PdContent } from "@/lib/paradise/types";

// ── SAMPLE CONTENT, NOT PRODUCTION ─────────────────────────────────────────
// Shown only while the database has no playable questions, so the game can be
// tried and tested. It is clearly labeled in the game. Real questions, answers,
// Scripture references and videos are added in Admin > Create Your World.
export const PLACEHOLDER_CONTENT: PdContent = {
  placeholder: true,
  settings: {},
  levels: [
    {
      id: "placeholder-level-1",
      level_number: 1,
      name: "Paradise",
      description: "Sample level",
      background_image_url: null,
      background_video_url: null,
      ambient_audio_url: null,
      theme: {},
      questions: [
        { id: "placeholder-q1", question_text: "[Placeholder Bible Question 1]", answers: [{ id: "p1a", text: "Answer A" }, { id: "p1b", text: "Answer B" }, { id: "p1c", text: "Answer C" }, { id: "p1d", text: "Answer D" }] },
        { id: "placeholder-q2", question_text: "[Placeholder Bible Question 2] (two choices)", answers: [{ id: "p2a", text: "Answer A" }, { id: "p2b", text: "Answer B" }] },
        { id: "placeholder-q3", question_text: "[Placeholder Bible Question 3]", answers: [{ id: "p3a", text: "Answer A" }, { id: "p3b", text: "Answer B" }, { id: "p3c", text: "Answer C" }] },
      ],
    },
  ],
};

// Which sample answer is "right", so the sample can be played without a database.
const KEY: Record<string, string> = { "placeholder-q1": "p1b", "placeholder-q2": "p2a", "placeholder-q3": "p3c" };

export function checkPlaceholder(questionId: string, answerId: string): PdCheck {
  const right = KEY[questionId];
  const correct = right === answerId;
  return {
    correct,
    correct_answer_id: right,
    scripture_reference: "[Scripture reference]",
    explanation: "[Optional explanation]",
    lesson: correct ? null : { title: "[Lesson title]", description: "[Short lesson description. Real lessons and videos are added in Admin > Create Your World.]", video_type: null, video_url: null, after_video: null },
  };
}
