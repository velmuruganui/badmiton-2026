import type { Category, Player, ScheduledMatch } from "./types";

/**
 * Single source of truth for the 2026 tournament, transcribed from the
 * organiser's spreadsheet (see the attached score sheets).
 */

// The 5-team round-robin order + refereeing team shared by both men's courts.
const MENS_SCHEDULE: ScheduledMatch[] = [
  { matchNo: 1, a: "A", b: "B", ref: "E" },
  { matchNo: 2, a: "C", b: "D", ref: "B" },
  { matchNo: 3, a: "E", b: "A", ref: "D" },
  { matchNo: 4, a: "B", b: "C", ref: "A" },
  { matchNo: 5, a: "D", b: "E", ref: "B" },
  { matchNo: 6, a: "A", b: "C", ref: "D" },
  { matchNo: 7, a: "B", b: "E", ref: "C" },
  { matchNo: 8, a: "A", b: "D", ref: "B" },
  { matchNo: 9, a: "C", b: "E", ref: "A" },
  { matchNo: 10, a: "B", b: "D", ref: "C" },
];

export const CATEGORIES: Category[] = [
  {
    slug: "shuttle-mafia",
    name: "Shuttle Mafia",
    court: "Court 1",
    format: "doubles",
    gamePoints: 20,
    color: "#f59e0b",
    teams: [
      { code: "A", players: ["Doctor", "Abhijith"] },
      { code: "B", players: ["Satheesh", "Harsha"] },
      { code: "C", players: ["Santhosh", "Yuvaraj"] },
      { code: "D", players: ["Velu", "Gnanavel"] },
      { code: "E", players: ["Subhash", "Saravanan"] },
    ],
    schedule: MENS_SCHEDULE,
  },
  {
    slug: "racket-raja",
    name: "Racket Raja",
    court: "Court 2",
    format: "doubles",
    gamePoints: 20,
    color: "#22c55e",
    teams: [
      { code: "A", players: ["Nagaraj", "Abdul"] },
      { code: "B", players: ["Jk", "Sabari"] },
      { code: "C", players: ["Raja", "Rajesh"] },
      { code: "D", players: ["Siva", "Karthi"] },
      { code: "E", players: ["Sanjay", "Jay"] },
    ],
    schedule: MENS_SCHEDULE,
  },
  {
    slug: "kids-u15",
    name: "Kids U15",
    court: "Court 3",
    format: "doubles",
    gamePoints: 20,
    color: "#a855f7",
    teams: [
      { code: "A", players: ["Gnanavel", "Sharwesh"] },
      { code: "B", players: ["Easan", "Jack"] },
      { code: "C", players: ["Sharwesh Sathish", "Dharun"] },
      { code: "D", players: ["Sanchana", "Sreesha"] },
    ],
    // 4-team round-robin: each team plays 3 matches, 1 point per win.
    schedule: [
      { matchNo: 1, a: "A", b: "B" },
      { matchNo: 2, a: "C", b: "D" },
      { matchNo: 3, a: "A", b: "C" },
      { matchNo: 4, a: "B", b: "D" },
      { matchNo: 5, a: "A", b: "D" },
      { matchNo: 6, a: "B", b: "C" },
    ],
  },
  {
    slug: "kids-u11",
    name: "Kids U11",
    court: "Court 3",
    format: "singles",
    gamePoints: 20,
    color: "#38bdf8",
    teams: [
      { code: "Diya", players: ["Diya"] },
      { code: "Roshne", players: ["Roshne"] },
      { code: "Isai", players: ["Isai"] },
    ],
    schedule: [
      { matchNo: 1, a: "Diya", b: "Roshne", ref: "Isai" },
      { matchNo: 2, a: "Roshne", b: "Isai", ref: "Diya" },
      { matchNo: 3, a: "Isai", b: "Diya", ref: "Roshne" },
    ],
  },
  {
    slug: "women",
    name: "Women Doubles",
    court: "Court 3",
    format: "doubles",
    gamePoints: 20,
    color: "#ec4899",
    teams: [
      { code: "A", players: ["Prema", "Durga"] },
      { code: "B", players: ["Reena", "Vidya"] },
      { code: "C", players: ["Sanchana", "Sreesha"] },
    ],
    // 3-team round-robin: each team plays 2 matches, 1 point per win.
    schedule: [
      { matchNo: 1, a: "A", b: "B" },
      { matchNo: 2, a: "B", b: "C" },
      { matchNo: 3, a: "C", b: "A" },
    ],
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getTeam(category: Category, code: string) {
  return category.teams.find((t) => t.code === code);
}

export function matchKey(categorySlug: string, matchNo: number): string {
  return `${categorySlug}-${matchNo}`;
}

/** Stable id for a player within a category (names are unique per category). */
export function playerId(categorySlug: string, name: string): string {
  return `${categorySlug}:${name}`;
}

/** Every player across all categories (one row per person per category). */
export function allPlayers(): Player[] {
  const players: Player[] = [];
  const seen = new Set<string>();
  for (const category of CATEGORIES) {
    for (const team of category.teams) {
      for (const name of team.players) {
        const id = playerId(category.slug, name);
        if (seen.has(id)) continue;
        seen.add(id);
        players.push({ id, name, categorySlug: category.slug });
      }
    }
  }
  return players;
}
