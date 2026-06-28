-- ─────────────────────────────────────────────────────────────
-- Make profile auto-creation work for OAuth sign-ups (Google, GitHub…).
-- OAuth providers don't send a `username`, but they do send the user's
-- name and avatar under different metadata keys. Pick those up and fall
-- back to a guaranteed-unique handle.
-- ─────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  meta   jsonb := new.raw_user_meta_data;
  handle text;
begin
  handle := coalesce(
    nullif(meta ->> 'username', ''),
    'user_' || left(replace(new.id::text, '-', ''), 12)
  );

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    handle,
    coalesce(
      nullif(meta ->> 'display_name', ''),
      nullif(meta ->> 'full_name', ''),
      nullif(meta ->> 'name', ''),
      handle
    ),
    coalesce(
      nullif(meta ->> 'avatar_url', ''),
      nullif(meta ->> 'picture', '')
    )
  );
  return new;
end;
$$;
