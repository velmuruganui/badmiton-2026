"use client";

import { useStore } from "@/lib/store";
import { playerId as makePlayerId } from "@/lib/tournament-data";

const COLORS = [
  "#ef4444", "#f59e0b", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZES = { sm: 32, md: 44, lg: 72, xl: 112 } as const;

export function Avatar({
  categorySlug,
  name,
  size = "md",
  className = "",
}: {
  categorySlug: string;
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { avatars } = useStore();
  const url = avatars[makePlayerId(categorySlug, name)];
  const px = SIZES[size];

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-line ${className}`}
      style={{ width: px, height: px, background: colorFor(name) }}
      title={name}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- user-uploaded/data URLs
        <img src={url} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span
          className="font-semibold text-white"
          style={{ fontSize: px * 0.36 }}
        >
          {initials(name)}
        </span>
      )}
    </span>
  );
}

/** Overlapping pair of avatars for a doubles team. */
export function AvatarPair({
  categorySlug,
  names,
  size = "md",
}: {
  categorySlug: string;
  names: string[];
  size?: keyof typeof SIZES;
}) {
  return (
    <span className="flex items-center">
      {names.map((n, i) => (
        <Avatar
          key={n}
          categorySlug={categorySlug}
          name={n}
          size={size}
          className={i > 0 ? "-ml-3" : ""}
        />
      ))}
    </span>
  );
}
