-- Badminton Scoreboard schema for Supabase (Postgres).
-- Run this in the Supabase SQL editor, then run seed.sql.

-- ------------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------------

create table if not exists categories (
  slug         text primary key,
  name         text not null,
  court        text not null,
  format       text not null check (format in ('doubles', 'singles')),
  kind         text not null default 'round-robin'
               check (kind in ('round-robin', 'knockout')),
  game_points  int  not null default 21,
  color        text not null default '#22c55e'
);

-- If upgrading an existing database, add the column added above:
alter table categories add column if not exists kind text not null default 'round-robin';

create table if not exists players (
  id            text primary key,          -- `${categorySlug}:${name}`
  name          text not null,
  category_slug text not null references categories(slug) on delete cascade,
  avatar_url    text
);

create table if not exists teams (
  id            text primary key,          -- `${categorySlug}:${code}`
  category_slug text not null references categories(slug) on delete cascade,
  code          text not null,
  player1_id    text references players(id) on delete set null,
  player2_id    text references players(id) on delete set null
);

create table if not exists matches (
  id            text primary key,          -- `${categorySlug}-${matchNo}`
  category_slug text not null references categories(slug) on delete cascade,
  match_no      int  not null,
  team_a        text not null,             -- team code, or "W{n}" winner placeholder
  team_b        text not null,             -- team code, or "W{n}" winner placeholder
  referee       text,                      -- team code of refereeing team
  referee_name  text,                      -- named individual referee
  stage         text,                      -- bracket round label, e.g. "Final"
  score_a       int  not null default 0,
  score_b       int  not null default 0,
  status        text not null default 'scheduled'
                check (status in ('scheduled', 'live', 'done')),
  winner        text,
  updated_at    timestamptz not null default now()
);

-- If upgrading an existing database, add the columns added above:
alter table matches add column if not exists referee_name text;
alter table matches add column if not exists stage text;

-- ------------------------------------------------------------------
-- Realtime: broadcast row changes on matches and players
-- ------------------------------------------------------------------

alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table players;

-- ------------------------------------------------------------------
-- Row Level Security
-- Demo-friendly: allow anonymous read + write. Tighten for production
-- (e.g. require auth for writes, keep public read).
-- ------------------------------------------------------------------

alter table categories enable row level security;
alter table players    enable row level security;
alter table teams      enable row level security;
alter table matches    enable row level security;

create policy "public read categories" on categories for select using (true);
create policy "public read teams"      on teams      for select using (true);

create policy "public read players"    on players    for select using (true);
create policy "public write players"   on players    for update using (true) with check (true);

create policy "public read matches"    on matches    for select using (true);
create policy "public write matches"   on matches    for insert with check (true);
create policy "public update matches"  on matches    for update using (true) with check (true);

-- ------------------------------------------------------------------
-- Storage bucket for profile pictures (public read).
-- ------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "public upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars');

create policy "public update avatars"
  on storage.objects for update
  using (bucket_id = 'avatars');
