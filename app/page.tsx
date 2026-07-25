import { CATEGORIES } from "@/lib/tournament-data";
import { CategoryCard } from "@/components/CategoryCard";
import { LiveMatches } from "@/components/LiveMatches";

export default function HomePage() {
  const courts = Array.from(new Set(CATEGORIES.map((c) => c.court))).sort();

  return (
    <div className="space-y-6 sm:space-y-8">
      <LiveMatches />

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
