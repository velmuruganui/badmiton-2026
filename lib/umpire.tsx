"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

const UNLOCK_KEY = "badminton:umpire";
const PIN = process.env.NEXT_PUBLIC_UMPIRE_PIN || "2026";

interface UmpireValue {
  isUmpire: boolean;
  /** Try to unlock with a PIN. Returns true on success. */
  unlock: (pin: string) => boolean;
  lock: () => void;
}

const UmpireContext = createContext<UmpireValue | null>(null);

// Tiny external store so we read localStorage without setState-in-effect and
// with a correct server snapshot (avoids hydration mismatches).
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot() {
  return localStorage.getItem(UNLOCK_KEY) === "1";
}

function getServerSnapshot() {
  return false;
}

export function UmpireProvider({ children }: { children: React.ReactNode }) {
  const isUmpire = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const unlock = useCallback((pin: string) => {
    if (pin.trim() === PIN) {
      localStorage.setItem(UNLOCK_KEY, "1");
      emit();
      return true;
    }
    return false;
  }, []);

  const lock = useCallback(() => {
    localStorage.removeItem(UNLOCK_KEY);
    emit();
  }, []);

  const value = useMemo(
    () => ({ isUmpire, unlock, lock }),
    [isUmpire, unlock, lock],
  );

  return (
    <UmpireContext.Provider value={value}>{children}</UmpireContext.Provider>
  );
}

export function useUmpire(): UmpireValue {
  const ctx = useContext(UmpireContext);
  if (!ctx) throw new Error("useUmpire must be used within UmpireProvider");
  return ctx;
}
