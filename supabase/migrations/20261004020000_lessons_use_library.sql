-- A game lesson can use a video from the media library (Admin > Videos) instead
-- of its own pasted link, so one library serves the whole site. When both are
-- set, the library item wins and brings its transcript and captions with it.
alter table public.paradise_lessons
  add column media_id uuid references public.media_items (id) on delete set null;
create index paradise_lessons_media_idx on public.paradise_lessons (media_id) where media_id is not null;

create or replace function public.paradise_check_answer(p_question_id uuid, p_answer_id uuid)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_q public.paradise_questions;
  v_chosen public.paradise_answers;
  v_right uuid;
  v_lesson public.paradise_lessons;
  v_media public.media_items;
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
  if v_lesson.media_id is not null then
    select * into v_media from public.media_items where id = v_lesson.media_id and is_active;
  end if;

  -- A wrong answer never reveals the right one: the player retries the same question.
  return jsonb_build_object(
    'correct', false,
    'scripture_reference', v_q.scripture_reference, 'explanation', v_q.explanation,
    'lesson', case when v_lesson.id is null then null else jsonb_build_object(
      'title', coalesce(v_lesson.title, v_media.title),
      'description', coalesce(v_lesson.description, v_media.description),
      'video_type', case when v_media.id is not null then v_media.source::text else v_lesson.video_type::text end,
      'video_url', case when v_media.id is not null then coalesce(v_media.embed_url, v_media.url) else v_lesson.video_url end,
      'watch_url', v_media.url,
      'transcript', v_media.transcript,
      'captions_url', v_media.captions_url) end);
end $$;
