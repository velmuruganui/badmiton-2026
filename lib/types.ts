export type MatchFormat = "doubles" | "singles";

export type MatchStatus = "scheduled" | "live" | "done";

export interface Team {
  /** Short code shown in schedules/standings, e.g. "A" or a player's name. */
  code: string;
  /** One name for singles, two for doubles. */
  players: string[];
}

export interface ScheduledMatch {
  matchNo: number;
  /** Team code playing on side A. */
  a: string;
  /** Team code playing on side B. */
  b: string;
  /** Team code of the refereeing team, if any. */
  ref?: string;
}

export interface Category {
  slug: string;
  name: string;
  court: string;
  /** Scheduled time slot, e.g. "4:00–6:00 PM". */
  time?: string;
  format: MatchFormat;
  gamePoints: number;
  /** Accent color used across the UI for this category. */
  color: string;
  teams: Team[];
  schedule: ScheduledMatch[];
  /** Set when the schedule is inferred rather than taken from the source sheet. */
  note?: string;
}

/** Live/mutable state for a single match, persisted via the score backend. */
export interface MatchState {
  scoreA: number;
  scoreB: number;
  status: MatchStatus;
  /** Team code of the winner once decided. */
  winner: string | null;
}

/** Map keyed by `${categorySlug}-${matchNo}`. */
export type ScoreMap = Record<string, MatchState>;

export interface Player {
  id: string;
  name: string;
  categorySlug: string;
}
