import { matchKey } from "./tournament-data";
import type { Category, ScoreMap } from "./types";

export interface StandingRow {
  code: string;
  players: string[];
  played: number;
  won: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  diff: number;
  rank: number;
}

export function computeStandings(
  category: Category,
  scores: ScoreMap,
): StandingRow[] {
  const rows = new Map<string, StandingRow>();
  for (const team of category.teams) {
    rows.set(team.code, {
      code: team.code,
      players: team.players,
      played: 0,
      won: 0,
      lost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      diff: 0,
      rank: 0,
    });
  }

  for (const m of category.schedule) {
    const state = scores[matchKey(category.slug, m.matchNo)];
    if (!state || state.status !== "done") continue;
    const a = rows.get(m.a);
    const b = rows.get(m.b);
    if (!a || !b) continue;

    a.played++;
    b.played++;
    a.pointsFor += state.scoreA;
    a.pointsAgainst += state.scoreB;
    b.pointsFor += state.scoreB;
    b.pointsAgainst += state.scoreA;

    if (state.winner === m.a) {
      a.won++;
      b.lost++;
    } else if (state.winner === m.b) {
      b.won++;
      a.lost++;
    }
  }

  const list = [...rows.values()];
  for (const r of list) r.diff = r.pointsFor - r.pointsAgainst;
  list.sort((x, y) => y.won - x.won || y.diff - x.diff || y.pointsFor - x.pointsFor);
  list.forEach((r, i) => (r.rank = i + 1));
  return list;
}

export function categoryProgress(category: Category, scores: ScoreMap) {
  const total = category.schedule.length;
  let done = 0;
  for (const m of category.schedule) {
    if (scores[matchKey(category.slug, m.matchNo)]?.status === "done") done++;
  }
  return { done, total };
}
