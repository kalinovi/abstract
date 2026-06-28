# CLAUDE.md — Abstract project norms

Rules and conventions for working in this repo. Read this before making changes.

## What this is

**Abstract** — online art gallery & community. Full rewrite of an old PHP/Bootstrap
site into a real product. Monorepo:

- `apps/web` — Next.js 14 (App Router, Tailwind). The main, runnable app.
- `apps/mobile` — Expo / React Native (Expo Router).
- `packages/shared` — `@abstract/shared`: TypeScript types, Zod validation and
  Supabase query functions used by **both** apps.
- `supabase/` — SQL migrations (schema, RLS, storage), config, seed scripts.
- `legacy/` — the original PHP site, archived. Don't build on it.

## Golden rules

1. **Never commit secrets.** Real keys live in `apps/web/.env.local` and
   `apps/mobile/.env`, which are git-ignored. Only `*.env.example` files (with
   placeholders) are committed. The Supabase `service_role` key is admin-only —
   pass it as an env var when seeding, never write it to a tracked file.
2. **Keep `.gitignore` honest.** It must always exclude: `node_modules/`, build
   output (`.next/`, `.expo/`, `dist/`, `build/`), all `.env*.local`, and large
   source binaries (e.g. `videos/`). Don't commit files >25 MB — optimize first.
3. **Share logic, don't duplicate it.** Anything used by both web and mobile
   (types, validation, Supabase queries) goes in `packages/shared`. Write a query
   once; import it everywhere.
4. **Security is in the database.** Every table has Row Level Security: world-
   readable, writes restricted to the owner via `auth.uid()`. New tables must ship
   with RLS policies in a migration — never disable RLS to "make it work".
5. **TypeScript strict, and it must typecheck.** Run `npm run typecheck` before
   committing. No `any` to silence errors — fix the type.

## Conventions

- **Migrations** are append-only and ordered: `0001`, `0002`, … Never edit an
  applied migration; add a new one. Keep the hand-written types in
  `packages/shared/src/database.types.ts` in sync (`npm run gen:types`).
- **Images**: animated GIFs must use `unoptimized` on `next/image` or they freeze.
  Upload cap is a soft limit in `UploadForm` (perf, not a hard rule).
- **Match the surrounding code** — comment density, naming, and idiom. UI copy is
  in English; colors come from the Tailwind theme tokens (`ink`, `accent`).

## Running it

```bash
npm install
# Fill apps/web/.env.local and apps/mobile/.env from the .env.example files
npm run web        # Next.js  → http://localhost:3000
npm run mobile     # Expo dev server
npm run typecheck  # all workspaces
```

Backend setup and the SQL migrations are documented in `supabase/README.md`.
Requires Node ≥ 18 (system Node, not just the Git Bash one).
