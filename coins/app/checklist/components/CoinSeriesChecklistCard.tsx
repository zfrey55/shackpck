import { memo } from "react";
import {
  totalPacks,
  totalPieces,
  type CoinSeriesChecklist,
} from "@/lib/coin-series-checklist";
import { seriesFinalizedStatement } from "@/lib/repack-catalog";

/** ISO dates are stored and shown long-form. */
function formatIsoDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * One archived coin series (lib/coin-series-checklist). Exact published
 * contents, so it carries the finalized statement and no "contents may vary"
 * caveat. Pieces render as a qty table, never expanded per slot.
 */
export const CoinSeriesChecklistCard = memo(function CoinSeriesChecklistCard({
  series,
}: {
  series: CoinSeriesChecklist;
}) {
  const pieces = totalPieces(series);
  const packs = totalPacks(series);
  const unit = series.unitLabel;
  const title = series.subtitle ? `${series.title} ${series.subtitle}` : series.title;

  return (
    <div className="bg-slate-900/40 rounded-lg shadow-lg border border-slate-700 p-6">
      <div className="mb-4 pb-4 border-b border-slate-700">
        <h2 className="text-2xl font-bold text-gold mb-1">📦 {title}</h2>
        <p className="text-slate-300">{formatIsoDate(series.date)}</p>
      </div>

      <p className="mb-3 text-sm text-slate-400">
        {packs} sealed {unit}
        {packs === 1 ? "" : "s"}, {series.packSize} piece
        {series.packSize === 1 ? "" : "s"} per {unit}.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="py-2 pr-3 font-semibold">Piece</th>
              <th className="py-2 pr-3 font-semibold">Metal</th>
              <th className="py-2 pr-3 font-semibold">Weight</th>
              <th className="py-2 text-right font-semibold">Qty</th>
            </tr>
          </thead>
          <tbody>
            {series.pieces.map((piece) => (
              <tr key={piece.name} className="border-b border-slate-800/70">
                <td className="py-1.5 pr-3 text-slate-200">{piece.name}</td>
                <td className="py-1.5 pr-3">{piece.metal}</td>
                <td className="py-1.5 pr-3">{piece.weight}</td>
                <td className="py-1.5 text-right">{piece.qty}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold text-slate-200">
              <td className="pt-2 pr-3" colSpan={3}>Total</td>
              <td className="pt-2 text-right text-gold">{pieces}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mt-4 border-t border-slate-800 pt-3 text-sm leading-relaxed text-slate-400">
        {seriesFinalizedStatement(formatIsoDate(series.finalizedOn), unit)}
      </p>
    </div>
  );
});
