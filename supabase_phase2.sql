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
