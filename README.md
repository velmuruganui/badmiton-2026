# Badminton Scoreboard 2026

A realtime badminton tournament scoreboard built with **Next.js (App Router) + Tailwind CSS + Supabase**. Live 20-point scoring, referee tracking, auto-computed round-robin standings, profile pictures for every player, and an umpire PIN lock so only the scorer can change the score.

## Features

- **All categories** transcribed from the organiser's sheets: Shuttle Mafia, Racket Raja (both Court 1/2 doubles round-robins), Kids U15, Kids U11, and Women.
- **Live scoreboard** — big dual score panels, `+1 / −1`, game-to-20 win detection, undo and reset.
- **Umpire mode** — everyone sees scores read-only; entering the shared PIN unlocks scoring controls on that device.
- **Standings** auto-computed per category (played, won, lost, points for/against, difference, rank).
- **Profile pictures** for all players with a colored initials fallback. Manage them on the `/players` page.
- **Realtime sync** across devices when Supabase is configured; otherwise runs fully local with `localStorage`.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # optional — see below
npm run dev
```

Open http://localhost:3000. Without any env vars the app works immediately and saves scores/photos in your browser.

The default umpire PIN is **1111** (override with `NEXT_PUBLIC_UMPIRE_PIN`).

## Enabling Supabase (realtime + cross-device)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql). This creates the tables, enables realtime, sets demo-friendly RLS policies, and creates the public `avatars` Storage bucket.
3. Fill in `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # server-only, used just for seeding
   NEXT_PUBLIC_UMPIRE_PIN=1111
   ```

4. Seed the tournament data (categories, players, teams, fixtures) from the single source of truth:

   ```bash
   npm run dev
   # then hit the seed endpoint once:
   curl -X POST http://localhost:3000/api/seed
   ```

   Re-running the seed is safe — existing match scores are preserved.

## Project structure

- `lib/tournament-data.ts` — single source of truth for categories, teams, players and fixtures.
- `lib/store.tsx` — data provider (Supabase realtime or local fallback) for scores and avatars.
- `lib/umpire.tsx` — PIN-gated umpire context.
- `lib/scoring.ts`, `lib/standings.ts` — game rules and standings computation.
- `app/` — dashboard, `[category]`, `[category]/match/[matchNo]` scoreboard, `players`, `api/seed`.
- `components/` — `Avatar`, `PhotoUpload`, `MatchCard`, `StandingsTable`, `Scoreboard`, etc.
- `supabase/schema.sql` — database schema, RLS, realtime and Storage setup.

## Notes

- Games are single game to **20 points** (first to 20, no deuce). Adjust `gamePoints` per category in `lib/tournament-data.ts`.
- **Women Doubles** is a 3-team round-robin (each team plays 2 matches). The two mixed-doubles categories (Men-Women, Men-Kids) are knockout with lot-drawn partners and are not yet added, pending the lot draw.
- Umpire gating is client-side (suitable for a friendly tournament). For hardened access control, upgrade to Supabase Auth + RLS.
