# Abstract — Supabase backend

Postgres schema, Row Level Security, storage buckets and auth triggers for the
Abstract gallery. Works both with the hosted Supabase platform and the local CLI.

## Schema overview

| Object | Purpose |
| --- | --- |
| `profiles` | Public profile per auth user. Auto-created on sign-up via the `handle_new_user` trigger. |
| `artworks` | Uploaded pieces. `image_path` points to a file in the `artworks` storage bucket. |
| `likes` | Composite-key like per (artwork, user). |
| `comments` | Threaded-flat comments on artworks. |
| `artwork_feed` (view) | Artwork joined with its author and like/comment counts. Powers the gallery. |
| Storage `artworks`, `avatars` | Public-read buckets; users may only write inside their own `<uid>/` folder. |

Every table has **Row Level Security** on: everything is world-readable, but
writes are restricted to the owning user (`auth.uid()`).

## Option A — Hosted Supabase (recommended to start)

1. Create a project at https://supabase.com.
2. In the dashboard open **SQL Editor** and run, in order:
   - `migrations/0001_init.sql`
   - `migrations/0002_storage.sql`
3. Copy your **Project URL** and **anon key** from **Project Settings → API** into
   the apps' env files (see the root `README.md`).

## Option B — Local development with the Supabase CLI

```bash
# install once: https://supabase.com/docs/guides/cli
supabase start          # boots Postgres, Auth, Storage, Studio in Docker
supabase db reset       # applies migrations + seed.sql
npm run gen:types       # regenerate packages/shared/src/database.types.ts
```

Local API URL is `http://127.0.0.1:54321`; the anon key is printed by
`supabase start`.

## Regenerating types

The TypeScript types in `packages/shared/src/database.types.ts` are hand-written
to match these migrations. After any schema change, regenerate them from the live
database:

```bash
npm run gen:types
```
