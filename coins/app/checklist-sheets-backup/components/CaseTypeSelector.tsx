import { memo } from "react";
import type { CaseType } from "../types";
import { CASE_TYPE_META } from "../constants";

interface CaseTypeSelectorProps {
  cases: CaseType[];
  selectedCase: CaseType;
  onSelectCase: (caseType: CaseType) => void;
}

export const CaseTypeSelector = memo(function CaseTypeSelector({
  cases,
  selectedCase,
  onSelectCase
}: CaseTypeSelectorProps) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-5 space-y-4">
      <h2 className="text-xl font-semibold text-slate-100">Case Types</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-4">
        {cases.map((caseType) => {
          const active = caseType.id === selectedCase.id;
          const meta = CASE_TYPE_META[caseType.id];
          return (
            <button
              key={caseType.id}
              onClick={() => onSelectCase(caseType)}
              className={`rounded-lg border p-4 text-left transition ${
                active
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600"
              }`}
            >
              <div className="font-semibold text-sm mb-1">{meta?.label ?? caseType.name}</div>
              <div className="text-xs text-slate-400">
                {meta?.helper ?? caseType.goldContent}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

