export type MatchFormat = "doubles" | "singles";

export type MatchStatus = "scheduled" | "live" | "done";

/** How the winner of a category is decided. */
export type CategoryKind = "round-robin" | "knockout";

export interface Team {
  /** Short code shown in schedules/standings, e.g. "A" or a player's name. */
  code: string;
  /** One name for singles, two for doubles. */
  players: string[];
}

export interface ScheduledMatch {
  matchNo: number;
  /**
   * Side A. Either a real team code (e.g. "A") or, in a knockout, a winner
   * placeholder like "W3" meaning "the winner of match 3".
   */
  a: string;
  /** Side B. Same rules as {@link ScheduledMatch.a}. */
  b: string;
  /** Team code of the refereeing team, if any. */
  ref?: string;
  /** Named individual referee, when the sheet lists a person rather than a team. */
  refName?: string;
  /** Bracket round label for knockouts, e.g. "Semi-final" or "Final". */
  stage?: string;
}

export interface Category {
  slug: string;
  name: string;
  court: string;
  /** Scheduled time slot, e.g. "4:00–6:00 PM". */
  time?: string;
  format: MatchFormat;
  /** Round-robin (standings) or knockout (bracket). Defaults to round-robin. */
  kind?: CategoryKind;
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
