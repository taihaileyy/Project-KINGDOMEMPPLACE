// Shapes shared by the Paradise game, its server actions and the admin screens.

export type PdAnswer = { id: string; text: string };
export type PdQuestion = { id: string; question_text: string; answers: PdAnswer[] };

export type PdLevel = {
  id: string;
  level_number: number;
  name: string;
  description: string | null;
  background_image_url: string | null;
  background_video_url: string | null;
  ambient_audio_url: string | null;
  theme: Record<string, unknown>;
  questions: PdQuestion[];
};

export type PdVideoType = "upload" | "youtube" | "external";

export type PdLesson = {
  title: string | null;
  description: string | null;
  video_type: PdVideoType | null;
  video_url: string | null;
};

// What the database says about one answer. Only returned after a player answers.
export type PdCheck = {
  correct: boolean;
  correct_answer_id?: string; // only sent for a correct answer
  scripture_reference: string | null;
  explanation: string | null;
  lesson?: PdLesson | null;
};

export type PdContent = {
  levels: PdLevel[];
  settings: Record<string, unknown>;
  // True when no real content exists yet and the built-in sample is showing.
  placeholder: boolean;
};

// A player's place in the journey. Guests keep this in the browser; signed-in
// players keep it in paradise_player_progress.
export type PdProgress = {
  completed: string[]; // question ids answered correctly
  completedLevels: string[];
  attempted: number;
  correct: number;
  incorrect: number;
  currentQuestionId: string | null;
};

export const emptyProgress = (): PdProgress => ({
  completed: [],
  completedLevels: [],
  attempted: 0,
  correct: 0,
  incorrect: 0,
  currentQuestionId: null,
});
