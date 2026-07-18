import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, getCategory } from "@/lib/tournament-data";
import { MatchCard } from "@/components/MatchCard";
import { StandingsTable } from "@/components/StandingsTable";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export default async function CategoryPage({
  params,
}: PageProps<"/[category]">) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

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
        <h2 className="mb-3 text-lg font-semibold">Standings</h2>
        <StandingsTable category={category} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Matches</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {category.schedule.map((match) => (
            <MatchCard key={match.matchNo} category={category} match={match} />
          ))}
        </div>
      </section>
    </div>
  );
}
