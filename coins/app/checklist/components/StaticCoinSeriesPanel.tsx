import { coinSeriesForCustomer, toCaseData } from "@/lib/coin-series-checklist";
import { CaseCard } from "./CaseCard";

/**
 * Archived coin series for one customer, rendered as ordinary CaseCards,
 * newest first. Only used where the live API failed and the merged index is
 * unavailable; everywhere else the archive arrives merged into the API data.
 * Null when the customer has none.
 */
export function StaticCoinSeriesPanel({ slug }: { slug: string }) {
  const series = coinSeriesForCustomer(slug);
  if (series.length === 0) return null;

  return (
    <div className="space-y-6 mb-8">
      {series.map((s) => (
        <CaseCard key={s.id} caseData={toCaseData(s)} seriesOrdinal={s.seriesNumber} />
      ))}
    </div>
  );
}
