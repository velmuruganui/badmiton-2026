"use client";

import { useStore } from "@/lib/store";

/**
 * Compact live-connection indicator shown in the header. Only meaningful when
 * a Supabase backend is configured; in local mode there is nothing to sync so
 * the badge is hidden.
 */
export function ConnectionBadge() {
  const { backend, connection, saving } = useStore();

  if (backend !== "supabase") return null;

  const config = {
    live: { dot: "bg-emerald-400", label: "Live", title: "Connected — updates sync in real time" },
    connecting: {
      dot: "bg-amber-400 animate-pulse",
      label: "Connecting",
      title: "Reconnecting to the live scoreboard…",
    },
    offline: { dot: "bg-red-500", label: "Offline", title: "No network — changes won't be saved" },
    // `local` is filtered out above but keeps the map exhaustive.
    local: { dot: "bg-line", label: "Local", title: "Running locally" },
  }[connection];

  const label = saving && connection === "live" ? "Saving…" : config.label;

  return (
    <span
      title={config.title}
      aria-label={`Connection status: ${label}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-muted"
    >
      <span aria-hidden className={`h-2 w-2 rounded-full ${config.dot}`} />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}
