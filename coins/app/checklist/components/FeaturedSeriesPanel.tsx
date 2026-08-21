'use client';

import type { CoinInventorySeries } from '@/lib/coin-inventory-api';
import { formatSeriesDisplayName } from '@/lib/series-display';
import { LoadingState } from './LoadingState';

/**
 * Featured coin series panel, extracted verbatim from the checklist page so
 * that page's client file stays under the size limit. Behavior unchanged.
 *
 * Coin contents are numbered by RENDER INDEX, not by any position field — the
 * coin side's position is a slot number with no value meaning.
 */
export function FeaturedSeriesPanel({
  series,
  loading,
  onBack,
}: {
  series: CoinInventorySeries[];
  loading: boolean;
  onBack: () => void;
}) {
  return (
    <div className="mb-8">
      <button
        onClick={onBack}
        className="text-gold hover:text-gold/80 transition-colors flex items-center gap-2 mb-6"
      >
        ← Back to Series Selection
      </button>

      {loading ? (
        <LoadingState />
      ) : series.length > 0 ? (
        <div className="space-y-6">
          {series.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/40 rounded-lg shadow-lg border border-slate-700 p-6"
            >
              <div className="mb-4 pb-4 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-gold mb-1">
                  📦 {formatSeriesDisplayName(item.name)}
                </h2>
                {item.description && (
                  <p className="text-slate-300 mt-2">{item.description}</p>
                )}
              </div>

              {item.checklist && item.checklist.length > 0 ? (
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-slate-200">
                    Contents ({item.checklist.length} coins):
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {item.checklist.map((coin, index) => (
                      <div
                        key={index}
                        className="flex items-start p-3 bg-slate-800/50 rounded border border-slate-700"
                      >
                        <span className="font-bold text-gold mr-2 min-w-[24px]">
                          {index + 1}.
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-slate-200">{coin.coinType}</div>
                          <div className="text-sm text-slate-400">
                            {coin.year}
                            {coin.grade && ` • ${coin.grade}`}
                            {coin.gradingCompany && ` • ${coin.gradingCompany}`}
                          </div>
                          {coin.weight && (
                            <div className="text-xs text-gold mt-1">{coin.weight}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">No checklist available for this series.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-900/40 rounded-lg border border-slate-700">
          <p className="text-slate-400">No active featured series available.</p>
        </div>
      )}
    </div>
  );
}
