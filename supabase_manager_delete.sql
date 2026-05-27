-- NumerHyd manager cleanup helper.
-- Adds a manager-token protected interview delete RPC.

create or replace function public.delete_manager_interview(
  p_manager_token text,
  p_interview_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_interview public.interviews%rowtype;
  audio_paths text[] := '{}'::text[];
begin
  select * into target_interview
  from public.interviews
  where id = p_interview_id
    and manager_token = trim(p_manager_token);

  if target_interview.id is null then
    return jsonb_build_object(
      'deleted', false,
      'reason', 'not_found_or_unauthorized'
    );
  end if;

  select coalesce(array_agg(storage_path), '{}'::text[])
  into audio_paths
  from public.audio_assets
  where interview_id = target_interview.id;

  delete from public.interviews
  where id = target_interview.id
    and manager_token = trim(p_manager_token);

  return jsonb_build_object(
    'deleted', true,
    'interview_id', target_interview.id,
    'audio_storage_paths', to_jsonb(audio_paths),
    'storage_cleanup', 'not_deleted'
  );
end;
$$;

grant execute on function public.delete_manager_interview(text, uuid) to anon, authenticated;
