-- NumerHyd Phase 3 Supabase setup.
-- Run this after supabase_phase1.sql and supabase_phase2.sql.
-- It adds a controlled AI decision log while keeping text_answers as the
-- manager-compatible answer store.

create extension if not exists pgcrypto;

create table if not exists public.ai_decisions (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  theme_id text not null,
  question_id text not null,
  question_text text not null,
  answer_text text not null,
  action text not null
    check (action in ('ask_followup', 'next_question', 'next_theme', 'finish_interview')),
  followup_text text,
  off_topic boolean not null default false,
  confidence numeric not null default 0
    check (confidence >= 0 and confidence <= 1),
  rationale text,
  status text not null default 'accepted'
    check (status in ('accepted', 'fallback', 'rejected', 'error')),
  error_message text,
  raw_response jsonb,
  validated_response jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_decisions_interview_id_idx on public.ai_decisions(interview_id);
create index if not exists ai_decisions_theme_id_idx on public.ai_decisions(theme_id);
create index if not exists ai_decisions_created_at_idx on public.ai_decisions(created_at);

alter table public.ai_decisions enable row level security;

drop policy if exists "no direct anon access to ai decisions" on public.ai_decisions;
create policy "no direct anon access to ai decisions"
  on public.ai_decisions
  for all
  to anon
  using (false)
  with check (false);

revoke all on public.ai_decisions from anon, authenticated;
grant usage on schema public to anon, authenticated;

create or replace function public.numerhyd_interview_payload(p_interview_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'interview', to_jsonb(i) - 'manager_token',
    'plan', to_jsonb(p),
    'answers', coalesce(
      (
        select jsonb_agg(to_jsonb(a) order by a.created_at)
        from public.text_answers a
        where a.interview_id = i.id
      ),
      '[]'::jsonb
    ),
    'ai_decisions', coalesce(
      (
        select jsonb_agg(to_jsonb(d) order by d.created_at)
        from public.ai_decisions d
        where d.interview_id = i.id
      ),
      '[]'::jsonb
    )
  )
  from public.interviews i
  join public.interview_plans p on p.id = i.plan_id
  where i.id = p_interview_id;
$$;

create or replace function public.insert_ai_decision_for_public_interview(
  p_public_token text,
  p_theme_id text,
  p_question_id text,
  p_question_text text,
  p_answer_text text,
  p_action text,
  p_followup_text text,
  p_off_topic boolean,
  p_confidence numeric,
  p_rationale text,
  p_status text,
  p_error_message text default null,
  p_raw_response jsonb default null,
  p_validated_response jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_interview public.interviews%rowtype;
  inserted_id uuid;
begin
  select * into target_interview
  from public.interviews
  where public_token = trim(p_public_token);

  if target_interview.id is null then
    return null;
  end if;

  if not (p_theme_id = any(target_interview.selected_theme_ids)) then
    raise exception 'theme is not part of this interview';
  end if;

  insert into public.ai_decisions (
    interview_id,
    theme_id,
    question_id,
    question_text,
    answer_text,
    action,
    followup_text,
    off_topic,
    confidence,
    rationale,
    status,
    error_message,
    raw_response,
    validated_response
  )
  values (
    target_interview.id,
    p_theme_id,
    nullif(trim(coalesce(p_question_id, '')), ''),
    coalesce(p_question_text, ''),
    coalesce(p_answer_text, ''),
    p_action,
    nullif(trim(coalesce(p_followup_text, '')), ''),
    coalesce(p_off_topic, false),
    least(1, greatest(0, coalesce(p_confidence, 0))),
    nullif(trim(coalesce(p_rationale, '')), ''),
    p_status,
    nullif(trim(coalesce(p_error_message, '')), ''),
    p_raw_response,
    p_validated_response
  )
  returning id into inserted_id;

  return jsonb_build_object(
    'id', inserted_id,
    'interview_id', target_interview.id,
    'theme_id', p_theme_id,
    'action', p_action,
    'followup_text', nullif(trim(coalesce(p_followup_text, '')), ''),
    'status', p_status
  );
end;
$$;

grant execute on function public.insert_ai_decision_for_public_interview(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean,
  numeric,
  text,
  text,
  text,
  jsonb,
  jsonb
) to anon, authenticated;
