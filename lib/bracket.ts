import { getTeam, matchKey } from "./tournament-data";
import type { Category, ScheduledMatch, ScoreMap } from "./types";

/** Winner placeholder token, e.g. "W3" = "winner of match 3". */
const WINNER_TOKEN = /^W(\d+)$/;

export function isKnockout(category: Category): boolean {
  return category.kind === "knockout";
}

/** Match number a placeholder feeds from, or null for a real team code. */
export function feederMatchNo(code: string): number | null {
  const m = WINNER_TOKEN.exec(code);
  return m ? Number(m[1]) : null;
}

/**
 * Resolve a side code to a concrete team code. Real codes pass through; winner
 * placeholders resolve to the winner of the feeding match once it is decided,
 * or `null` while that match is still pending.
 */
export function resolveSideCode(
  category: Category,
  code: string,
  scores: ScoreMap,
): string | null {
  const feeder = feederMatchNo(code);
  if (feeder == null) return code;
  const state = scores[matchKey(category.slug, feeder)];
  if (!state || state.status !== "done" || !state.winner) return null;
  return state.winner;
}

/** Human label for an unresolved side, e.g. "Winner of Match 3". */
export function sidePlaceholderLabel(code: string): string {
  const feeder = feederMatchNo(code);
  return feeder != null ? `Winner of Match ${feeder}` : code;
}

/** The deciding match: the one tagged "Final", else the last in the schedule. */
export function finalMatch(category: Category): ScheduledMatch | undefined {
  return (
    category.schedule.find((m) => m.stage?.toLowerCase() === "final") ??
    category.schedule[category.schedule.length - 1]
  );
}

export interface BracketRecord {
  code: string;
  players: string[];
  won: number;
  lost: number;
}

export interface BracketResult {
  champion?: BracketRecord;
  runnerUp?: BracketRecord;
  /** True once the final has been played. */
  complete: boolean;
  /** True once any match has finished. */
  started: boolean;
}

function record(category: Category, code: string): BracketRecord {
  const team = getTeam(category, code);
  return { code, players: team?.players ?? [code], won: 0, lost: 0 };
}

/** Champion / runner-up for a knockout category, derived from the bracket. */
export function knockoutResult(
  category: Category,
  scores: ScoreMap,
): BracketResult {
  const records = new Map<string, BracketRecord>();
  const bump = (code: string, key: "won" | "lost") => {
    const row = records.get(code) ?? record(category, code);
    row[key]++;
    records.set(code, row);
  };

  let started = false;
  for (const m of category.schedule) {
    const state = scores[matchKey(category.slug, m.matchNo)];
    if (!state || state.status !== "done" || !state.winner) continue;
    started = true;
    const a = resolveSideCode(category, m.a, scores);
    const b = resolveSideCode(category, m.b, scores);
    if (!a || !b) continue;
    const loser = state.winner === a ? b : a;
    bump(state.winner, "won");
    bump(loser, "lost");
  }

  const decider = finalMatch(category);
  const finalState = decider
    ? scores[matchKey(category.slug, decider.matchNo)]
    : undefined;
  const complete =
    !!finalState && finalState.status === "done" && !!finalState.winner;

  let champion: BracketRecord | undefined;
  let runnerUp: BracketRecord | undefined;
  if (complete && decider && finalState?.winner) {
    const a = resolveSideCode(category, decider.a, scores);
    const b = resolveSideCode(category, decider.b, scores);
    const loser = finalState.winner === a ? b : a;
    champion = records.get(finalState.winner) ?? record(category, finalState.winner);
    if (loser) runnerUp = records.get(loser) ?? record(category, loser);
  }

  return { champion, runnerUp, complete, started };
}
