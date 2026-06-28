# Abstract

> Online art gallery & community — discover, share and discuss artwork.
> Web + mobile, one backend.

This is a full rewrite of the original PHP/Bootstrap landing page into a real,
functional product. The old site is preserved untouched in [`legacy/`](./legacy).

## Stack

| Layer | Tech |
| --- | --- |
| **Backend** | [Supabase](https://supabase.com) — Postgres, Auth, Storage, Row Level Security |
| **Web** | [Next.js 14](https://nextjs.org) (App Router, Server Components) + Tailwind CSS |
| **Mobile** | [Expo](https://expo.dev) + Expo Router (React Native) |
| **Shared** | `@abstract/shared` — TypeScript types, Zod validation and data-access logic used by **both** apps |

It's an **npm-workspaces monorepo**, so web and mobile share the same database
types and query functions — write a query once, use it everywhere.

```
abstract/
├── apps/
│   ├── web/        Next.js web app
│   └── mobile/     Expo React Native app
├── packages/
│   └── shared/     Types, validation, Supabase queries (shared)
├── supabase/       SQL migrations, RLS policies, storage, config
└── legacy/         The original PHP site (archived)
```

## Features

- Email/password **auth** (sign up, log in, sign out) with profiles auto-created on signup
- **Gallery feed** of artwork with author, like and comment counts
- **Upload** artwork (image → Supabase Storage, scoped to your own folder by RLS)
- **Artwork detail** with optimistic **likes** and **comments**
- **Profiles** at `/u/<username>` showing a creator's pieces
- Same capabilities on web and mobile, sharing one backend

## Getting started

### 1. Backend (Supabase)

Follow [`supabase/README.md`](./supabase/README.md): create a project, run the two
migrations, and grab your **Project URL** + **anon key**.

### 2. Install dependencies (from the repo root)

```bash
npm install
```

### 3. Configure environment variables

```bash
# Web
cp .env.example apps/web/.env.local      # fill NEXT_PUBLIC_SUPABASE_* values

# Mobile
cp apps/mobile/.env.example apps/mobile/.env   # fill EXPO_PUBLIC_SUPABASE_* values
```

### 4. Run

```bash
npm run web        # Next.js  → http://localhost:3000
npm run mobile     # Expo     → scan the QR with Expo Go, or press i / a
```

## Useful scripts (root)

| Script | What it does |
| --- | --- |
| `npm run web` | Start the Next.js dev server |
| `npm run mobile` | Start the Expo dev server |
| `npm run build:web` | Production build of the web app |
| `npm run typecheck` | Type-check every workspace |
| `npm run gen:types` | Regenerate DB types from the local Supabase schema |

## What changed vs. the old PHP site

The original was a static Bootstrap mock with two PHP `include()`s and no real
backend — the "Login", "Explore" and contact features didn't do anything. Notable
fixes and upgrades:

- Removed the **duplicated, conflicting Bootstrap versions** (5.2.3 CDN + 5.1.3 bundle).
- Replaced the 200 KB unminified CSS and render-blocking CDN scripts with a small
  Tailwind build.
- Turned the hardcoded 3-image gallery into a **real, database-backed feed** with
  uploads, likes and comments.
- Added **authentication**, **per-user authorization** (RLS) and **image storage**.
- Added **accessibility** basics (real `alt` text, labelled inputs, focus styles).
- Shipped a **React Native app** sharing the same backend and logic.

### Still worth doing (noted, not yet done)

- The hero video (`apps/web/public/media/hero.mp4`, ~30 MB) should be compressed /
  served from a CDN, or swapped for a poster image + lazy load.
- Image thumbnails: generate resized variants (e.g. a Supabase image transform) so
  the feed doesn't download full-resolution art.
- Email confirmation is disabled for a smooth first run — enable it for production.
