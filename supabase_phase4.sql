-- NumerHyd Phase 4 Supabase setup.
-- Run this after supabase_phase1.sql, supabase_phase2.sql, and supabase_phase3.sql.
-- It adds saved manager-generated technical fiches without changing raw answers.

create extension if not exists pgcrypto;

create table if not exists public.technical_fiches (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  theme_id text not null,
  theme_title text not null,
  status text not null
    check (status in ('Non abordé', 'Réponse partielle', 'Exploitable', 'À compléter')),
  fiche jsonb not null,
  source_answer_ids uuid[] not null default '{}',
  model text,
  generation_status text not null default 'generated'
    check (generation_status in ('generated', 'fallback', 'error')),
  error_message text,
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (interview_id, theme_id)
);

create index if not exists technical_fiches_interview_id_idx on public.technical_fiches(interview_id);
create index if not exists technical_fiches_theme_id_idx on public.technical_fiches(theme_id);

alter table public.technical_fiches enable row level security;

drop policy if exists "no direct anon access to technical fiches" on public.technical_fiches;
create policy "no direct anon access to technical fiches"
  on public.technical_fiches
  for all
  to anon
  using (false)
  with check (false);

revoke all on public.technical_fiches from anon, authenticated;
grant usage on schema public to anon, authenticated;

create or replace function public.numerhyd_manager_interview_payload(p_interview_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select public.numerhyd_interview_payload(i.id) || jsonb_build_object(
    'fiches', coalesce(
      (
        select jsonb_agg(to_jsonb(f) order by array_position(i.selected_theme_ids, f.theme_id), f.generated_at)
        from public.technical_fiches f
        where f.interview_id = i.id
      ),
      '[]'::jsonb
    )
  )
  from public.interviews i
  where i.id = p_interview_id;
$$;

create or replace function public.get_manager_interviews(p_manager_token text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(public.numerhyd_manager_interview_payload(i.id) order by i.updated_at desc),
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
  select public.numerhyd_manager_interview_payload(i.id)
  from public.interviews i
  where i.manager_token = trim(p_manager_token)
    and i.id = p_interview_id;
$$;

create or replace function public.upsert_generated_fiches_for_manager(
  p_manager_token text,
  p_interview_id uuid,
  p_fiches jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_interview public.interviews%rowtype;
  item jsonb;
  source_ids uuid[];
begin
  select * into target_interview
  from public.interviews
  where id = p_interview_id
    and manager_token = trim(p_manager_token);

  if target_interview.id is null then
    return null;
  end if;

  if jsonb_typeof(p_fiches) <> 'array' then
    raise exception 'fiches payload must be an array';
  end if;

  for item in select value from jsonb_array_elements(p_fiches)
  loop
    if not ((item->>'theme_id') = any(target_interview.selected_theme_ids)) then
      raise exception 'theme is not part of this interview';
    end if;

    select coalesce(array_agg(value::uuid), '{}'::uuid[])
    into source_ids
    from jsonb_array_elements_text(coalesce(item->'source_answer_ids', '[]'::jsonb)) value;

    insert into public.technical_fiches (
      interview_id,
      theme_id,
      theme_title,
      status,
      fiche,
      source_answer_ids,
      model,
      generation_status,
      error_message,
      generated_at,
      updated_at
    )
    values (
      target_interview.id,
      item->>'theme_id',
      coalesce(nullif(item->>'theme_title', ''), item->>'theme_id'),
      item->>'status',
      item->'fiche',
      source_ids,
      nullif(item->>'model', ''),
      coalesce(nullif(item->>'generation_status', ''), 'generated'),
      nullif(item->>'error_message', ''),
      now(),
      now()
    )
    on conflict (interview_id, theme_id) do update
    set
      theme_title = excluded.theme_title,
      status = excluded.status,
      fiche = excluded.fiche,
      source_answer_ids = excluded.source_answer_ids,
      model = excluded.model,
      generation_status = excluded.generation_status,
      error_message = excluded.error_message,
      generated_at = excluded.generated_at,
      updated_at = now();
  end loop;

  return public.numerhyd_manager_interview_payload(target_interview.id);
end;
$$;

grant execute on function public.numerhyd_manager_interview_payload(uuid) to anon, authenticated;
grant execute on function public.get_manager_interviews(text) to anon, authenticated;
grant execute on function public.get_manager_interview_detail(text, uuid) to anon, authenticated;
grant execute on function public.upsert_generated_fiches_for_manager(text, uuid, jsonb) to anon, authenticated;
