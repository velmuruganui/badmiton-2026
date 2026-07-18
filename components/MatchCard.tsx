"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { getTeam, matchKey } from "@/lib/tournament-data";
import { DEFAULT_MATCH_STATE } from "@/lib/scoring";
import { TeamLabel } from "./TeamLabel";
import type { Category, ScheduledMatch } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-surface-2 text-muted",
  live: "bg-red-500/20 text-red-300",
  done: "bg-brand/20 text-brand",
};

export function MatchCard({
  category,
  match,
}: {
  category: Category;
  match: ScheduledMatch;
}) {
  const { getMatch } = useStore();
  const state = getMatch(matchKey(category.slug, match.matchNo)) ?? DEFAULT_MATCH_STATE;
  const teamA = getTeam(category, match.a);
  const teamB = getTeam(category, match.b);
  const ref = match.ref ? getTeam(category, match.ref) : undefined;
  const showCode = category.format === "doubles";
  if (!teamA || !teamB) return null;

  const aWon = state.status === "done" && state.winner === match.a;
  const bWon = state.status === "done" && state.winner === match.b;

  return (
    <Link
      href={`/${category.slug}/match/${match.matchNo}`}
      className="card card-hover block p-4"
      style={{ ["--accent" as string]: category.color }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Match {match.matchNo}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${STATUS_STYLES[state.status]}`}
        >
          {state.status === "live" ? "Live" : state.status}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex-1 ${aWon ? "" : bWon ? "opacity-60" : ""}`}>
          <TeamLabel categorySlug={category.slug} team={teamA} showCode={showCode} size="sm" />
        </div>
        <div className="shrink-0 text-center">
          <div className="tabular text-xl font-bold">
            <span className={aWon ? "text-brand" : ""}>{state.scoreA}</span>
            <span className="mx-1 text-muted">:</span>
            <span className={bWon ? "text-brand" : ""}>{state.scoreB}</span>
          </div>
        </div>
        <div className={`flex-1 ${bWon ? "" : aWon ? "opacity-60" : ""}`}>
          <TeamLabel
            categorySlug={category.slug}
            team={teamB}
            showCode={showCode}
            size="sm"
            reverse
          />
        </div>
      </div>

      {ref && (
        <div className="mt-3 border-t border-line/60 pt-2 text-center text-xs text-muted">
          Referee:{" "}
          <span className="font-medium text-strong">
            {showCode ? `Team ${ref.code} · ` : ""}
            {ref.players.join(" & ")}
          </span>
        </div>
      )}
    </Link>
  );
}
