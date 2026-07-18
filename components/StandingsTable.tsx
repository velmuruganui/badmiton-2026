"use client";

import { useStore } from "@/lib/store";
import { computeStandings } from "@/lib/standings";
import type { Category } from "@/lib/types";

export function StandingsTable({ category }: { category: Category }) {
  const { scores } = useStore();
  const rows = computeStandings(category, scores);
  const showCode = category.format === "doubles";

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase text-muted">
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">{showCode ? "Team" : "Player"}</th>
            <th className="px-2 py-2 text-center font-medium">P</th>
            <th className="px-2 py-2 text-center font-medium">W</th>
            <th className="px-2 py-2 text-center font-medium">L</th>
            <th className="px-2 py-2 text-center font-medium" title="Points for / against">
              PF/PA
            </th>
            <th className="px-2 py-2 text-center font-medium" title="Point difference">
              Diff
            </th>
          </tr>
        </thead>
        <tbody className="tabular">
          {rows.map((r) => (
            <tr key={r.code} className="border-b border-line/50 last:border-0">
              <td className="px-3 py-2">
                <span
                  className={`inline-grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                    r.rank === 1 ? "bg-brand text-white" : "bg-surface-2 text-muted"
                  }`}
                >
                  {r.rank}
                </span>
              </td>
              <td className="px-3 py-2">
                <span className="font-medium">
                  {showCode && (
                    <span className="mr-1 text-muted">{r.code}</span>
                  )}
                  {r.players.join(" & ")}
                </span>
              </td>
              <td className="px-2 py-2 text-center">{r.played}</td>
              <td className="px-2 py-2 text-center font-semibold text-brand">{r.won}</td>
              <td className="px-2 py-2 text-center text-muted">{r.lost}</td>
              <td className="px-2 py-2 text-center text-muted">
                {r.pointsFor}/{r.pointsAgainst}
              </td>
              <td
                className={`px-2 py-2 text-center font-medium ${
                  r.diff > 0 ? "text-brand" : r.diff < 0 ? "text-red-400" : ""
                }`}
              >
                {r.diff > 0 ? "+" : ""}
                {r.diff}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
