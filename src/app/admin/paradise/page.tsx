import type { Metadata } from "next";
import Link from "next/link";
import { DashboardBand } from "@/components/app-shell";
import { ParadiseAdminTabs } from "@/components/paradise/admin-ui";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Paradise" };

type Q = { id: string; is_active: boolean; paradise_answers: { is_correct: boolean }[]; paradise_lessons: { video_url: string | null }[] | { video_url: string | null } | null };

export default async function ParadiseDashboard() {
  const supabase = await createClient();
  const [{ data: levels }, { data: questions }, { data: progress }] = await Promise.all([
    supabase.from("paradise_levels").select("id, is_active"),
    supabase.from("paradise_questions").select("id, is_active, paradise_answers(is_correct), paradise_lessons(video_url)"),
    supabase.from("paradise_player_progress").select("progress_percentage, correct_count, incorrect_count"),
  ]);
  const qs = (questions ?? []) as unknown as Q[];
  const lessonUrl = (q: Q) => (Array.isArray(q.paradise_lessons) ? q.paradise_lessons[0]?.video_url : q.paradise_lessons?.video_url);
  const active = qs.filter((q) => q.is_active);
  const playable = active.filter((q) => q.paradise_answers.length >= 2 && q.paradise_answers.some((a) => a.is_correct));
  const withVideo = qs.filter((q) => lessonUrl(q));
  const players = progress ?? [];
  const avg = players.length ? Math.round(players.reduce((n, p) => n + p.progress_percentage, 0) / players.length) : 0;
  const answered = players.reduce((n, p) => n + p.correct_count + p.incorrect_count, 0);
  const correct = players.reduce((n, p) => n + p.correct_count, 0);

  const stats: [string, string | number, string?][] = [
    ["Levels", levels?.length ?? 0, `${levels?.filter((l) => l.is_active).length ?? 0} active`],
    ["Questions", qs.length, `${active.length} active, ${playable.length} playable`],
    ["With a teaching video", withVideo.length, `${qs.length - withVideo.length} without`],
    ["Signed-in players", players.length, players.length ? `${avg}% average progress` : "Guests aren't counted"],
    ["Answers given", answered, answered ? `${Math.round((correct / answered) * 100)}% correct` : undefined],
  ];

  const todo: { text: string; href: string }[] = [];
  if (!levels?.length) todo.push({ text: "Add your first level.", href: "/admin/paradise/levels" });
  if (levels?.length && !qs.length) todo.push({ text: "Add your first question.", href: "/admin/paradise/questions/new" });
  if (active.length && playable.length < active.length) todo.push({ text: `${active.length - playable.length} active question(s) aren't playable yet (they need two answers and a correct one).`, href: "/admin/paradise/questions" });
  if (qs.length && withVideo.length < qs.length) todo.push({ text: `${qs.length - withVideo.length} question(s) have no teaching video.`, href: "/admin/paradise/videos" });

  return (
    <div className="grid gap-6">
      <DashboardBand title="Paradise" lead="Add and edit the questions, levels and teaching videos that the game plays. Changes appear in the game right away; no developer needed.">
        <Link href="/admin/paradise/questions/new" className="btn-primary">+ Add question</Link>
        <Link href="/paradise" target="_blank" className="btn border border-white/25 text-white hover:bg-white/10">Preview the game ↗</Link>
      </DashboardBand>
      <ParadiseAdminTabs current="/admin/paradise" />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(([label, value, sub]) => (
          <li key={label} className="card p-4">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 text-3xl font-extrabold">{value}</p>
            {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
          </li>
        ))}
      </ul>

      <section className="card p-5">
        <h2 className="text-lg font-extrabold">{todo.length ? "What's next" : "Everything looks ready"}</h2>
        {todo.length ? (
          <ul className="mt-3 grid gap-2">
            {todo.map((t) => (
              <li key={t.text}><Link href={t.href} className="text-blue hover:underline">{t.text}</Link></li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-muted">Every active question can be played and has a teaching video.</p>
        )}
        {playable.length === 0 && <p className="mt-4 text-sm text-muted">Until a playable question exists, the game shows clearly labeled sample questions.</p>}
      </section>
    </div>
  );
}
