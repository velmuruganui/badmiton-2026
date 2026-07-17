"use client";

import { CATEGORIES } from "@/lib/tournament-data";
import { PhotoUpload } from "@/components/PhotoUpload";
import { useStore } from "@/lib/store";

export default function PlayersPage() {
  const { backend } = useStore();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Players</h1>
        <p className="mt-1 text-sm text-muted">
          Add a profile picture for everyone. Photos are shown on the dashboard,
          match cards and the live scoreboard.
          {backend === "local" && (
            <span className="ml-1 text-brand-2">
              (Saved on this device — connect Supabase to sync across devices.)
            </span>
          )}
        </p>
      </header>

      {CATEGORIES.map((category) => {
        const names = Array.from(
          new Set(category.teams.flatMap((t) => t.players)),
        );
        return (
          <section key={category.slug}>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: category.color }}
              />
              {category.name}
              <span className="text-sm font-normal text-muted">
                · {names.length} players
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {names.map((name) => (
                <div key={name} className="card p-3">
                  <PhotoUpload categorySlug={category.slug} name={name} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
