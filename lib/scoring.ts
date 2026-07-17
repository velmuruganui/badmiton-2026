import type { MatchState } from "./types";

export const DEFAULT_MATCH_STATE: MatchState = {
  scoreA: 0,
  scoreB: 0,
  status: "scheduled",
  winner: null,
};

/**
 * Simple "first to N points" rule (game to 20 by default, no deuce).
 * Returns the winning side, or null if the game is still in progress.
 */
export function decideWinner(
  scoreA: number,
  scoreB: number,
  gamePoints: number,
): "A" | "B" | null {
  if (scoreA >= gamePoints && scoreA > scoreB) return "A";
  if (scoreB >= gamePoints && scoreB > scoreA) return "B";
  return null;
}

/** Derive status + winner code from raw scores for a scheduled match. */
export function deriveState(
  scoreA: number,
  scoreB: number,
  gamePoints: number,
  teamA: string,
  teamB: string,
): Pick<MatchState, "status" | "winner"> {
  const side = decideWinner(scoreA, scoreB, gamePoints);
  if (side) {
    return { status: "done", winner: side === "A" ? teamA : teamB };
  }
  if (scoreA > 0 || scoreB > 0) return { status: "live", winner: null };
  return { status: "scheduled", winner: null };
}
