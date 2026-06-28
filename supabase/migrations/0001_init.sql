-- ─────────────────────────────────────────────────────────────
-- Abstract — initial schema
-- Profiles, artworks, likes, comments + Row Level Security.
-- ─────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ── PROFILES ────────────────────────────────────────────────
-- One row per auth user. Created automatically by a trigger on
-- auth.users (see handle_new_user below).
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text unique not null
                 check (char_length(username) between 3 and 30
                        and username ~ '^[a-zA-Z0-9_]+$'),
  display_name text,
  bio          text check (char_length(bio) <= 280),
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── ARTWORKS ────────────────────────────────────────────────
create table public.artworks (
  id          uuid primary key default uuid_generate_v4(),
  author_id   uuid not null references public.profiles (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 120),
  description text check (char_length(description) <= 2000),
  image_path  text not null,                  -- path inside the 'artworks' storage bucket
  width       integer,
  height      integer,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index artworks_author_id_idx on public.artworks (author_id);
create index artworks_created_at_idx on public.artworks (created_at desc);

-- ── LIKES ───────────────────────────────────────────────────
create table public.likes (
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (artwork_id, user_id)
);
create index likes_user_id_idx on public.likes (user_id);

-- ── COMMENTS ────────────────────────────────────────────────
create table public.comments (
  id         uuid primary key default uuid_generate_v4(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index comments_artwork_id_idx on public.comments (artwork_id, created_at);

-- ── updated_at helper ───────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger artworks_set_updated_at
  before update on public.artworks
  for each row execute function public.set_updated_at();

-- ── Auto-create a profile when a user signs up ──────────────
-- Reads username/display_name from the signup metadata; falls back
-- to a unique handle derived from the user id.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  handle text;
begin
  handle := coalesce(
    nullif(new.raw_user_meta_data ->> 'username', ''),
    'user_' || left(replace(new.id::text, '-', ''), 12)
  );

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    handle,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), handle)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Feed view: artwork + author + like/comment counts ───────
create view public.artwork_feed
with (security_invoker = true) as
  select
    a.id,
    a.title,
    a.description,
    a.image_path,
    a.width,
    a.height,
    a.created_at,
    a.author_id,
    p.username      as author_username,
    p.display_name  as author_display_name,
    p.avatar_url    as author_avatar_url,
    coalesce(l.cnt, 0)  as like_count,
    coalesce(c.cnt, 0)  as comment_count
  from public.artworks a
  join public.profiles p on p.id = a.author_id
  left join (select artwork_id, count(*) cnt from public.likes    group by artwork_id) l on l.artwork_id = a.id
  left join (select artwork_id, count(*) cnt from public.comments group by artwork_id) c on c.artwork_id = a.id;

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.artworks enable row level security;
alter table public.likes    enable row level security;
alter table public.comments enable row level security;

-- profiles: world-readable; you may only write your own row
create policy "profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "users insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "users update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- artworks: world-readable; only the author can create/edit/delete
create policy "artworks are viewable by everyone"
  on public.artworks for select using (true);
create policy "users create their own artworks"
  on public.artworks for insert with check (auth.uid() = author_id);
create policy "authors update their own artworks"
  on public.artworks for update using (auth.uid() = author_id);
create policy "authors delete their own artworks"
  on public.artworks for delete using (auth.uid() = author_id);

-- likes: world-readable; you may only like/unlike as yourself
create policy "likes are viewable by everyone"
  on public.likes for select using (true);
create policy "users like as themselves"
  on public.likes for insert with check (auth.uid() = user_id);
create policy "users remove their own likes"
  on public.likes for delete using (auth.uid() = user_id);

-- comments: world-readable; author-only write
create policy "comments are viewable by everyone"
  on public.comments for select using (true);
create policy "users comment as themselves"
  on public.comments for insert with check (auth.uid() = author_id);
create policy "authors delete their own comments"
  on public.comments for delete using (auth.uid() = author_id);
