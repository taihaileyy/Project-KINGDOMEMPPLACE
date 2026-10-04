"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireParadiseStaff } from "@/lib/auth";
import { SETTING_FIELDS } from "@/lib/paradise/settings";
import { createClient } from "@/lib/supabase/server";

const text = (max: number) => z.string().trim().max(max);
const optional = (max: number) => text(max).transform((v) => (v === "" ? null : v));

function back(path: string, key: "saved" | "error", message = "1"): never {
  revalidatePath("/admin/paradise", "layout");
  revalidatePath("/create-your-world");
  redirect(`${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(message)}`);
}

const first = (e: z.ZodError) => e.issues[0]?.message ?? "Please check the form.";

// Works out where a video lives from the address, so staff only paste or upload.
function videoTypeFor(url: string): "upload" | "youtube" | "external" {
  if (url.includes("/storage/v1/object/public/paradise-media/")) return "upload";
  if (/(^|\/\/)(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\b/i.test(url)) return "youtube";
  return "external";
}

// ── Questions ──────────────────────────────────────────────────────────────
const questionSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  level_id: z.string().uuid("Choose a level."),
  question_text: text(600).min(1, "Write the question."),
  answers: z.array(text(300)).length(4),
  correct: z.coerce.number().int().min(1).max(4),
  scripture_reference: optional(200),
  explanation: optional(1500),
  video_url: optional(1000).refine((v) => v === null || /^https?:\/\//i.test(v), "The video address must start with https://"),
  lesson_title: optional(200),
  lesson_description: optional(1500),
  question_order: z.coerce.number().int().min(0).max(100000).optional(),
  is_active: z.boolean(),
});

export async function saveQuestion(formData: FormData) {
  await requireParadiseStaff();
  const id = String(formData.get("id") ?? "");
  const here = id ? `/admin/paradise/questions/${id}` : "/admin/paradise/questions/new";
  const parsed = questionSchema.safeParse({
    id,
    level_id: formData.get("level_id"),
    question_text: formData.get("question_text") ?? "",
    answers: ["a1", "a2", "a3", "a4"].map((k) => String(formData.get(k) ?? "")),
    correct: formData.get("correct"),
    scripture_reference: formData.get("scripture_reference") ?? "",
    explanation: formData.get("explanation") ?? "",
    video_url: formData.get("video_url") ?? "",
    lesson_title: formData.get("lesson_title") ?? "",
    lesson_description: formData.get("lesson_description") ?? "",
    question_order: formData.get("question_order") || undefined,
    is_active: formData.get("is_active") === "on",
  });
  if (!parsed.success) back(here, "error", first(parsed.error));
  const v = parsed.data;

  const answers = v.answers.map((t, i) => ({ text: t, order: i + 1 })).filter((a) => a.text !== "");
  if (answers.length < 2) back(here, "error", "Write at least two answers (A and B).");
  if (!answers.some((a) => a.order === v.correct)) back(here, "error", "Mark one of your written answers as the correct one.");

  const supabase = await createClient();
  let questionId = v.id;
  if (questionId) {
    const { error } = await supabase.from("paradise_questions").update({
      level_id: v.level_id, question_text: v.question_text, scripture_reference: v.scripture_reference,
      explanation: v.explanation, is_active: v.is_active, ...(v.question_order !== undefined ? { question_order: v.question_order } : {}),
    }).eq("id", questionId);
    if (error) back(here, "error", error.message);
  } else {
    let order = v.question_order;
    if (order === undefined) {
      const { data } = await supabase.from("paradise_questions").select("question_order").eq("level_id", v.level_id).order("question_order", { ascending: false }).limit(1);
      order = (data?.[0]?.question_order ?? 0) + 1;
    }
    const { data, error } = await supabase.from("paradise_questions").insert({
      level_id: v.level_id, question_text: v.question_text, scripture_reference: v.scripture_reference,
      explanation: v.explanation, is_active: v.is_active, question_order: order,
    }).select("id").single();
    if (error || !data) back(here, "error", error?.message ?? "Couldn't save the question.");
    questionId = data!.id;
  }

  // Answers: clear the old "correct" flag first (only one answer may hold it), then write A to D.
  await supabase.from("paradise_answers").update({ is_correct: false }).eq("question_id", questionId!);
  const { error: aerr } = await supabase.from("paradise_answers").upsert(
    answers.map((a) => ({ question_id: questionId!, answer_text: a.text, answer_order: a.order, is_correct: a.order === v.correct })),
    { onConflict: "question_id,answer_order" },
  );
  if (aerr) back(here, "error", aerr.message);
  const keep = answers.map((a) => a.order);
  await supabase.from("paradise_answers").delete().eq("question_id", questionId!).not("answer_order", "in", `(${keep.join(",")})`);

  // The lesson shown when a player misses the question.
  const hasLesson = v.video_url || v.lesson_title || v.lesson_description;
  if (hasLesson) {
    const { error } = await supabase.from("paradise_lessons").upsert({
      question_id: questionId!, title: v.lesson_title, description: v.lesson_description,
      video_type: v.video_url ? videoTypeFor(v.video_url) : null, video_url: v.video_url,
    }, { onConflict: "question_id" });
    if (error) back(here, "error", error.message);
  } else {
    await supabase.from("paradise_lessons").delete().eq("question_id", questionId!);
  }
  back("/admin/paradise/questions", "saved");
}

