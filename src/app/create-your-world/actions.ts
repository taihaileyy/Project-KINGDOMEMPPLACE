"use server";

import { createClient } from "@/lib/supabase/server";
import type { PdCheck, PdContent, PdProgress } from "@/lib/paradise/types";
import { emptyProgress } from "@/lib/paradise/types";

// Judges an answer in the database. The player's browser never has the answer
// key; it only learns the result of the one answer it chose.
export async function checkAnswer(questionId: string, answerId: string): Promise<PdCheck | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("paradise_check_answer", { p_question_id: questionId, p_answer_id: answerId });
  if (error || !data) return null;
  return data as PdCheck;
}

// A signed-in player's saved place, or null for guests (who use their browser).
export async function getProgress(): Promise<{ signedIn: boolean; progress: PdProgress | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { signedIn: false, progress: null };
  const { data } = await supabase
    .from("paradise_player_progress")
    .select("current_question_id, attempted_count, correct_count, incorrect_count, completed_question_ids, completed_level_ids")
    .maybeSingle();
  if (!data) return { signedIn: true, progress: null };
  return {
    signedIn: true,
    progress: {
      ...emptyProgress(),
      completed: data.completed_question_ids ?? [],
      completedLevels: data.completed_level_ids ?? [],
      attempted: data.attempted_count,
      correct: data.correct_count,
      incorrect: data.incorrect_count,
      currentQuestionId: data.current_question_id,
    },
  };
}

// Saves a signed-in player's place. Ids are checked against the live content
// so stale or made-up ids are dropped; only counts and ids are stored.
export async function saveProgress(p: PdProgress, currentLevelId: string | null, totalQuestions: number): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: me } = await supabase.from("people").select("id").eq("auth_user_id", user.id).is("merged_into_id", null).maybeSingle();
  if (!me) return;
  const { data: content } = await supabase.rpc("paradise_content");
  const c = content as PdContent | null;
  const validQ = new Set((c?.levels ?? []).flatMap((l) => l.questions.map((q) => q.id)));
  const validL = new Set((c?.levels ?? []).map((l) => l.id));
  const completed = p.completed.filter((id) => validQ.has(id));
  const pct = totalQuestions > 0 ? Math.min(100, Math.round((completed.length / totalQuestions) * 100)) : 0;
  const clamp = (n: number) => Math.max(0, Math.min(100000, Math.floor(n) || 0));
  await supabase.from("paradise_player_progress").upsert(
    {
      person_id: me.id,
      current_level_id: currentLevelId && validL.has(currentLevelId) ? currentLevelId : null,
      current_question_id: p.currentQuestionId && validQ.has(p.currentQuestionId) ? p.currentQuestionId : null,
      attempted_count: clamp(p.attempted),
      correct_count: clamp(p.correct),
      incorrect_count: clamp(p.incorrect),
      completed_question_ids: completed,
      completed_level_ids: p.completedLevels.filter((id) => validL.has(id)),
      progress_percentage: pct,
      last_played_at: new Date().toISOString(),
    },
    { onConflict: "person_id" },
  );
}
