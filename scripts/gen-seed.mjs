import { CATEGORIES, matchKey, playerId } from "../lib/tournament-data.ts";

const esc = (s) => String(s).replace(/'/g, "''");
const out = [];

const cats = CATEGORIES.map(
  (c) =>
    `('${c.slug}','${esc(c.name)}','${c.court}','${c.format}',${c.gamePoints},'${c.color}')`,
).join(",\n");
out.push(
  `insert into categories (slug,name,court,format,game_points,color) values\n${cats}\non conflict (slug) do update set name=excluded.name,court=excluded.court,format=excluded.format,game_points=excluded.game_points,color=excluded.color;`,
);

const players = [];
for (const c of CATEGORIES) {
  const seen = new Set();
  for (const t of c.teams) {
    for (const n of t.players) {
      const id = playerId(c.slug, n);
      if (seen.has(id)) continue;
      seen.add(id);
      players.push(`('${esc(id)}','${esc(n)}','${c.slug}')`);
    }
  }
}
out.push(
  `insert into players (id,name,category_slug) values\n${players.join(",\n")}\non conflict (id) do nothing;`,
);

const teams = [];
for (const c of CATEGORIES) {
  for (const t of c.teams) {
    const p1 = t.players[0] ? `'${esc(playerId(c.slug, t.players[0]))}'` : "null";
    const p2 = t.players[1] ? `'${esc(playerId(c.slug, t.players[1]))}'` : "null";
    teams.push(`('${c.slug}:${esc(t.code)}','${c.slug}','${esc(t.code)}',${p1},${p2})`);
  }
}
out.push(
  `insert into teams (id,category_slug,code,player1_id,player2_id) values\n${teams.join(",\n")}\non conflict (id) do nothing;`,
);

const matches = [];
for (const c of CATEGORIES) {
  for (const m of c.schedule) {
    const ref = m.ref ? `'${esc(m.ref)}'` : "null";
    matches.push(
      `('${matchKey(c.slug, m.matchNo)}','${c.slug}',${m.matchNo},'${esc(m.a)}','${esc(m.b)}',${ref})`,
    );
  }
}
out.push(
  `insert into matches (id,category_slug,match_no,team_a,team_b,referee) values\n${matches.join(",\n")}\non conflict (id) do nothing;`,
);

console.log(out.join("\n\n"));
