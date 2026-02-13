import { memo } from "react";
import type { CaseData } from "../types";

interface CaseCardProps {
  caseData: CaseData;
  caseDescriptions: Record<string, string>;
}

export const CaseCard = memo(function CaseCard({ caseData, caseDescriptions }: CaseCardProps) {
  return (
    <div className="bg-slate-900/40 rounded-lg shadow-lg border border-slate-700 p-6">
      {/* Case Header */}
      <div className="mb-4 pb-4 border-b border-slate-700">
        <h2 className="text-2xl font-bold text-gold mb-1">
          📦 {caseData.displayName}
        </h2>
        <p className="text-slate-300">
          {caseDescriptions[caseData.caseType] || caseData.caseTypeName}
        </p>
      </div>

      {/* Coins List */}
      <div>
        <h3 className="font-semibold text-lg mb-3 text-slate-200">
          Contents ({caseData.totalCoins} coins):
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {caseData.coins.map((coin) => (
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

