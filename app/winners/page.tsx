import { CATEGORIES } from "@/lib/tournament-data";
import { WinnersBoard } from "@/components/WinnersBoard";

export const metadata = {
  title: "Winners & Runners-up",
};

export default function WinnersPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Winners &amp; Runners-up</h1>
        <p className="mt-1 text-sm text-muted">
          Champions and runners-up for every category. Results update live as
          matches finish — a category is marked{" "}
          <strong className="text-strong">Final</strong> once all its matches
          are done.
        </p>
      </header>

      <WinnersBoard categories={CATEGORIES} />
    </div>
  );
}
