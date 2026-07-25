import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, getCategory } from "@/lib/tournament-data";
import { isKnockout } from "@/lib/bracket";
import { MatchCard } from "@/components/MatchCard";
import { StandingsTable } from "@/components/StandingsTable";
import { BracketSummary } from "@/components/BracketSummary";
import type { ScheduledMatch } from "@/lib/types";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export default async function CategoryPage({
  params,
}: PageProps<"/[category]">) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const knockout = isKnockout(category);

  // Group matches by bracket stage (knockout) or a single flat group otherwise.
  const groups: { label: string | null; matches: ScheduledMatch[] }[] = [];
  for (const match of category.schedule) {
    const label = knockout ? match.stage ?? "Matches" : null;
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.matches.push(match);
    else groups.push({ label, matches: [match] });
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="text-sm text-muted hover:text-strong">
          ← All categories
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span
            className="h-4 w-4 rounded-full"
            style={{ background: category.color }}
          />
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
            {category.court}
            {category.time ? ` · ${category.time}` : ""} · game to{" "}
            {category.gamePoints}
          </span>
        </div>
        {category.note && (
          <p className="mt-2 text-sm text-note">Note: {category.note}</p>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          {knockout ? "Bracket" : "Standings"}
        </h2>
        {knockout ? (
          <BracketSummary category={category} />
        ) : (
          <StandingsTable category={category} />
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold">Matches</h2>
        {groups.map((group, i) => (
          <div key={group.label ?? i} className="space-y-3">
            {group.label && (
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                {group.label}
              </h3>
            )}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {group.matches.map((match) => (
                <MatchCard key={match.matchNo} category={category} match={match} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
