import { createClient } from "@supabase/supabase-js";
import { CATEGORIES, matchKey, playerId } from "@/lib/tournament-data";

/**
 * One-time seed of Supabase from lib/tournament-data. Uses the service role
 * key (server only) to bypass RLS. Existing match scores are preserved.
 *
 * Usage: POST /api/seed  (or GET while developing).
 */
async function seed() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return Response.json(
      {
        ok: false,
        error:
          "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to seed Supabase.",
      },
      { status: 400 },
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const categories = CATEGORIES.map((c) => ({
    slug: c.slug,
    name: c.name,
    court: c.court,
    format: c.format,
    game_points: c.gamePoints,
    color: c.color,
  }));

  const players: { id: string; name: string; category_slug: string }[] = [];
  const teams: {
    id: string;
    category_slug: string;
    code: string;
    player1_id: string | null;
    player2_id: string | null;
  }[] = [];
  const matches: {
    id: string;
    category_slug: string;
    match_no: number;
    team_a: string;
    team_b: string;
    referee: string | null;
  }[] = [];

  for (const category of CATEGORIES) {
    for (const team of category.teams) {
      const p1 = team.players[0]
        ? playerId(category.slug, team.players[0])
        : null;
      const p2 = team.players[1]
        ? playerId(category.slug, team.players[1])
        : null;
      for (const name of team.players) {
        players.push({
          id: playerId(category.slug, name),
          name,
          category_slug: category.slug,
        });
      }
      teams.push({
        id: `${category.slug}:${team.code}`,
        category_slug: category.slug,
        code: team.code,
        player1_id: p1,
        player2_id: p2,
      });
    }
    for (const m of category.schedule) {
      matches.push({
        id: matchKey(category.slug, m.matchNo),
        category_slug: category.slug,
        match_no: m.matchNo,
        team_a: m.a,
        team_b: m.b,
        referee: m.ref ?? null,
      });
    }
  }

  await supabase.from("categories").upsert(categories, { onConflict: "slug" });
  await supabase.from("players").upsert(players, { onConflict: "id" });
  await supabase.from("teams").upsert(teams, { onConflict: "id" });
  // Preserve any live scores: only insert rows that don't already exist.
  await supabase
    .from("matches")
    .upsert(matches, { onConflict: "id", ignoreDuplicates: true });

  return Response.json({
    ok: true,
    seeded: {
      categories: categories.length,
      players: players.length,
      teams: teams.length,
      matches: matches.length,
    },
  });
}

export async function POST() {
  return seed();
}

export async function GET() {
  return seed();
}
