import { notFound } from "next/navigation";
import { CATEGORIES, getCategory } from "@/lib/tournament-data";
import { Scoreboard } from "@/components/Scoreboard";

export function generateStaticParams() {
  return CATEGORIES.flatMap((c) =>
    c.schedule.map((m) => ({ category: c.slug, matchNo: String(m.matchNo) })),
  );
}

export default async function MatchPage({
  params,
}: PageProps<"/[category]/match/[matchNo]">) {
  const { category: slug, matchNo } = await params;
  const category = getCategory(slug);
  const match = category?.schedule.find((m) => m.matchNo === Number(matchNo));
  if (!category || !match) notFound();

  return <Scoreboard category={category} match={match} />;
}
