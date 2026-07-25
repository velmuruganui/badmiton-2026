"use client";

import { useStore } from "@/lib/store";
import { categoryPodium, categoryProgress, type PodiumRow } from "@/lib/standings";
import { AvatarPair } from "./Avatar";
import type { Category } from "@/lib/types";

function Podium({
  category,
  row,
  place,
}: {
  category: Category;
  row: PodiumRow;
  place: "winner" | "runner";
}) {
  const isWinner = place === "winner";
  const accent = isWinner ? "#f5b301" : "#c0c7cc";

  return (
    <div
      className="flex items-center gap-3 rounded-xl p-3"
      style={{ background: `${accent}14`, border: `1px solid ${accent}33` }}
    >
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-base"
        style={{ background: `${accent}26` }}
        aria-hidden
      >
        {isWinner ? "🏆" : "🥈"}
      </span>
      <AvatarPair
        categorySlug={category.slug}
        names={row.players}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: accent }}
          >
            {isWinner ? "Champion" : "Runner-up"}
          </span>
          {category.format === "doubles" && (
            <span className="text-[10px] font-semibold text-muted">
              Team {row.code}
            </span>
          )}
        </div>
        <p className="truncate text-sm font-semibold leading-tight text-strong">
          {row.players.join(" & ")}
        </p>
      </div>
      <span className="shrink-0 text-right text-xs text-muted tabular">
        <span className="font-semibold text-brand">{row.won}</span>W ·{" "}
        {row.lost}L
      </span>
    </div>
  );
}

function CategoryResultCard({ category }: { category: Category }) {
  const { scores } = useStore();
  const { done, total } = categoryProgress(category, scores);
  const { champion: winner, runnerUp: runner, complete, started } =
    categoryPodium(category, scores);

  return (
    <div
      className="card overflow-hidden p-5"
      style={{ ["--accent" as string]: category.color }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ background: category.color }}
          />
          <h3 className="text-base font-semibold leading-tight">
            {category.name}
          </h3>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
          style={
            complete
              ? { background: `${category.color}22`, color: category.color }
              : { background: "var(--color-surface-2)", color: "var(--color-muted)" }
          }
        >
          {complete ? "Final" : started ? "Provisional" : "Not started"}
        </span>
      </div>

      {started ? (
        <div className="space-y-2.5">
          {winner && <Podium category={category} row={winner} place="winner" />}
          {runner && <Podium category={category} row={runner} place="runner" />}
        </div>
      ) : (
        <p className="rounded-xl bg-surface-2 px-3 py-6 text-center text-sm text-muted">
          Matches haven&apos;t started yet.
        </p>
      )}

      {started && !complete && (
        <p className="mt-3 text-center text-[11px] text-muted">
          {done}/{total} matches done — standings may change.
        </p>
      )}
    </div>
  );
}

export function WinnersBoard({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <CategoryResultCard key={category.slug} category={category} />
      ))}
    </div>
  );
}
