import { coinSeriesForCustomer } from "@/lib/coin-series-checklist";
import { CoinSeriesChecklistCard } from "./CoinSeriesChecklistCard";

/**
 * Archived coin series for one customer, newest first. Date-independent, so
 * callers render it above any date selection. Null when the customer has none.
 */
export function StaticCoinSeriesPanel({ slug }: { slug: string }) {
  const series = coinSeriesForCustomer(slug);
  if (series.length === 0) return null;

  return (
    <div className="space-y-6 mb-8">
      {series.map((s) => (
        <CoinSeriesChecklistCard key={s.id} series={s} />
      ))}
    </div>
  );
}
