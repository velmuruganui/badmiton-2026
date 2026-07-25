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

type LoadState = "loading" | "ready" | "error";

/**
 * High-level connection state used by the UI indicator.
 * - `local`: no backend configured, everything lives in this browser.
 * - `offline`: the device reports no network connection.
 * - `connecting`: online, but the realtime channel is not (yet) subscribed.
 * - `live`: online and subscribed to realtime updates.
 */
export type Connection = "local" | "offline" | "connecting" | "live";

interface StoreValue {
  ready: boolean;
  backend: "supabase" | "local";
  loadState: LoadState;
  connection: Connection;
  /** True while one or more writes are still being sent/retried. */
  saving: boolean;
  /** True when one or more score/avatar writes failed after retries. */
  syncError: boolean;
  scores: ScoreMap;
  avatars: AvatarMap;
  getMatch: (key: string) => MatchState;
  updateMatch: (key: string, patch: Partial<MatchState>) => void;
  setAvatar: (playerId: string, url: string) => void;
  /** Re-run the initial data load (used by the error banner's Retry). */
  retryLoad: () => void;
  /** Dismiss the "changes not saved" warning. */
  dismissSyncError: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

/**
 * Runs a Supabase write with a few retries and exponential backoff. Resolves
 * `true` on success, `false` if every attempt failed (network drop, timeout…).
 */
async function writeWithRetry(
  run: () => PromiseLike<{ error: unknown }>,
  attempts = 4,
): Promise<boolean> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const { error } = await run();
      if (!error) return true;
    } catch {
      // network/exception — fall through to retry
    }
    if (attempt < attempts - 1) {
      const delay = 400 * 2 ** attempt; // 400ms, 800ms, 1600ms
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return false;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const backend = isSupabaseEnabled ? "supabase" : "local";

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [scores, setScores] = useState<ScoreMap>({});
  const [avatars, setAvatars] = useState<AvatarMap>({});
  const [channelStatus, setChannelStatus] = useState<string>("");
  const [isOnline, setIsOnline] = useState(true);
  const [pendingWrites, setPendingWrites] = useState(0);
  const [syncError, setSyncError] = useState(false);

  // Keep latest scores in a ref so persistence closures stay current.
  const scoresRef = useRef(scores);
  useEffect(() => {
    scoresRef.current = scores;
  }, [scores]);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ---- Supabase data load (retryable) ---------------------------------
  const loadFromSupabase = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoadState("ready");
      return;
    }
    setLoadState("loading");
    try {
      const [matchRes, playerRes] = await Promise.all([
        supabase.from("matches").select("*"),
        supabase.from("players").select("id, avatar_url"),
      ]);
      if (!mountedRef.current) return;
      if (matchRes.error) throw matchRes.error;
      if (playerRes.error) throw playerRes.error;

      const nextScores: ScoreMap = {};
      for (const row of matchRes.data ?? []) {
        nextScores[row.id] = {
          scoreA: row.score_a,
          scoreB: row.score_b,
          status: row.status,
          winner: row.winner,
        };
      }
      setScores(nextScores);

      const nextAvatars: AvatarMap = {};
      for (const row of playerRes.data ?? []) {
        if (row.avatar_url) nextAvatars[row.id] = row.avatar_url;
      }
      setAvatars(nextAvatars);

      setLoadState("ready");
    } catch {
      if (!mountedRef.current) return;
      setLoadState("error");
    }
  }, []);

  // ---- Local hydration (offline / no-backend mode) --------------------
  useEffect(() => {
    if (backend !== "local") return;
    let active = true;
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
    setLoadState("ready");

    const onStorage = (e: StorageEvent) => {
      if (!active) return;
      if (e.key === SCORES_KEY && e.newValue) setScores(JSON.parse(e.newValue));
      if (e.key === AVATARS_KEY && e.newValue) setAvatars(JSON.parse(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      window.removeEventListener("storage", onStorage);
    };
  }, [backend]);

  // ---- Supabase initial load + realtime subscription ------------------
  useEffect(() => {
    if (backend !== "supabase") return;
    const supabase = getSupabase();
    if (!supabase) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect -- unreachable fallback when creds are absent */
      setLoadState("ready");
      return;
    }

    void loadFromSupabase();

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
      .subscribe((status) => {
        setChannelStatus(status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [backend, loadFromSupabase]);

  // ---- Online / offline tracking --------------------------------------
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- sync initial online status post-mount */
    setIsOnline(navigator.onLine);
    const onOnline = () => {
      setIsOnline(true);
      // Recover from a failed initial load once the network is back.
      if (backend === "supabase" && loadState === "error") {
        void loadFromSupabase();
      }
    };
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [backend, loadState, loadFromSupabase]);

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
      setPendingWrites((n) => n + 1);
      void writeWithRetry(() =>
        supabase
          .from("matches")
          .update({
            score_a: next.scoreA,
            score_b: next.scoreB,
            status: next.status,
            winner: next.winner,
            updated_at: new Date().toISOString(),
          })
          .eq("id", key),
      ).then((ok) => {
        if (!mountedRef.current) return;
        setPendingWrites((n) => Math.max(0, n - 1));
        if (!ok) setSyncError(true);
      });
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
        if (!supabase) return;
        setPendingWrites((n) => n + 1);
        void writeWithRetry(() =>
          supabase.from("players").update({ avatar_url: url }).eq("id", playerId),
        ).then((ok) => {
          if (!mountedRef.current) return;
          setPendingWrites((n) => Math.max(0, n - 1));
          if (!ok) setSyncError(true);
        });
      }
    },
    [backend],
  );

  const retryLoad = useCallback(() => {
    void loadFromSupabase();
  }, [loadFromSupabase]);

  const dismissSyncError = useCallback(() => setSyncError(false), []);

  const connection: Connection =
    backend === "local"
      ? "local"
      : !isOnline
        ? "offline"
        : channelStatus === "SUBSCRIBED"
          ? "live"
          : "connecting";

  const value = useMemo<StoreValue>(
    () => ({
      ready: loadState === "ready",
      backend,
      loadState,
      connection,
      saving: pendingWrites > 0,
      syncError,
      scores,
      avatars,
      getMatch,
      updateMatch,
      setAvatar,
      retryLoad,
      dismissSyncError,
    }),
    [
      loadState,
      backend,
      connection,
      pendingWrites,
      syncError,
      scores,
      avatars,
      getMatch,
      updateMatch,
      setAvatar,
      retryLoad,
      dismissSyncError,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
