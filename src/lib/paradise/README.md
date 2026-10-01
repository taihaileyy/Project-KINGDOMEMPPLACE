# Create Your World (Paradise engine): how it fits together

CONTENT (Admin > Create Your World) -> SUPABASE -> GAME ENGINE -> ONE QUESTION TEMPLATE.

- **Content:** `/admin/paradise` (Dashboard, Questions, Levels, Videos, Game Settings). Staff only.
- **Database:** `supabase/migrations/20261001000000_paradise.sql` (tables `paradise_*`, RLS, storage bucket `paradise-media`).
- **Loading:** `content.ts` calls the `paradise_content()` function (no answer key inside). If there is no playable question yet it falls back to the labeled sample in `placeholder.ts`.
- **Judging:** `app/create-your-world/actions.ts` -> `paradise_check_answer()` returns the result, Scripture, explanation and (if wrong) the lesson.
- **Engine:** `components/paradise/paradise-game.tsx` (phases: intro, entering, question, checking, correct, ascending, wrong, descending, lesson, returning, levelComplete, complete). Screens: `question-screen.tsx` (one template for every question), `lesson-screen.tsx` + `video-player.tsx`.
- **Look and motion:** `components/paradise/garden.tsx` + `garden.css`, `scene.tsx`, `app/create-your-world/paradise.css` (all scoped to Paradise; honors prefers-reduced-motion).
- **Settings:** `settings.ts` lists every game setting with its default; the admin form is built from that list.
- **Progress:** guests in localStorage; signed-in players in `paradise_player_progress` (via `saveProgress`).
