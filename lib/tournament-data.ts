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
    time: "4:00–6:00 PM",
    format: "doubles",
    gamePoints: 20,
    color: "#ff3300",
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
    time: "4:00–6:00 PM",
    format: "doubles",
    gamePoints: 20,
    color: "#bff90b",
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
    slug: "mixed-men-women",
    name: "Mixed Men-Women",
    court: "Court 1",
    time: "6:00–7:00 PM",
    format: "doubles",
    gamePoints: 20,
    color: "#c084fc",
    teams: [
      { code: "A", players: ["Satheesh", "Prema"] },
      { code: "B", players: ["Velu", "Durga"] },
      { code: "C", players: ["Nagaraj", "Reena"] },
      { code: "D", players: ["Yuvaraj", "Anandhi"] },
      { code: "E", players: ["Vidya", "Lot (TBD)"] },
    ],
    // Sheet marks this KNOCKOUT with team E's partner drawn by lot on the day.
    // Represented here as a round-robin so every pair can be scored in-app.
    note: "Officially a knockout; team E's partner is drawn by lot. Shown as a round-robin until the draw is done.",
    schedule: [
      { matchNo: 1, a: "A", b: "B" },
      { matchNo: 2, a: "C", b: "D" },
      { matchNo: 3, a: "A", b: "C" },
      { matchNo: 4, a: "B", b: "D" },
      { matchNo: 5, a: "A", b: "D" },
      { matchNo: 6, a: "B", b: "C" },
      { matchNo: 7, a: "A", b: "E" },
      { matchNo: 8, a: "B", b: "E" },
      { matchNo: 9, a: "C", b: "E" },
      { matchNo: 10, a: "D", b: "E" },
    ],
  },
  {
    slug: "women",
    name: "Women Doubles",
    court: "Court 3",
    time: "4:00–4:40 PM",
    format: "doubles",
    gamePoints: 20,
    color: "#ff6fb5",
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
  {
    slug: "kids-u15",
    name: "Kids U15",
    court: "Court 3",
    time: "4:40–5:20 PM",
    format: "doubles",
    gamePoints: 20,
    color: "#2dd4bf",
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
    time: "5:20–6:00 PM",
    format: "singles",
    gamePoints: 20,
    color: "#5aa9ff",
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
