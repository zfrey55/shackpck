import { memo } from "react";
import type { ChecklistResponse, CaseType } from "../types";
import { CASE_TYPE_META } from "../constants";

interface CoinListProps {
  data: ChecklistResponse;
  selectedCase: CaseType;
}

export const CoinList = memo(function CoinList({ data, selectedCase }: CoinListProps) {
  if (!data.checklist || data.checklist.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-10 text-center text-slate-400">
        No coins were recorded for this case during the selected series week.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-200">
          Coins in {CASE_TYPE_META[selectedCase.id]?.label ?? selectedCase.name}
        </h3>
        {data.totalTypes !== undefined && (
          <div className="text-sm text-slate-400">
            {data.totalTypes} coin {data.totalTypes === 1 ? "type" : "types"}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-5">
        <ul className="space-y-2 text-sm text-slate-200">
          {data.checklist.map((coin, index) => (
            <li key={`${coin.name}-${index}`} className="flex items-center gap-2">
              <span className="text-gold">•</span>
              <span>{coin.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
});

