-- 1) Church schedule: editable by staff, readable by everyone. Bible Study is
--    every Wednesday at 6:30 PM; worship times vary, so it starts with no time
--    and the site shows a friendly message until staff set one.
create table public.schedule_items (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null default 'other' check (kind in ('bible_study', 'worship', 'other')),
  title      text not null check (char_length(title) between 1 and 120),
  detail     text check (char_length(detail) <= 300),
  frequency  text not null default 'weekly' check (frequency in ('weekly', 'varies', 'custom')),
  weekday    int check (weekday between 0 and 6),          -- 0 = Sunday
  start_time time,
  note       text check (char_length(note) <= 200),        -- shown for 'varies' and 'custom'
  is_active  boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index schedule_items_order_idx on public.schedule_items (sort_order) where is_active;

create trigger schedule_items_touch before update on public.schedule_items for each row execute function public.touch_updated_at();
create trigger schedule_items_audit after insert or update or delete on public.schedule_items for each row execute function public.audit_row();

alter table public.schedule_items enable row level security;
create policy schedule_items_read on public.schedule_items for select to anon, authenticated using (is_active);
create policy schedule_items_staff_read on public.schedule_items for select to authenticated using ((select public.has_role('church_staff')));
create policy schedule_items_staff_write on public.schedule_items for all to authenticated
  using ((select public.has_role('church_staff'))) with check ((select public.has_role('church_staff')));
grant select on public.schedule_items to anon;

insert into public.schedule_items (kind, title, detail, frequency, weekday, start_time, sort_order) values
  ('bible_study', 'Bible Study', 'A midweek Bible study taught by a Kingdom minister.', 'weekly', 3, '18:30', 10);
insert into public.schedule_items (kind, title, detail, frequency, sort_order) values
  ('worship', 'Worship Service', 'Worship, the Word and fellowship with the KEP church family.', 'varies', 20);

-- 2) Create Your World: a wrong answer always leads to the lesson and then the
--    SAME question again, so the "after the video" choice no longer exists.
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
    'correct', false,
    'scripture_reference', v_q.scripture_reference, 'explanation', v_q.explanation,
    'lesson', case when v_lesson.id is null then null else jsonb_build_object(
      'title', v_lesson.title, 'description', v_lesson.description,
      'video_type', v_lesson.video_type, 'video_url', v_lesson.video_url) end);
end $$;

-- Kept for safety and no longer read by the game or the admin.
comment on column public.paradise_lessons.after_video is 'Deprecated: a wrong answer always leads to a retry of the same question.';
