"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useUmpire } from "@/lib/umpire";
import { useMatchEditLock } from "@/lib/edit-lock";
import { getTeam, matchKey } from "@/lib/tournament-data";
import { resolveSideCode, sidePlaceholderLabel } from "@/lib/bracket";
import { DEFAULT_MATCH_STATE, deriveState } from "@/lib/scoring";
import { readableOn } from "@/lib/color";
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
            className="flex-1 rounded-lg border border-line py-2 text-lg font-semibold text-muted enabled:hover:text-strong disabled:opacity-40"
          >
            −1
          </button>
          <button
            type="button"
            onClick={onInc}
            disabled={done}
            className="flex-1 rounded-lg py-2 text-lg font-semibold disabled:opacity-40"
            style={{ background: accent, color: readableOn(accent) }}
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
  const { getMatch, updateMatch, scores } = useStore();
  const { isUmpire } = useUmpire();

  const key = matchKey(category.slug, match.matchNo);
  // Only one umpire may edit a given match at a time.
  const { locked, heldByMe, others } = useMatchEditLock(key, isUmpire);
  const resetDialogRef = useRef<HTMLDialogElement>(null);
  const [resetPin, setResetPin] = useState("");
  const [resetError, setResetError] = useState(false);
  const state = getMatch(key) ?? DEFAULT_MATCH_STATE;
  const codeA = resolveSideCode(category, match.a, scores);
  const codeB = resolveSideCode(category, match.b, scores);
  const teamA = codeA ? getTeam(category, codeA) : undefined;
  const teamB = codeB ? getTeam(category, codeB) : undefined;
  const ref = match.ref ? getTeam(category, match.ref) : undefined;

  // Knockout side that hasn't been decided yet — nothing to score.
  if (!teamA || !teamB || !codeA || !codeB) {
    return (
      <div className="space-y-5">
        <Link
          href={`/${category.slug}`}
          className="text-sm text-muted hover:text-strong"
        >
          ← {category.name}
        </Link>
        <div className="card p-8 text-center text-muted">
          <p className="text-lg font-semibold text-strong">
            {match.stage ? `${match.stage} · ` : ""}Match {match.matchNo}
          </p>
          <p className="mt-2 text-sm">
            Waiting for {teamA ? sidePlaceholderLabel(match.b) : sidePlaceholderLabel(match.a)}
            {!teamA && !teamB ? " and both feeder matches" : ""} to finish before this match can be scored.
          </p>
        </div>
      </div>
    );
  }

  const done = state.status === "done";
  const canEdit = isUmpire && heldByMe;

  function apply(scoreA: number, scoreB: number) {
    const derived = deriveState(
      scoreA,
      scoreB,
      category.gamePoints,
      codeA!,
      codeB!,
    );
    updateMatch(key, { scoreA, scoreB, ...derived });
  }

  const incA = () => apply(state.scoreA + 1, state.scoreB);
  const incB = () => apply(state.scoreA, state.scoreB + 1);
  const decA = () => apply(Math.max(0, state.scoreA - 1), state.scoreB);
  const decB = () => apply(state.scoreA, Math.max(0, state.scoreB - 1));
  const reset = () =>
    updateMatch(key, { scoreA: 0, scoreB: 0, status: "scheduled", winner: null });

  const RESET_PIN = process.env.NEXT_PUBLIC_RESET_PIN || "0000";
  function openResetDialog() {
    setResetPin("");
    setResetError(false);
    resetDialogRef.current?.showModal();
  }
  function submitReset(e: React.FormEvent) {
    e.preventDefault();
    if (resetPin.trim() === RESET_PIN) {
      reset();
      resetDialogRef.current?.close();
    } else {
      setResetError(true);
    }
  }

  const winnerTeam = state.winner === codeA ? teamA : state.winner === codeB ? teamB : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href={`/${category.slug}`}
          className="text-sm text-muted hover:text-strong"
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

      {isUmpire && locked && (
        <div className="rounded-xl border border-brand-3/50 bg-brand-3/10 px-4 py-3 text-center text-sm text-strong">
          🔒 Another umpire is already scoring this match. Editing is locked.
        </div>
      )}

      {isUmpire && heldByMe && others > 0 && (
        <div className="rounded-xl border border-brand/40 bg-brand/10 px-4 py-2 text-center text-sm text-brand">
          You have edit control · {others} other umpire
          {others > 1 ? "s are" : " is"} viewing.
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
          isWinner={state.winner === codeA}
          canEdit={canEdit}
          done={done}
          onInc={incA}
          onDec={decA}
        />
        <ScorePanel
          category={category}
          team={teamB}
          score={state.scoreB}
          accent={category.color}
          isWinner={state.winner === codeB}
          canEdit={canEdit}
          done={done}
          onInc={incB}
          onDec={decB}
        />
      </div>

      {(ref || match.refName) && (
        <div className="text-center text-sm text-muted">
          Referee:{" "}
          <span className="font-medium text-strong">
            {ref
              ? `${category.format === "doubles" ? `Team ${ref.code} · ` : ""}${ref.players.join(" & ")}`
              : match.refName}
          </span>
        </div>
      )}

      {canEdit && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={openResetDialog}
            className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:text-strong"
          >
            Reset match
          </button>
        </div>
      )}

      <dialog
        ref={resetDialogRef}
        className="m-auto w-[90vw] max-w-sm rounded-2xl border border-line bg-surface p-0 text-strong backdrop:bg-black/60"
      >
        <form onSubmit={submitReset} className="p-5">
          <h2 className="text-lg font-semibold">Reset this match?</h2>
          <p className="mt-1 text-sm text-muted">
            This clears the score and status. Enter the reset PIN to confirm.
          </p>
          <input
            autoFocus
            type="password"
            inputMode="numeric"
            value={resetPin}
            onChange={(e) => {
              setResetPin(e.target.value);
              setResetError(false);
            }}
            placeholder="PIN"
            className={`mt-4 w-full rounded-lg border bg-surface-2 px-3 py-2 text-lg tabular outline-none ${
              resetError ? "border-red-500" : "border-line focus:border-brand"
            }`}
          />
          {resetError && (
            <p className="mt-2 text-sm text-red-400">Incorrect PIN, try again.</p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => resetDialogRef.current?.close()}
              className="rounded-lg px-4 py-2 text-sm text-muted hover:text-strong"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Reset match
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