export async function setQuestionActive(formData: FormData) {
  await requireParadiseStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("paradise_questions").update({ is_active: formData.get("active") === "true" }).eq("id", String(formData.get("id")));
  back(String(formData.get("return") || "/admin/paradise/questions"), error ? "error" : "saved", error?.message);
}

export async function deleteQuestion(formData: FormData) {
  await requireParadiseStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("paradise_questions").delete().eq("id", String(formData.get("id")));
  back("/admin/paradise/questions", error ? "error" : "saved", error?.message);
}

// Moves a question up or down within its level by renumbering the level's questions.
export async function moveQuestion(formData: FormData) {
  await requireParadiseStaff();
  const id = String(formData.get("id"));
  const dir = formData.get("dir") === "up" ? -1 : 1;
  const levelParam = String(formData.get("level") || "");
  const supabase = await createClient();
  const { data: q } = await supabase.from("paradise_questions").select("level_id").eq("id", id).single();
  if (!q) back("/admin/paradise/questions", "error", "Question not found.");
  const { data: list } = await supabase.from("paradise_questions").select("id").eq("level_id", q!.level_id).order("question_order").order("created_at");
  const ids = (list ?? []).map((r) => r.id);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i >= 0 && j >= 0 && j < ids.length) {
    [ids[i], ids[j]] = [ids[j], ids[i]];
    await Promise.all(ids.map((qid, n) => supabase.from("paradise_questions").update({ question_order: n + 1 }).eq("id", qid)));
  }
  back(`/admin/paradise/questions${levelParam ? `?level=${levelParam}` : ""}`, "saved");
}

// ── Levels ─────────────────────────────────────────────────────────────────
const levelSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  level_number: z.coerce.number().int().min(1, "Give the level a number from 1.").max(999),
  name: text(120).min(1, "Give the level a name."),
  description: optional(600),
  background_image_url: optional(1000),
  background_video_url: optional(1000),
  ambient_audio_url: optional(1000),
  is_active: z.boolean(),
});

export async function saveLevel(formData: FormData) {
  await requireParadiseStaff();
  const parsed = levelSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    level_number: formData.get("level_number"),
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    background_image_url: formData.get("background_image_url") ?? "",
    background_video_url: formData.get("background_video_url") ?? "",
    ambient_audio_url: formData.get("ambient_audio_url") ?? "",
    is_active: formData.get("is_active") === "on",
  });
  if (!parsed.success) back("/admin/paradise/levels", "error", first(parsed.error));
  const { id, ...row } = parsed.data;
  const supabase = await createClient();
  const { error } = id ? await supabase.from("paradise_levels").update(row).eq("id", id) : await supabase.from("paradise_levels").insert(row);
  if (error) back("/admin/paradise/levels", "error", error.code === "23505" ? "Another level already uses that number." : error.message);
  back("/admin/paradise/levels", "saved");
}

export async function deleteLevel(formData: FormData) {
  await requireParadiseStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("paradise_levels").delete().eq("id", String(formData.get("id")));
  back("/admin/paradise/levels", error ? "error" : "saved", error?.message);
}

// ── Game settings ──────────────────────────────────────────────────────────
export async function saveSettings(formData: FormData) {
  await requireParadiseStaff();
  const rows: { setting_key: string; setting_value: unknown }[] = [];
  for (const f of SETTING_FIELDS) {
    const raw = formData.get(f.key);
    if (f.type === "boolean") rows.push({ setting_key: f.key, setting_value: raw === "on" });
    else if (f.type === "number") {
      const n = Number(raw);
      if (!Number.isFinite(n)) back("/admin/paradise/settings", "error", `${f.label}: enter a number.`);
      rows.push({ setting_key: f.key, setting_value: Math.min(f.max, Math.max(f.min, n)) });
    } else if (f.type === "choice") {
      if (!f.options.some((o) => o.value === raw)) back("/admin/paradise/settings", "error", `${f.label}: choose an option.`);
      rows.push({ setting_key: f.key, setting_value: raw });
    } else {
      const t = String(raw ?? "").trim().slice(0, f.max);
      if (t) rows.push({ setting_key: f.key, setting_value: t });
    }
  }
  const supabase = await createClient();
  const { error } = await supabase.from("paradise_settings").upsert(rows, { onConflict: "setting_key" });
  back("/admin/paradise/settings", error ? "error" : "saved", error?.message);
}
