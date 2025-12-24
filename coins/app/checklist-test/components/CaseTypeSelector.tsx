import { memo } from "react";
import type { CaseTypeInfo } from "../types";

interface CaseTypeSelectorProps {
  caseTypes: CaseTypeInfo[];
  selectedCaseType: string | null;
  onCaseTypeSelect: (caseType: string) => void;
  caseDescriptions: Record<string, string>;
}

export const CaseTypeSelector = memo(function CaseTypeSelector({
  caseTypes,
  selectedCaseType,
  onCaseTypeSelect,
  caseDescriptions
}: CaseTypeSelectorProps) {
  if (caseTypes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No case types available</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-slate-200 mb-4 text-center">
        Select a Series
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {caseTypes.map((caseTypeInfo) => {
          const isSelected = caseTypeInfo.caseType === selectedCaseType;
          const displayName = caseDescriptions[caseTypeInfo.caseType] 
            ? caseDescriptions[caseTypeInfo.caseType].split('(')[0].trim()
            : caseTypeInfo.displayName;

          return (
            <button
              key={caseTypeInfo.caseType}
              onClick={() => onCaseTypeSelect(caseTypeInfo.caseType)}
              className={`
                relative p-6 rounded-lg border-2 font-semibold transition-all text-left
                ${isSelected
                  ? 'bg-gold text-slate-900 border-gold shadow-lg scale-105'
                  : 'bg-slate-800/50 text-slate-300 border-slate-600 hover:border-gold hover:text-gold'
                }
              `}
            >
              <div className="text-lg font-bold mb-2">{displayName}</div>
              <div className="text-sm opacity-75">
                {caseTypeInfo.totalDates} date{caseTypeInfo.totalDates !== 1 ? 's' : ''} available
              </div>
              <div className="text-xs opacity-60 mt-1">
                {caseTypeInfo.totalCases} total case{caseTypeInfo.totalCases !== 1 ? 's' : ''}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

