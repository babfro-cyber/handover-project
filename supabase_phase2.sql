-- NumerHyd Phase 2 Supabase setup.
-- Run this after supabase_phase1.sql.
-- It adds private audio storage plus metadata tables for recorded answers
-- and server-side transcription results.

create extension if not exists pgcrypto;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'answer-audio',
  'answer-audio',
  false,
  26214400,
  array[
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'audio/m4a'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.audio_assets (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  theme_id text not null,
  storage_path text not null unique,
  mime_type text not null,
  byte_size integer not null check (byte_size >= 0),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  status text not null default 'uploading'
    check (status in ('uploading', 'uploaded', 'transcribing', 'transcribed', 'transcription_failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.transcripts (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  audio_asset_id uuid not null references public.audio_assets(id) on delete cascade,
  theme_id text not null,
  transcript_text text not null default '',
  language text,
  model text,
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists audio_assets_interview_id_idx on public.audio_assets(interview_id);
create index if not exists audio_assets_theme_id_idx on public.audio_assets(theme_id);
create index if not exists transcripts_interview_id_idx on public.transcripts(interview_id);
create index if not exists transcripts_audio_asset_id_idx on public.transcripts(audio_asset_id);

alter table public.audio_assets enable row level security;
alter table public.transcripts enable row level security;

drop policy if exists "no direct anon access to audio assets" on public.audio_assets;
create policy "no direct anon access to audio assets"
  on public.audio_assets
  for all
  to anon
  using (false)
  with check (false);

drop policy if exists "no direct anon access to transcripts" on public.transcripts;
create policy "no direct anon access to transcripts"
  on public.transcripts
  for all
  to anon
  using (false)
  with check (false);

revoke all on public.audio_assets from anon, authenticated;
revoke all on public.transcripts from anon, authenticated;

grant usage on schema public to anon, authenticated;

drop policy if exists "edge function can upload answer audio" on storage.objects;
create policy "edge function can upload answer audio"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'answer-audio');

create or replace function public.create_audio_asset_for_public_interview(
  p_public_token text,
  p_audio_asset_id uuid,
  p_theme_id text,
  p_storage_path text,
  p_mime_type text,
  p_byte_size integer,
  p_duration_ms integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_interview public.interviews%rowtype;
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

  insert into public.audio_assets (
    id,
    interview_id,
    theme_id,
    storage_path,
    mime_type,
    byte_size,
    duration_ms,
    status
  )
  values (
    p_audio_asset_id,
    target_interview.id,
    p_theme_id,
    p_storage_path,
    p_mime_type,
    p_byte_size,
    p_duration_ms,
    'uploading'
  );

  return jsonb_build_object(
    'audio_asset_id', p_audio_asset_id,
    'interview_id', target_interview.id,
    'theme_id', p_theme_id,
    'storage_path', p_storage_path
  );
end;
$$;

create or replace function public.update_audio_asset_status_for_public_interview(
  p_public_token text,
  p_audio_asset_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.audio_assets aa
  set status = p_status
  from public.interviews i
  where aa.interview_id = i.id
    and i.public_token = trim(p_public_token)
    and aa.id = p_audio_asset_id;
end;
$$;

create or replace function public.insert_transcript_for_public_interview(
  p_public_token text,
  p_audio_asset_id uuid,
  p_transcript_text text,
  p_language text,
  p_model text,
  p_status text,
  p_error_message text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_audio public.audio_assets%rowtype;
  inserted_id uuid;
begin
  select aa.* into target_audio
  from public.audio_assets aa
  join public.interviews i on i.id = aa.interview_id
  where i.public_token = trim(p_public_token)
    and aa.id = p_audio_asset_id;

  if target_audio.id is null then
    raise exception 'audio asset not found';
  end if;

  insert into public.transcripts (
    interview_id,
    audio_asset_id,
    theme_id,
    transcript_text,
    language,
    model,
    status,
    error_message
  )
  values (
    target_audio.interview_id,
    target_audio.id,
    target_audio.theme_id,
    coalesce(p_transcript_text, ''),
    nullif(trim(coalesce(p_language, '')), ''),
    nullif(trim(coalesce(p_model, '')), ''),
    p_status,
    p_error_message
  )
  returning id into inserted_id;

  return jsonb_build_object('transcript_id', inserted_id);
end;
$$;

grant execute on function public.create_audio_asset_for_public_interview(text, uuid, text, text, text, integer, integer) to anon, authenticated;
grant execute on function public.update_audio_asset_status_for_public_interview(text, uuid, text) to anon, authenticated;
grant execute on function public.insert_transcript_for_public_interview(text, uuid, text, text, text, text, text) to anon, authenticated;
