"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { getTeam, matchKey } from "@/lib/tournament-data";
import { resolveSideCode, sidePlaceholderLabel } from "@/lib/bracket";
import { DEFAULT_MATCH_STATE } from "@/lib/scoring";
import { TeamLabel } from "./TeamLabel";
import type { Category, ScheduledMatch } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-surface-2 text-muted",
  live: "bg-red-500/20 text-red-300",
  done: "bg-brand/20 text-brand",
};

function PendingSide({ label, reverse }: { label: string; reverse?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${reverse ? "flex-row-reverse text-right" : ""}`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-muted">
        ?
      </span>
      <span className="text-sm font-medium leading-tight text-muted">{label}</span>
    </div>
  );
}

export function MatchCard({
  category,
  match,
}: {
  category: Category;
  match: ScheduledMatch;
}) {
  const { getMatch, scores } = useStore();
  const state = getMatch(matchKey(category.slug, match.matchNo)) ?? DEFAULT_MATCH_STATE;
  const codeA = resolveSideCode(category, match.a, scores);
  const codeB = resolveSideCode(category, match.b, scores);
  const teamA = codeA ? getTeam(category, codeA) : undefined;
  const teamB = codeB ? getTeam(category, codeB) : undefined;
  const ref = match.ref ? getTeam(category, match.ref) : undefined;
  const showCode = category.format === "doubles";

  const aWon = state.status === "done" && state.winner === codeA;
  const bWon = state.status === "done" && state.winner === codeB;

  return (
    <Link
      href={`/${category.slug}/match/${match.matchNo}`}
      className="card card-hover block p-4"
      style={{ ["--accent" as string]: category.color }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {match.stage ? `${match.stage} · ` : ""}Match {match.matchNo}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${STATUS_STYLES[state.status]} ${state.status === "live" ? "animate-pulse" : ""}`}
        >
          {state.status === "live" && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />
            </span>
          )}
          {state.status === "live" ? "Live" : state.status}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex-1 ${aWon ? "" : bWon ? "opacity-60" : ""}`}>
          {teamA ? (
            <TeamLabel categorySlug={category.slug} team={teamA} showCode={showCode} size="sm" />
          ) : (
            <PendingSide label={sidePlaceholderLabel(match.a)} />
          )}
        </div>
        <div className="shrink-0 text-center">
          <div className="tabular text-xl font-bold">
            <span className={aWon ? "text-brand" : ""}>{state.scoreA}</span>
            <span className="mx-1 text-muted">:</span>
            <span className={bWon ? "text-brand" : ""}>{state.scoreB}</span>
          </div>
        </div>
        <div className={`flex-1 ${bWon ? "" : aWon ? "opacity-60" : ""}`}>
          {teamB ? (
            <TeamLabel
              categorySlug={category.slug}
              team={teamB}
              showCode={showCode}
              size="sm"
              reverse
            />
          ) : (
            <PendingSide label={sidePlaceholderLabel(match.b)} reverse />
          )}
        </div>
      </div>

      {(ref || match.refName) && (
        <div className="mt-3 border-t border-line/60 pt-2 text-center text-xs text-muted">
          Referee:{" "}
          <span className="font-medium text-strong">
            {ref ? `${showCode ? `Team ${ref.code} · ` : ""}${ref.players.join(" & ")}` : match.refName}
          </span>
        </div>
      )}
    </Link>
  );
}
