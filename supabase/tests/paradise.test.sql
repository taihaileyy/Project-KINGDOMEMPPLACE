-- Paradise: staff manage content, players never see answer keys, progress is private.

create or replace function pg_temp.act_as(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_user::text, ''), true);
  if p_user is null then execute 'set local role anon'; else execute 'set local role authenticated'; end if;
end $$;
create or replace function pg_temp.assert(ok boolean, msg text) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'FAILED: %', msg; end if;
end $$;

-- Users from identity.test.sql: ...0001 super admin, ...0002 member, ...0004 housing staff.
begin;
select pg_temp.act_as('10000000-0000-0000-0000-000000000001');
insert into public.paradise_levels (id, level_number, name) values ('20000000-0000-0000-0000-000000000001', 1, 'Level 1');
insert into public.paradise_questions (id, level_id, question_text, scripture_reference, explanation, question_order)
  values ('20000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-000000000001', '[Placeholder] Q1', 'Ref 1:1', 'Because.', 1);
insert into public.paradise_answers (id, question_id, answer_text, answer_order, is_correct) values
  ('20000000-0000-0000-0000-0000000000b1', '20000000-0000-0000-0000-0000000000a1', 'A', 1, true),
  ('20000000-0000-0000-0000-0000000000b2', '20000000-0000-0000-0000-0000000000a1', 'B', 2, false);
insert into public.paradise_lessons (question_id, title, video_type, video_url)
  values ('20000000-0000-0000-0000-0000000000a1', 'Lesson', 'youtube', 'https://youtu.be/x');
-- A question can't have two correct answers.
do $$ begin
  insert into public.paradise_answers (question_id, answer_text, answer_order, is_correct)
    values ('20000000-0000-0000-0000-0000000000a1', 'C', 3, true);
  raise exception 'FAILED: two correct answers were accepted';
exception when unique_violation then null;
end $$;
-- An inactive and an incomplete question are never served.
insert into public.paradise_questions (id, level_id, question_text, is_active) values ('20000000-0000-0000-0000-0000000000a2', '20000000-0000-0000-0000-000000000001', 'Inactive', false);
insert into public.paradise_questions (id, level_id, question_text) values ('20000000-0000-0000-0000-0000000000a3', '20000000-0000-0000-0000-000000000001', 'No answers');

-- Visitors can't read the tables, but can play.
select pg_temp.act_as(null);
do $$ begin
  perform 1 from public.paradise_answers;
  raise exception 'FAILED: anon read the answer table';
exception when insufficient_privilege then null;
end $$;
select pg_temp.assert(jsonb_array_length(public.paradise_content() -> 'levels' -> 0 -> 'questions') = 1, 'only the playable question is served');
select pg_temp.assert(position('is_correct' in public.paradise_content()::text) = 0, 'the content never carries the answer key');
select pg_temp.assert((public.paradise_check_answer('20000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-0000000000b1') ->> 'correct')::boolean, 'right answer is right');
select pg_temp.assert(public.paradise_check_answer('20000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-0000000000b1') -> 'lesson' is null, 'no lesson on a correct answer');
select pg_temp.assert(public.paradise_check_answer('20000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-0000000000b2') -> 'lesson' ->> 'title' = 'Lesson', 'wrong answer returns the lesson');
select pg_temp.assert(public.paradise_check_answer('20000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-0000000000b2') ->> 'correct_answer_id' = '20000000-0000-0000-0000-0000000000b1', 'wrong answer reveals the right one');
do $$ begin
  perform public.paradise_check_answer('20000000-0000-0000-0000-0000000000a2', '20000000-0000-0000-0000-0000000000b1');
  raise exception 'FAILED: an inactive question could be answered';
exception when invalid_parameter_value then null;
end $$;

-- Other staff and members cannot edit content.
select pg_temp.act_as('10000000-0000-0000-0000-000000000004');
do $$ declare n int; begin
  update public.paradise_levels set name = 'Hacked';
  get diagnostics n = row_count;
  if n > 0 then raise exception 'FAILED: housing staff edited a level'; end if;
end $$;
select pg_temp.assert((select count(*) from public.paradise_questions) = 0, 'housing staff cannot see questions');

-- Progress is private to its player.
select pg_temp.act_as('10000000-0000-0000-0000-000000000002');
insert into public.paradise_player_progress (person_id, correct_count) values (public.auth_person_id(), 1);
select pg_temp.assert((select count(*) from public.paradise_player_progress) = 1, 'a member sees their own progress');
do $$ begin
  insert into public.paradise_player_progress (person_id) values ((select id from public.people where email = 'admin@example.com' limit 1));
  raise exception 'FAILED: wrote progress for someone else';
exception when others then
  if sqlerrm like 'FAILED%' then raise; end if;
end $$;
select pg_temp.act_as('10000000-0000-0000-0000-000000000001');
select pg_temp.assert((select count(*) from public.paradise_player_progress) = 1, 'paradise staff can read progress');
rollback;
