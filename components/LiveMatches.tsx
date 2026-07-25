"use client";

import { CATEGORIES, matchKey } from "@/lib/tournament-data";
import { useStore } from "@/lib/store";
import { MatchCard } from "./MatchCard";

export function LiveMatches() {
  const { scores } = useStore();
  const live = CATEGORIES.flatMap((category) =>
    category.schedule
      .filter(
        (m) => scores[matchKey(category.slug, m.matchNo)]?.status === "live",
      )
      .map((match) => ({ category, match })),
  );

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-muted">Live now</h2>
      {live.length === 0 ? (
        <p className="card p-5 text-sm text-muted">
          No matches in progress right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {live.map(({ category, match }) => (
            <div key={`${category.slug}-${match.matchNo}`}>
              <div className="mb-1.5 flex items-center gap-2 px-1 text-xs text-muted">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: category.color }}
                />
                <span className="font-semibold text-strong">
                  {category.court}
                </span>
                <span aria-hidden>·</span>
                <span className="truncate">{category.name}</span>
              </div>
              <MatchCard category={category} match={match} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
