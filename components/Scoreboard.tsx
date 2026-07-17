"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { useUmpire } from "@/lib/umpire";
import { getTeam, matchKey } from "@/lib/tournament-data";
import { DEFAULT_MATCH_STATE, deriveState } from "@/lib/scoring";
import { AvatarPair } from "./Avatar";
import type { Category, ScheduledMatch, Team } from "@/lib/types";

function ScorePanel({
  category,
  team,
  score,
  accent,
  isWinner,
  canEdit,
  done,
  onInc,
  onDec,
}: {
  category: Category;
  team: Team;
  score: number;
  accent: string;
  isWinner: boolean;
  canEdit: boolean;
  done: boolean;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div
      className="card flex flex-col items-center gap-4 p-6 text-center"
      style={{
        borderColor: isWinner ? accent : undefined,
        background: isWinner ? `${accent}14` : undefined,
      }}
    >
      <AvatarPair categorySlug={category.slug} names={team.players} size="lg" />
      <div>
        {category.format === "doubles" && (
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Team {team.code}
          </div>
        )}
        <div className="text-base font-semibold">{team.players.join(" & ")}</div>
      </div>

      <button
        type="button"
        disabled={!canEdit || done}
        onClick={onInc}
        className="tabular w-full rounded-2xl bg-surface-2 py-6 text-7xl font-black leading-none transition enabled:hover:bg-line disabled:cursor-default sm:text-8xl"
        style={{ color: isWinner ? accent : undefined }}
        aria-label={`Add point to ${team.players.join(" and ")}`}
      >
        {score}
      </button>

      {canEdit && (
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={onDec}
            disabled={score === 0}
            className="flex-1 rounded-lg border border-line py-2 text-lg font-semibold text-muted enabled:hover:text-white disabled:opacity-40"
          >
            −1
          </button>
          <button
            type="button"
            onClick={onInc}
            disabled={done}
            className="flex-1 rounded-lg py-2 text-lg font-semibold text-ink disabled:opacity-40"
            style={{ background: accent }}
          >
            +1
          </button>
        </div>
      )}
    </div>
  );
}

export function Scoreboard({
  category,
  match,
}: {
  category: Category;
  match: ScheduledMatch;
}) {
  const { getMatch, updateMatch } = useStore();
  const { isUmpire } = useUmpire();

  const key = matchKey(category.slug, match.matchNo);
  const state = getMatch(key) ?? DEFAULT_MATCH_STATE;
  const teamA = getTeam(category, match.a);
  const teamB = getTeam(category, match.b);
  const ref = match.ref ? getTeam(category, match.ref) : undefined;
  if (!teamA || !teamB) return null;

  const done = state.status === "done";

  function apply(scoreA: number, scoreB: number) {
    const derived = deriveState(
      scoreA,
      scoreB,
      category.gamePoints,
      match.a,
      match.b,
    );
    updateMatch(key, { scoreA, scoreB, ...derived });
  }

  const incA = () => apply(state.scoreA + 1, state.scoreB);
  const incB = () => apply(state.scoreA, state.scoreB + 1);
  const decA = () => apply(Math.max(0, state.scoreA - 1), state.scoreB);
  const decB = () => apply(state.scoreA, Math.max(0, state.scoreB - 1));
  const reset = () =>
    updateMatch(key, { scoreA: 0, scoreB: 0, status: "scheduled", winner: null });

  const winnerTeam = state.winner === match.a ? teamA : state.winner === match.b ? teamB : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href={`/${category.slug}`}
          className="text-sm text-muted hover:text-white"
        >
          ← {category.name}
        </Link>
        <span className="text-sm text-muted">
          Match {match.matchNo} · game to {category.gamePoints}
        </span>
      </div>

      {!isUmpire && (
        <div className="rounded-xl border border-line bg-surface-2/60 px-4 py-3 text-center text-sm text-muted">
          View only — enter the umpire PIN (top right) to keep score.
        </div>
      )}

      {done && winnerTeam && (
        <div
          className="rounded-xl px-4 py-3 text-center font-semibold"
          style={{ background: `${category.color}22`, color: category.color }}
        >
          🏆 {winnerTeam.players.join(" & ")} win {state.scoreA}–{state.scoreB}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <ScorePanel
          category={category}
          team={teamA}
          score={state.scoreA}
          accent={category.color}
          isWinner={state.winner === match.a}
          canEdit={isUmpire}
          done={done}
          onInc={incA}
          onDec={decA}
        />
        <ScorePanel
          category={category}
          team={teamB}
          score={state.scoreB}
          accent={category.color}
          isWinner={state.winner === match.b}
          canEdit={isUmpire}
          done={done}
          onInc={incB}
          onDec={decB}
        />
      </div>

      {ref && (
        <div className="text-center text-sm text-muted">
          Referee:{" "}
          <span className="font-medium text-white">
            {category.format === "doubles" ? `Team ${ref.code} · ` : ""}
            {ref.players.join(" & ")}
          </span>
        </div>
      )}

      {isUmpire && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:text-white"
          >
            Reset match
          </button>
        </div>
      )}
    </div>
  );
}
