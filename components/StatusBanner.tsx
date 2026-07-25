"use client";

import { useStore } from "@/lib/store";

/**
 * Full-width banner that surfaces network problems the user would otherwise
 * never see: a failed initial load (with a Retry action) and writes that could
 * not be saved after retries.
 */
export function StatusBanner() {
  const { backend, loadState, connection, syncError, retryLoad, dismissSyncError } =
    useStore();

  if (backend !== "supabase") return null;

  if (loadState === "error") {
    return (
      <Bar tone="error">
        <span>Couldn&apos;t load the scoreboard. Check your connection.</span>
        <button
          type="button"
          onClick={retryLoad}
          className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25"
        >
          Retry
        </button>
      </Bar>
    );
  }

  if (connection === "offline") {
    return (
      <Bar tone="warn">
        <span>You&apos;re offline. Scores you enter won&apos;t be saved until you reconnect.</span>
      </Bar>
    );
  }

  if (syncError) {
    return (
      <Bar tone="error">
        <span>Some changes couldn&apos;t be saved. They may not appear on other devices.</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={retryLoad}
            className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25"
          >
            Refresh data
          </button>
          <button
            type="button"
            onClick={dismissSyncError}
            aria-label="Dismiss"
            className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold hover:bg-white/20"
          >
            ✕
          </button>
        </div>
      </Bar>
    );
  }

  return null;
}

function Bar({
  tone,
  children,
}: {
  tone: "error" | "warn";
  children: React.ReactNode;
}) {
  const bg = tone === "error" ? "bg-red-600" : "bg-amber-600";
  return (
    <div className={`${bg} text-white`}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2 text-sm sm:px-6">
        {children}
      </div>
    </div>
  );
}
