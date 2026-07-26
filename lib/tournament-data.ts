import type { Category, Player, ScheduledMatch } from "./types";

/**
 * Single source of truth for the 2026 tournament, transcribed from the
 * organiser's final match charts (July 26 tournament match charts).
 */

// Shuttle Mafia — 6-team round-robin, 15 matches, each with a refereeing team.
const SHUTTLE_MAFIA_SCHEDULE: ScheduledMatch[] = [
  { matchNo: 1, a: "A", b: "F", ref: "C" },
  { matchNo: 2, a: "B", b: "E", ref: "F" },
  { matchNo: 3, a: "C", b: "D", ref: "B" },
  { matchNo: 4, a: "A", b: "E", ref: "C" },
  { matchNo: 5, a: "F", b: "D", ref: "A" },
  { matchNo: 6, a: "B", b: "C", ref: "E" },
  { matchNo: 7, a: "A", b: "D", ref: "B" },
  { matchNo: 8, a: "E", b: "C", ref: "D" },
  { matchNo: 9, a: "F", b: "B", ref: "E" },
  { matchNo: 10, a: "A", b: "C", ref: "F" },
  { matchNo: 11, a: "D", b: "B", ref: "A" },
  { matchNo: 12, a: "E", b: "F", ref: "C" },
  { matchNo: 13, a: "A", b: "B", ref: "E" },
  { matchNo: 14, a: "C", b: "F", ref: "A" },
  { matchNo: 15, a: "D", b: "E", ref: "B" },
];

export const CATEGORIES: Category[] = [
  {
    slug: "shuttle-mafia",
    name: "Shuttle Mafia",
    court: "Court 1",
    time: "4:00–6:30 PM",
    format: "doubles",
    kind: "round-robin",
    gamePoints: 21,
    color: "#ff3300",
    teams: [
      { code: "A", players: ["Doctor", "Abhijith"] },
      { code: "B", players: ["Satheesh", "Harsha"] },
      { code: "C", players: ["Santhosh", "Yuvaraj"] },
      { code: "D", players: ["Velu", "Gnanavel"] },
      { code: "E", players: ["Jay", "Sanjay"] },
      { code: "F", players: ["Subhash", "Saravanan"] },
    ],
    schedule: SHUTTLE_MAFIA_SCHEDULE,
  },
  {
    slug: "racket-raja",
    name: "Racket Raja",
    court: "Court 2",
    time: "4:00–6:00 PM",
    format: "doubles",
    kind: "round-robin",
    gamePoints: 21,
    color: "#bff90b",
    teams: [
      { code: "A", players: ["Nagaraj", "Abdul"] },
      { code: "B", players: ["Jk", "Sabari"] },
      { code: "C", players: ["Raja", "Rajesh"] },
      { code: "D", players: ["Siva", "Karthi"] },
    ],
    // 4-team round-robin, 6 matches. Referees are named individuals.
    schedule: [
      { matchNo: 1, a: "A", b: "D", refName: "Raja" },
      { matchNo: 2, a: "B", b: "C", refName: "Abdul" },
      { matchNo: 3, a: "A", b: "C", refName: "Siva" },
      { matchNo: 4, a: "B", b: "D", refName: "Rajesh" },
      { matchNo: 5, a: "A", b: "B", refName: "Karthi" },
      { matchNo: 6, a: "C", b: "D", refName: "Saravanan" },
    ],
  },
  {
    slug: "mixed-men-women",
    name: "Mixed Men-Women",
    court: "Court 1",
    time: "6:30–7:15 PM",
    format: "doubles",
    kind: "knockout",
    gamePoints: 21,
    color: "#c084fc",
    teams: [
      { code: "A", players: ["Satheesh", "Prema"] },
      { code: "B", players: ["Velu", "Durga"] },
      { code: "C", players: ["Swapanthi", "Harsha"] },
      { code: "D", players: ["Yuvaraj", "Anandhi"] },
      { code: "E", players: ["Nagaraj", "Reena"] },
    ],
    // Knockout bracket: 5 teams, "W{n}" feeds from the winner of match n.
    schedule: [
      { matchNo: 1, a: "D", b: "E", stage: "Qualifier" },
      { matchNo: 2, a: "A", b: "W1", stage: "Semi-final" },
      { matchNo: 3, a: "B", b: "C", stage: "Semi-final" },
      { matchNo: 4, a: "W2", b: "W3", stage: "Final" },
    ],
  },
  {
    slug: "kids-men-mixed",
    name: "Kids-Men Mixed Doubles",
    court: "Court 1",
    time: "7:15–8:00 PM",
    format: "doubles",
    kind: "knockout",
    gamePoints: 21,
    color: "#fb923c",
    teams: [
      { code: "A", players: ["Easan", "Siva"] },
      { code: "B", players: ["Dharun", "Karthi"] },
      { code: "C", players: ["Sharwesh Sathish", "Rajesh"] },
      { code: "D", players: ["Sharwesh", "Raja"] },
      { code: "E", players: ["Jack", "JK"] },
      { code: "F", players: ["Roshne", "Santhosh"] },
      { code: "G", players: ["Diya", "Abhijith"] },
      { code: "H", players: ["Isai", "Subhash"] },
      { code: "I", players: ["Anandhi", "Doctor"] },
      { code: "J", players: ["Swastika", "Sanjay"] },
    ],
    // 10-team knockout, 9 matches. A kid partners a man in each pair.
    note: "One kid + one adult per pair. Lot-based draw; a few players sit out as they already played two categories.",
    schedule: [
      { matchNo: 1, a: "D", b: "E", stage: "Round 1" },
      { matchNo: 2, a: "A", b: "W1", stage: "Quarter-final" },
      { matchNo: 3, a: "B", b: "C", stage: "Quarter-final" },
      { matchNo: 4, a: "W2", b: "W3", stage: "Semi-final" },
      { matchNo: 5, a: "I", b: "J", stage: "Round 1" },
      { matchNo: 6, a: "F", b: "W5", stage: "Quarter-final" },
      { matchNo: 7, a: "G", b: "H", stage: "Quarter-final" },
      { matchNo: 8, a: "W6", b: "W7", stage: "Semi-final" },
      { matchNo: 9, a: "W4", b: "W8", stage: "Final" },
    ],
  },
  {
    slug: "women",
    name: "Women Doubles",
    court: "Court 3",
    time: "4:00–4:40 PM",
    format: "doubles",
    kind: "round-robin",
    gamePoints: 21,
    color: "#ff6fb5",
    teams: [
      { code: "A", players: ["Prema", "Durga"] },
      { code: "B", players: ["Reena", "Swapanthi"] },
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
    name: "Kids Seniors (U15)",
    court: "Court 3",
    time: "4:40–5:20 PM",
    format: "doubles",
    kind: "round-robin",
    gamePoints: 21,
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
    name: "Kids Juniors (U11)",
    court: "Court 3",
    time: "5:20–6:00 PM",
    format: "doubles",
    kind: "round-robin",
    gamePoints: 21,
    color: "#5aa9ff",
    teams: [
      { code: "A", players: ["Diya", "Roshne"] },
      { code: "B", players: ["Isai", "Swastika"] },
    ],
    // Two teams, best of 3 — whoever wins 2 of the 3 games takes it.
    note: "Best of 3 games — first pair to win 2 games is the winner.",
    schedule: [
      { matchNo: 1, a: "A", b: "B" },
      { matchNo: 2, a: "A", b: "B" },
      { matchNo: 3, a: "A", b: "B" },
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
