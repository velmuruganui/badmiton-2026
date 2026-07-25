import { resolveSideCode } from "./bracket";
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
    // Resolve knockout "W{n}" placeholders to the real team that advanced.
    // For round-robin, the code passes straight through.
    const codeA = resolveSideCode(category, m.a, scores);
    const codeB = resolveSideCode(category, m.b, scores);
    if (!codeA || !codeB) continue;
    const a = rows.get(codeA);
    const b = rows.get(codeB);
    if (!a || !b) continue;

    a.played++;
    b.played++;
    a.pointsFor += state.scoreA;
    a.pointsAgainst += state.scoreB;
    b.pointsFor += state.scoreB;
    b.pointsAgainst += state.scoreA;

    if (state.winner === codeA) {
      a.won++;
      b.lost++;
    } else if (state.winner === codeB) {
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

export interface PodiumRow {
  code: string;
  players: string[];
  won: number;
  lost: number;
}

export interface Podium {
  champion?: PodiumRow;
  runnerUp?: PodiumRow;
  /** True once the category is fully decided. */
  complete: boolean;
  /** True once any match has finished. */
  started: boolean;
}

/**
 * Champion / runner-up for any category — round-robin and knockout alike.
 *
 * Ranking rule (uniform across the tournament): most matches won first, ties
 * broken by point difference (points for − against), then total points scored.
 * Knockout brackets are ranked the same way; because a bracket champion wins
 * every match they play, this normally agrees with the Final result too.
 */
export function categoryPodium(category: Category, scores: ScoreMap): Podium {
  const rows = computeStandings(category, scores);
  const { done, total } = categoryProgress(category, scores);
  return {
    champion: rows[0],
    runnerUp: rows[1],
    complete: total > 0 && done === total,
    started: rows.some((r) => r.played > 0),
  };
}
