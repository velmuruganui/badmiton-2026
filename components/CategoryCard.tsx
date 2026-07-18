"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { categoryProgress } from "@/lib/standings";
import type { Category } from "@/lib/types";

export function CategoryCard({ category }: { category: Category }) {
  const { scores } = useStore();
  const { done, total } = categoryProgress(category, scores);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const playerCount = new Set(category.teams.flatMap((t) => t.players)).size;

  return (
    <Link
      href={`/${category.slug}`}
      className="card card-hover block p-5"
      style={{ ["--accent" as string]: category.color }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{category.name}</h3>
          <p className="text-sm text-muted">
            {category.teams.length} {category.format === "singles" ? "players" : "teams"}
            {" · "}
            {playerCount} people
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ background: `${category.color}22`, color: category.color }}
          >
            {category.court}
          </span>
          {category.time && (
            <span className="text-xs text-muted">{category.time}</span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-muted">
          <span>
            {done}/{total} matches done
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: category.color }}
          />
        </div>
      </div>
    </Link>
  );
}
