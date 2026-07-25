"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase, isSupabaseEnabled } from "./supabase";

/**
 * Cooperative "one umpire edits at a time" lock, scoped to a single match.
 *
 * Every umpire viewing a match announces itself over a lightweight channel
 * (Supabase Realtime broadcast when a backend is configured, otherwise a
 * BroadcastChannel that coordinates browser tabs on the same device). The
 * editor with the earliest claim time holds the lock; everyone else sees the
 * controls disabled until the holder leaves or another umpire takes over.
 */

const HEARTBEAT_MS = 2000;
const STALE_MS = 6000;

interface Peer {
  claimTs: number;
  lastSeen: number;
}

type Msg = { id: string; claimTs: number; type: "ping" | "leave" };

interface Transport {
  send: (msg: Msg) => void;
  close: () => void;
}

function makeTransport(
  matchKey: string,
  onMsg: (m: Msg) => void,
  onReady: () => void,
): Transport {
  const name = `badminton:edit:${matchKey}`;

  if (isSupabaseEnabled) {
    const supabase = getSupabase();
    if (supabase) {
      const channel = supabase.channel(name, {
        config: { broadcast: { self: false } },
      });
      channel
        .on("broadcast", { event: "lock" }, (payload) => {
          onMsg(payload.payload as Msg);
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") onReady();
        });
      return {
        send: (msg) => {
          channel.send({ type: "broadcast", event: "lock", payload: msg });
        },
        close: () => {
          supabase.removeChannel(channel);
        },
      };
    }
  }

  if (typeof BroadcastChannel !== "undefined") {
    const bc = new BroadcastChannel(name);
    bc.onmessage = (e) => onMsg(e.data as Msg);
    // Ready on the next tick so the caller's effect has finished wiring up.
    setTimeout(onReady, 0);
    return {
      send: (msg) => bc.postMessage(msg),
      close: () => bc.close(),
    };
  }

  return { send: () => {}, close: () => {} };
}

export interface EditLock {
  /** Another umpire currently holds the edit lock for this match. */
  locked: boolean;
  /** This device currently holds the edit lock (or is the only editor). */
  heldByMe: boolean;
  /** Number of other umpires currently on this match. */
  others: number;
}

export function useMatchEditLock(matchKey: string, active: boolean): EditLock {
  const idRef = useRef<string>("");
  if (!idRef.current) {
    idRef.current = Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  const peersRef = useRef<Map<string, Peer>>(new Map());
  const claimTsRef = useRef<number>(0);
  const transportRef = useRef<Transport | null>(null);
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!active) {
      peersRef.current.clear();
      return;
    }

    const myId = idRef.current;
    claimTsRef.current = Date.now();
    peersRef.current.clear();

    const ping = () =>
      transportRef.current?.send({
        id: myId,
        claimTs: claimTsRef.current,
        type: "ping",
      });

    const transport = makeTransport(
      matchKey,
      (m) => {
        if (m.id === myId) return;
        if (m.type === "leave") {
          peersRef.current.delete(m.id);
        } else {
          peersRef.current.set(m.id, {
            claimTs: m.claimTs,
            lastSeen: Date.now(),
          });
          // Reply so a newly-arrived peer learns about us immediately.
          ping();
        }
        rerender();
      },
      ping,
    );
    transportRef.current = transport;

    const beat = setInterval(() => {
      const now = Date.now();
      let changed = false;
      for (const [id, p] of peersRef.current) {
        if (now - p.lastSeen > STALE_MS) {
          peersRef.current.delete(id);
          changed = true;
        }
      }
      ping();
      if (changed) rerender();
    }, HEARTBEAT_MS);

    return () => {
      clearInterval(beat);
      transport.send({ id: myId, claimTs: claimTsRef.current, type: "leave" });
      transport.close();
      transportRef.current = null;
      peersRef.current.clear();
    };
  }, [matchKey, active, rerender]);

  if (!active) {
    return { locked: false, heldByMe: false, others: 0 };
  }

  const myId = idRef.current;
  let holderId = myId;
  let holderClaim = claimTsRef.current;
  for (const [id, p] of peersRef.current) {
    if (
      p.claimTs < holderClaim ||
      (p.claimTs === holderClaim && id < holderId)
    ) {
      holderId = id;
      holderClaim = p.claimTs;
    }
  }

  const heldByMe = holderId === myId;
  return {
    locked: !heldByMe,
    heldByMe,
    others: peersRef.current.size,
  };
}
