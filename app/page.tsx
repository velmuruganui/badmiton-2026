import { CATEGORIES } from "@/lib/tournament-data";
import { CategoryCard } from "@/components/CategoryCard";

export default function HomePage() {
  const courts = Array.from(new Set(CATEGORIES.map((c) => c.court))).sort();

  return (
    <div className="space-y-8">
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-r from-brand/20 to-brand-2/10 p-6 sm:p-8">
          <h1 className="text-2xl font-bold sm:text-3xl">Tournament Scoreboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
            Live scores across all categories. Every game is played to{" "}
            <strong className="text-white">20 points</strong>. Pick a category to
            follow matches, keep score, and see the standings update in real time.
          </p>
        </div>
      </section>

      {courts.map((court) => (
        <section key={court}>
          <h2 className="mb-3 text-lg font-semibold text-muted">{court}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.filter((c) => c.court === court).map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
