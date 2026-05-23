-- NumerHyd Phase 1 Supabase setup.
-- Run this in the Supabase SQL editor.
-- It creates only the Phase 1 objects: interview_plans, interviews, text_answers,
-- plus token-based RPC functions for the static frontend.

create extension if not exists pgcrypto;

create table if not exists public.interview_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  version text not null,
  title text not null,
  themes jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.interview_plans(id),
  public_token text not null unique,
  manager_token text not null,
  expert_name text,
  profile text,
  selected_theme_ids text[] not null,
  current_theme_id text,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.text_answers (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  theme_id text not null,
  question_text text not null,
  answer_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (interview_id, theme_id)
);

create index if not exists interviews_public_token_idx on public.interviews(public_token);
create index if not exists interviews_manager_token_idx on public.interviews(manager_token);
create index if not exists text_answers_interview_id_idx on public.text_answers(interview_id);

alter table public.interview_plans enable row level security;
alter table public.interviews enable row level security;
alter table public.text_answers enable row level security;

drop policy if exists "anon can read interview plans" on public.interview_plans;
create policy "anon can read interview plans"
  on public.interview_plans
  for select
  to anon
  using (true);

drop policy if exists "no direct anon access to interviews" on public.interviews;
create policy "no direct anon access to interviews"
  on public.interviews
  for all
  to anon
  using (false)
  with check (false);

drop policy if exists "no direct anon access to text answers" on public.text_answers;
create policy "no direct anon access to text answers"
  on public.text_answers
  for all
  to anon
  using (false)
  with check (false);

revoke all on public.interviews from anon, authenticated;
revoke all on public.text_answers from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.interview_plans to anon, authenticated;

insert into public.interview_plans (slug, version, title, themes)
values (
  'numerhyd-v1',
  'phase-1',
  'NumerHyd - Capture d''expertise hydraulique',
  '[
    {
      "id": "drilled-block-design",
      "title": "Blocs forés",
      "question": "Quand vous démarrez la conception d’un bloc foré, par quoi commencez-vous ?"
    },
    {
      "id": "schematics-client-need",
      "title": "Schémas et besoin client",
      "question": "Quand vous lisez un schéma ou un besoin client, qu’est-ce que vous cherchez à comprendre en premier ?"
    },
    {
      "id": "material-choices",
      "title": "Matériaux",
      "question": "Comment choisissez-vous le matériau d’un bloc ou d’un composant selon l’usage prévu ?"
    },
    {
      "id": "pressure-safety",
      "title": "Pression et sécurité",
      "question": "Quels contrôles faites-vous pour sécuriser la pression, la résistance et les risques associés ?"
    },
    {
      "id": "surface-treatments",
      "title": "Traitements de surface",
      "question": "Dans quels cas recommandez-vous un traitement de surface, et qu’est-ce qui guide votre choix ?"
    },
    {
      "id": "hydraulic-components",
      "title": "Composants hydrauliques",
      "question": "Comment choisissez-vous les composants hydrauliques à intégrer dans une solution ?"
    },
    {
      "id": "leak-diagnosis",
      "title": "Diagnostic de fuites",
      "question": "Quand un client vous dit que ça fuit, quelle est votre première réaction ?"
    },
    {
      "id": "troubleshooting-order",
      "title": "Ordre des vérifications",
      "question": "Dans quel ordre faites-vous vos vérifications quand le diagnostic n’est pas évident ?"
    },
    {
      "id": "machining-feasibility",
      "title": "Usinage et faisabilité",
      "question": "Comment évaluez-vous si une pièce ou un bloc est réellement usinable et industriellement faisable ?"
    },
    {
      "id": "frequent-errors",
      "title": "Erreurs fréquentes",
      "question": "Qu’est-ce qu’un débutant aurait tendance à oublier ou à mal interpréter ici ?"
    },
    {
      "id": "weak-signals",
      "title": "Signaux faibles",
      "question": "Quels signes faibles vous mettent en alerte avant que le problème soit évident ?"
    },
    {
      "id": "customer-cases",
      "title": "Cas clients",
      "question": "Pouvez-vous raconter un cas client atypique qui vous a appris quelque chose d’important ?"
    },
    {
      "id": "experience-transfer",
      "title": "Transmission",
      "question": "Si vous deviez transmettre vos réflexes terrain à quelqu’un, que faudrait-il absolument lui faire comprendre ?"
    }
  ]'::jsonb
)
on conflict (slug) do update
set
  version = excluded.version,
  title = excluded.title,
  themes = excluded.themes;

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
    )
  )
  from public.interviews i
  join public.interview_plans p on p.id = i.plan_id
  where i.id = p_interview_id;
