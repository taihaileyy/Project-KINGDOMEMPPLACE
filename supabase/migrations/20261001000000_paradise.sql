-- Paradise: a data-driven Bible journey. Staff write the content (levels,
-- questions, answers, teaching lessons, settings); the game reads it through
-- two functions and never sees which answer is correct until a player answers.
-- Nothing here touches existing tables.

-- Paradise staff: super admins, or program staff given the 'paradise' scope.
create function public.is_paradise_staff()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_role_assignments a
    where a.person_id = public.auth_person_id()
      and a.revoked_at is null
      and (a.role = 'super_admin' or (a.role = 'program_staff' and a.scope = 'paradise'))
  )
$$;
revoke execute on function public.is_paradise_staff() from public, anon;
grant execute on function public.is_paradise_staff() to authenticated;

-- ── Levels ────────────────────────────────────────────────────────────────
create table public.paradise_levels (
  id                   uuid primary key default gen_random_uuid(),
  level_number         int not null check (level_number between 1 and 999) unique,
  name                 text not null check (char_length(name) between 1 and 120),
  description          text check (char_length(description) <= 600),
  background_image_url text check (char_length(background_image_url) <= 1000),
  background_video_url text check (char_length(background_video_url) <= 1000),
  ambient_audio_url    text check (char_length(ambient_audio_url) <= 1000),
  theme                jsonb not null default '{}'::jsonb,
  is_active            boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ── Questions, answers, lessons ───────────────────────────────────────────
create table public.paradise_questions (
  id                 uuid primary key default gen_random_uuid(),
  level_id           uuid not null references public.paradise_levels (id) on delete cascade,
  question_text      text not null check (char_length(question_text) between 1 and 600),
  scripture_reference text check (char_length(scripture_reference) <= 200),
  explanation        text check (char_length(explanation) <= 1500),
  question_order     int not null default 0,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index paradise_questions_level_idx on public.paradise_questions (level_id, question_order);

create table public.paradise_answers (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references public.paradise_questions (id) on delete cascade,
  answer_text  text not null check (char_length(answer_text) between 1 and 300),
  answer_order int not null check (answer_order between 1 and 4),
  is_correct   boolean not null default false,
  unique (question_id, answer_order)
);
-- A question has at most one correct answer.
create unique index paradise_answers_one_correct_idx on public.paradise_answers (question_id) where is_correct;

create type public.paradise_video_type as enum ('upload', 'youtube', 'external');

-- The lesson shown when a player misses a question (one per question).
create table public.paradise_lessons (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null unique references public.paradise_questions (id) on delete cascade,
  title       text check (char_length(title) <= 200),
  description text check (char_length(description) <= 1500),
  video_type  public.paradise_video_type,
  video_url   text check (char_length(video_url) <= 1000),
  -- What follows the lesson: null uses the game setting.
  after_video text check (after_video in ('retry', 'continue')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Game-wide behavior, one row per setting.
create table public.paradise_settings (
  id            uuid primary key default gen_random_uuid(),
  setting_key   text not null unique check (setting_key ~ '^[a-z_]{1,60}$'),
  setting_value jsonb not null,
  updated_at    timestamptz not null default now()
);

-- A signed-in player's place in the journey (guests keep theirs in the browser).
create table public.paradise_player_progress (
  id                  uuid primary key default gen_random_uuid(),
  person_id           uuid not null unique references public.people (id) on delete cascade,
  current_level_id    uuid references public.paradise_levels (id) on delete set null,
  current_question_id uuid references public.paradise_questions (id) on delete set null,
  attempted_count     int not null default 0 check (attempted_count >= 0),
  correct_count       int not null default 0 check (correct_count >= 0),
  incorrect_count     int not null default 0 check (incorrect_count >= 0),
  completed_question_ids uuid[] not null default '{}',
  completed_level_ids    uuid[] not null default '{}',
  progress_percentage int not null default 0 check (progress_percentage between 0 and 100),
  last_played_at      timestamptz not null default now(),
  created_at          timestamptz not null default now()
);
create index paradise_progress_level_idx on public.paradise_player_progress (current_level_id) where current_level_id is not null;
create index paradise_progress_question_idx on public.paradise_player_progress (current_question_id) where current_question_id is not null;

create trigger paradise_levels_touch before update on public.paradise_levels for each row execute function public.touch_updated_at();
create trigger paradise_questions_touch before update on public.paradise_questions for each row execute function public.touch_updated_at();
create trigger paradise_lessons_touch before update on public.paradise_lessons for each row execute function public.touch_updated_at();
create trigger paradise_settings_touch before update on public.paradise_settings for each row execute function public.touch_updated_at();

create trigger paradise_levels_audit after insert or update or delete on public.paradise_levels for each row execute function public.audit_row();
create trigger paradise_questions_audit after insert or update or delete on public.paradise_questions for each row execute function public.audit_row();
create trigger paradise_answers_audit after insert or update or delete on public.paradise_answers for each row execute function public.audit_row();
create trigger paradise_lessons_audit after insert or update or delete on public.paradise_lessons for each row execute function public.audit_row();
create trigger paradise_settings_audit after insert or update or delete on public.paradise_settings for each row execute function public.audit_row();

-- ── Access: staff manage content; players only touch their own progress ──
alter table public.paradise_levels enable row level security;
alter table public.paradise_questions enable row level security;
alter table public.paradise_answers enable row level security;
alter table public.paradise_lessons enable row level security;
alter table public.paradise_settings enable row level security;
alter table public.paradise_player_progress enable row level security;

create policy paradise_levels_staff on public.paradise_levels for all to authenticated
  using ((select public.is_paradise_staff())) with check ((select public.is_paradise_staff()));
create policy paradise_questions_staff on public.paradise_questions for all to authenticated
  using ((select public.is_paradise_staff())) with check ((select public.is_paradise_staff()));
create policy paradise_answers_staff on public.paradise_answers for all to authenticated
  using ((select public.is_paradise_staff())) with check ((select public.is_paradise_staff()));
create policy paradise_lessons_staff on public.paradise_lessons for all to authenticated
  using ((select public.is_paradise_staff())) with check ((select public.is_paradise_staff()));
create policy paradise_settings_staff on public.paradise_settings for all to authenticated
  using ((select public.is_paradise_staff())) with check ((select public.is_paradise_staff()));

create policy paradise_progress_own on public.paradise_player_progress for all to authenticated
  using (person_id = (select public.auth_person_id()))
  with check (person_id = (select public.auth_person_id()));
create policy paradise_progress_staff_read on public.paradise_player_progress for select to authenticated
  using ((select public.is_paradise_staff()));

revoke all on public.paradise_levels, public.paradise_questions, public.paradise_answers,
  public.paradise_lessons, public.paradise_settings, public.paradise_player_progress from anon;

-- ── What the game reads ───────────────────────────────────────────────────
-- Active levels with their playable questions (two or more answers and one
-- marked correct), the answers WITHOUT the correct flag, and the settings.
create function public.paradise_content()
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'levels', coalesce((
      select jsonb_agg(l_obj order by (l_obj ->> 'level_number')::int)
      from (
        select jsonb_build_object(
          'id', l.id,
          'level_number', l.level_number,
          'name', l.name,
          'description', l.description,
          'background_image_url', l.background_image_url,
          'background_video_url', l.background_video_url,
          'ambient_audio_url', l.ambient_audio_url,
          'theme', l.theme,
          'questions', coalesce((
            select jsonb_agg(jsonb_build_object(
              'id', q.id,
              'question_text', q.question_text,
              'answers', (
                select jsonb_agg(jsonb_build_object('id', a.id, 'text', a.answer_text) order by a.answer_order)
                from public.paradise_answers a where a.question_id = q.id
              )
            ) order by q.question_order, q.created_at)
            from public.paradise_questions q
            where q.level_id = l.id and q.is_active
              and (select count(*) from public.paradise_answers a where a.question_id = q.id) >= 2
              and exists (select 1 from public.paradise_answers a where a.question_id = q.id and a.is_correct)
          ), '[]'::jsonb)
        ) as l_obj, l.level_number
        from public.paradise_levels l
        where l.is_active
      ) lv
      where jsonb_array_length(l_obj -> 'questions') > 0
    ), '[]'::jsonb),
    'settings', coalesce((select jsonb_object_agg(setting_key, setting_value) from public.paradise_settings), '{}'::jsonb)
  )
$$;

-- Judges one answer. Reveals the right answer, the Scripture reference and the
-- explanation, plus the teaching lesson when the player was wrong.
create function public.paradise_check_answer(p_question_id uuid, p_answer_id uuid)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_q public.paradise_questions;
  v_chosen public.paradise_answers;
  v_right uuid;
  v_lesson public.paradise_lessons;
begin
  select * into v_q from public.paradise_questions where id = p_question_id and is_active;
  if not found then raise exception 'unknown question' using errcode = '22023'; end if;
  select * into v_chosen from public.paradise_answers where id = p_answer_id and question_id = p_question_id;
  if not found then raise exception 'unknown answer' using errcode = '22023'; end if;
  select id into v_right from public.paradise_answers where question_id = p_question_id and is_correct;

  if v_chosen.is_correct then
    return jsonb_build_object(
      'correct', true, 'correct_answer_id', v_right,
      'scripture_reference', v_q.scripture_reference, 'explanation', v_q.explanation);
  end if;

  select * into v_lesson from public.paradise_lessons where question_id = p_question_id;
  return jsonb_build_object(
    'correct', false, 'correct_answer_id', v_right,
    'scripture_reference', v_q.scripture_reference, 'explanation', v_q.explanation,
    'lesson', case when v_lesson.id is null then null else jsonb_build_object(
      'title', v_lesson.title, 'description', v_lesson.description,
      'video_type', v_lesson.video_type, 'video_url', v_lesson.video_url,
      'after_video', v_lesson.after_video) end);
end $$;

revoke execute on function public.paradise_content() from public;
revoke execute on function public.paradise_check_answer(uuid, uuid) from public;
grant execute on function public.paradise_content() to anon, authenticated;
grant execute on function public.paradise_check_answer(uuid, uuid) to anon, authenticated;

-- ── Media storage (levels' backgrounds, audio and uploaded lesson videos) ─
-- Public to read so pages can show them; only Paradise staff can add or remove.
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('paradise-media', 'paradise-media', true, 52428800,
            array['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav'])
    on conflict (id) do nothing;

    execute $p$create policy paradise_media_staff_insert on storage.objects for insert to authenticated
      with check (bucket_id = 'paradise-media' and (select public.is_paradise_staff()))$p$;
    execute $p$create policy paradise_media_staff_update on storage.objects for update to authenticated
      using (bucket_id = 'paradise-media' and (select public.is_paradise_staff()))$p$;
    execute $p$create policy paradise_media_staff_delete on storage.objects for delete to authenticated
      using (bucket_id = 'paradise-media' and (select public.is_paradise_staff()))$p$;
  end if;
end $$;
