"use client";

import { AvatarPair } from "./Avatar";
import type { Team } from "@/lib/types";

export function TeamLabel({
  categorySlug,
  team,
  showCode = true,
  size = "md",
  reverse = false,
}: {
  categorySlug: string;
  team: Team;
  showCode?: boolean;
  size?: "sm" | "md" | "lg";
  reverse?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${reverse ? "flex-row-reverse text-right" : ""}`}
    >
      <AvatarPair categorySlug={categorySlug} names={team.players} size={size} />
      <div className={reverse ? "items-end" : ""}>
        {showCode && (
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
            Team {team.code}
          </span>
        )}
        <span className="block text-sm font-medium leading-tight">
          {team.players.join(" & ")}
        </span>
      </div>
    </div>
  );
}
