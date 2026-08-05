import { memo } from "react";
import type { CaseData } from "../types";
import {
  getChecklistCaseLongDescription,
  getChecklistCaseShortLabel,
} from "@/lib/checklist-case-labels";

interface CaseCardProps {
  caseData: CaseData;
  /**
   * Fallback 1-based index among series of this type on the selected date
   * (after the stable caseId sort). Used only when the inventory API omits
   * `seriesNumber` on the case.
   */
  seriesOrdinal: number;
}

export const CaseCard = memo(function CaseCard({
  caseData,
  seriesOrdinal,
}: CaseCardProps) {
  // Prefer the inventory API's own series number. `??` falls back only on
  // null/undefined, so a legitimate 0 is preserved and we never render
  // "Series #undefined".
  const seriesNumber = caseData.seriesNumber ?? seriesOrdinal;
  const title = `${getChecklistCaseShortLabel(caseData.caseType)} Series #${seriesNumber}`;
  const subtitle = getChecklistCaseLongDescription(caseData.caseType);

  // The API does not always return coins in position order. `position` is the
  // inventory's value-descending rank, so sorting a copy by it renders coins
  // most-valuable-first and numbered down the list. Copy, never sort in place:
  // Array.prototype.sort mutates, and caseData.coins is upstream props.
  const coinsInValueOrder = [...caseData.coins].sort((a, b) => a.position - b.position);

  return (
    <div className="bg-slate-900/40 rounded-lg shadow-lg border border-slate-700 p-6">
      {/* Case Header */}
      <div className="mb-4 pb-4 border-b border-slate-700">
        <h2 className="text-2xl font-bold text-gold mb-1">
          📦 {title}
        </h2>
        <p className="text-slate-300">
          {subtitle}
        </p>
      </div>

      {/* Coins List */}
      <div>
        <h3 className="font-semibold text-lg mb-3 text-slate-200">
          Contents ({caseData.totalCoins} coins):
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {coinsInValueOrder.map((coin) => (
            <div 
              key={coin.position}
              className="flex items-start p-3 bg-slate-800/50 rounded border border-slate-700"
            >
              <span className="font-bold text-gold mr-2 min-w-[24px]">
                {coin.position}.
              </span>
              <div className="flex-1">
                <div className="font-medium text-slate-200">{coin.coinType}</div>
                <div className="text-sm text-slate-400">
                  {coin.year} • {coin.grade} • {coin.gradingCompany}
                </div>
                {coin.weight && (
                  <div className="text-xs text-gold mt-1">
                    {coin.weight}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