$$;

create or replace function public.create_interview(
  p_manager_token text,
  p_public_token text,
  p_expert_name text,
  p_profile text,
  p_selected_theme_ids text[],
  p_plan_slug text default 'numerhyd-v1'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  plan_record public.interview_plans%rowtype;
  inserted_id uuid;
  selected_ids text[];
begin
  if nullif(trim(p_manager_token), '') is null then
    raise exception 'manager token is required';
  end if;

  if nullif(trim(p_public_token), '') is null then
    raise exception 'public token is required';
  end if;

  select * into plan_record
  from public.interview_plans
  where slug = p_plan_slug;

  if plan_record.id is null then
    raise exception 'interview plan not found';
  end if;

  selected_ids := coalesce(
    nullif(p_selected_theme_ids, array[]::text[]),
    array(
      select theme->>'id'
      from jsonb_array_elements(plan_record.themes) theme
    )
  );

  insert into public.interviews (
    plan_id,
    public_token,
    manager_token,
    expert_name,
    profile,
    selected_theme_ids,
    current_theme_id
  )
  values (
    plan_record.id,
    trim(p_public_token),
    trim(p_manager_token),
    nullif(trim(coalesce(p_expert_name, '')), ''),
    nullif(trim(coalesce(p_profile, '')), ''),
    selected_ids,
    selected_ids[1]
  )
  returning id into inserted_id;

  return public.numerhyd_interview_payload(inserted_id);
end;
$$;

create or replace function public.get_public_interview(p_public_token text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select public.numerhyd_interview_payload(i.id)
  from public.interviews i
  where i.public_token = trim(p_public_token);
$$;

create or replace function public.submit_text_answer(
  p_public_token text,
  p_theme_id text,
  p_question_text text,
  p_answer_text text,
  p_next_theme_id text default null,
  p_status text default 'in_progress'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_interview public.interviews%rowtype;
  next_status text;
  next_theme text;
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

  if nullif(trim(p_answer_text), '') is null then
    raise exception 'answer text is required';
  end if;

  next_status := case
    when p_status = 'completed' then 'completed'
    else 'in_progress'
  end;

  next_theme := nullif(trim(coalesce(p_next_theme_id, '')), '');
  if next_theme is not null and not (next_theme = any(target_interview.selected_theme_ids)) then
    next_theme := target_interview.current_theme_id;
  end if;

  insert into public.text_answers (
    interview_id,
    theme_id,
    question_text,
    answer_text
  )
  values (
    target_interview.id,
    p_theme_id,
    p_question_text,
    trim(p_answer_text)
  )
  on conflict (interview_id, theme_id) do update
  set
    question_text = excluded.question_text,
    answer_text = excluded.answer_text,
    updated_at = now();

  update public.interviews
  set
    status = next_status,
    started_at = coalesce(started_at, now()),
    current_theme_id = coalesce(next_theme, current_theme_id),
    updated_at = now(),
    completed_at = case when next_status = 'completed' then now() else completed_at end
  where id = target_interview.id;

  return public.numerhyd_interview_payload(target_interview.id);
end;
$$;

create or replace function public.get_manager_interviews(p_manager_token text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(public.numerhyd_interview_payload(i.id) order by i.updated_at desc),
    '[]'::jsonb
  )
  from public.interviews i
  where i.manager_token = trim(p_manager_token);
$$;

create or replace function public.get_manager_interview_detail(
  p_manager_token text,
  p_interview_id uuid
)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select public.numerhyd_interview_payload(i.id)
  from public.interviews i
  where i.manager_token = trim(p_manager_token)
    and i.id = p_interview_id;
$$;

grant execute on function public.create_interview(text, text, text, text, text[], text) to anon, authenticated;
grant execute on function public.get_public_interview(text) to anon, authenticated;
grant execute on function public.submit_text_answer(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.get_manager_interviews(text) to anon, authenticated;
grant execute on function public.get_manager_interview_detail(text, uuid) to anon, authenticated;
