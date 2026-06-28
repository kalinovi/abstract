-- ─────────────────────────────────────────────────────────────
-- Storage buckets + policies
--   artworks : public read, owner-only write (path = <uid>/<file>)
--   avatars  : public read, owner-only write (path = <uid>/<file>)
-- The first path segment must equal the uploader's user id; this is
-- how we scope writes to "your own folder" without extra columns.
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('artworks', 'artworks', true), ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- ── artworks bucket ─────────────────────────────────────────
create policy "artwork images are public"
  on storage.objects for select
  using (bucket_id = 'artworks');

create policy "users upload artworks to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'artworks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users update their own artwork files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'artworks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users delete their own artwork files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'artworks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── avatars bucket ──────────────────────────────────────────
create policy "avatars are public"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users upload their own avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users update their own avatar"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
