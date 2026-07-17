"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getSupabase, isSupabaseEnabled } from "./supabase";
import { DEFAULT_MATCH_STATE } from "./scoring";
import type { MatchState, ScoreMap } from "./types";

const SCORES_KEY = "badminton:scores";
const AVATARS_KEY = "badminton:avatars";

type AvatarMap = Record<string, string>;

interface StoreValue {
  ready: boolean;
  backend: "supabase" | "local";
  scores: ScoreMap;
  avatars: AvatarMap;
  getMatch: (key: string) => MatchState;
  updateMatch: (key: string, patch: Partial<MatchState>) => void;
  setAvatar: (playerId: string, url: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [scores, setScores] = useState<ScoreMap>({});
  const [avatars, setAvatars] = useState<AvatarMap>({});
  const backend = isSupabaseEnabled ? "supabase" : "local";

  // Keep latest scores in a ref so persistence closures stay current.
  const scoresRef = useRef(scores);
  useEffect(() => {
    scoresRef.current = scores;
  }, [scores]);

  // ---- Initial load + live subscription -------------------------------
  useEffect(() => {
    let active = true;

    if (backend === "local") {
      // One-time hydration from localStorage. Must happen after mount so the
      // server-rendered (empty) markup matches the first client render.
      try {
        const s = localStorage.getItem(SCORES_KEY);
        const a = localStorage.getItem(AVATARS_KEY);
        /* eslint-disable react-hooks/set-state-in-effect -- one-time post-mount hydration */
        if (s) setScores(JSON.parse(s));
        if (a) setAvatars(JSON.parse(a));
        /* eslint-enable react-hooks/set-state-in-effect */
      } catch {
        // ignore corrupted storage
      }
      setReady(true);

      const onStorage = (e: StorageEvent) => {
        if (e.key === SCORES_KEY && e.newValue) setScores(JSON.parse(e.newValue));
        if (e.key === AVATARS_KEY && e.newValue) setAvatars(JSON.parse(e.newValue));
      };
      window.addEventListener("storage", onStorage);
      return () => {
        active = false;
        window.removeEventListener("storage", onStorage);
      };
    }

    // Supabase-backed mode
    const supabase = getSupabase();
    if (!supabase) {
      setReady(true);
      return;
    }

    (async () => {
      const [{ data: matchRows }, { data: playerRows }] = await Promise.all([
        supabase.from("matches").select("*"),
        supabase.from("players").select("id, avatar_url"),
      ]);
      if (!active) return;
      if (matchRows) {
        const next: ScoreMap = {};
        for (const row of matchRows) {
          next[row.id] = {
            scoreA: row.score_a,
            scoreB: row.score_b,
            status: row.status,
            winner: row.winner,
          };
        }
        setScores(next);
      }
      if (playerRows) {
        const next: AvatarMap = {};
        for (const row of playerRows) {
          if (row.avatar_url) next[row.id] = row.avatar_url;
        }
        setAvatars(next);
      }
      setReady(true);
    })();

    const channel = supabase
      .channel("scoreboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        (payload) => {
          const row = payload.new as {
            id: string;
            score_a: number;
            score_b: number;
            status: MatchState["status"];
            winner: string | null;
          };
          if (!row?.id) return;
          setScores((prev) => ({
            ...prev,
            [row.id]: {
              scoreA: row.score_a,
              scoreB: row.score_b,
              status: row.status,
              winner: row.winner,
            },
          }));
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players" },
        (payload) => {
          const row = payload.new as { id: string; avatar_url: string | null };
          if (!row?.id) return;
          setAvatars((prev) => {
            const next = { ...prev };
            if (row.avatar_url) next[row.id] = row.avatar_url;
            else delete next[row.id];
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [backend]);

  const getMatch = useCallback(
    (key: string): MatchState => scores[key] ?? DEFAULT_MATCH_STATE,
    [scores],
  );

  const updateMatch = useCallback(
    (key: string, patch: Partial<MatchState>) => {
      const current = scoresRef.current[key] ?? DEFAULT_MATCH_STATE;
      const next: MatchState = { ...current, ...patch };
      setScores((prev) => ({ ...prev, [key]: next }));

      if (backend === "local") {
        const merged = { ...scoresRef.current, [key]: next };
        localStorage.setItem(SCORES_KEY, JSON.stringify(merged));
        return;
      }

      const supabase = getSupabase();
      if (!supabase) return;
      // Match rows are pre-seeded, so update the score in place (an upsert
      // would attempt an insert and trip the team_a/team_b not-null columns).
      supabase
        .from("matches")
        .update({
          score_a: next.scoreA,
          score_b: next.scoreB,
          status: next.status,
          winner: next.winner,
          updated_at: new Date().toISOString(),
        })
        .eq("id", key)
        .then(() => {});
    },
    [backend],
  );

  const setAvatar = useCallback(
    (playerId: string, url: string) => {
      setAvatars((prev) => {
        const next = { ...prev, [playerId]: url };
        if (backend === "local") {
          localStorage.setItem(AVATARS_KEY, JSON.stringify(next));
        }
        return next;
      });

      if (backend === "supabase") {
        const supabase = getSupabase();
        supabase
          ?.from("players")
          .update({ avatar_url: url })
          .eq("id", playerId)
          .then(() => {});
      }
    },
    [backend],
  );

  const value = useMemo<StoreValue>(
    () => ({ ready, backend, scores, avatars, getMatch, updateMatch, setAvatar }),
    [ready, backend, scores, avatars, getMatch, updateMatch, setAvatar],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
