"use client";

import { useStore } from "@/lib/store";
import { categoryPodium } from "@/lib/standings";
import { AvatarPair } from "./Avatar";
import type { Category } from "@/lib/types";

export function BracketSummary({ category }: { category: Category }) {
  const { scores } = useStore();
  const { champion, runnerUp, complete, started } = categoryPodium(category, scores);

  if (!started || !champion) {
    return (
      <div className="card p-5 text-center text-sm text-muted">
        Single-elimination bracket · {category.schedule.length} matches. The
        champion is whoever wins the final.
      </div>
    );
  }

  return (
    <div className="card space-y-3 p-5" style={{ ["--accent" as string]: category.color }}>
      {!complete && (
        <p className="text-center text-[11px] uppercase tracking-wide text-muted">
          Bracket in progress — showing the leader so far
        </p>
      )}
      <div
        className="flex items-center gap-3 rounded-xl p-3"
        style={{ background: "#f5b30114", border: "1px solid #f5b30133" }}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f5b30126] text-base" aria-hidden>
          🏆
        </span>
        <AvatarPair categorySlug={category.slug} names={champion.players} size="sm" />
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[#f5b301]">
            {complete ? "Champion" : "Leading"} · Team {champion.code}
          </span>
          <p className="truncate text-sm font-semibold leading-tight text-strong">
            {champion.players.join(" & ")}
          </p>
        </div>
        <span className="shrink-0 text-xs text-muted tabular">
          <span className="font-semibold text-brand">{champion.won}</span>W · {champion.lost}L
        </span>
      </div>
      {runnerUp && (
        <div
          className="flex items-center gap-3 rounded-xl p-3"
          style={{ background: "#c0c7cc14", border: "1px solid #c0c7cc33" }}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#c0c7cc26] text-base" aria-hidden>
            🥈
          </span>
          <AvatarPair categorySlug={category.slug} names={runnerUp.players} size="sm" />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-[#c0c7cc]">
              Runner-up · Team {runnerUp.code}
            </span>
            <p className="truncate text-sm font-semibold leading-tight text-strong">
              {runnerUp.players.join(" & ")}
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted tabular">
            <span className="font-semibold text-brand">{runnerUp.won}</span>W · {runnerUp.lost}L
          </span>
        </div>
      )}
    </div>
  );
}
