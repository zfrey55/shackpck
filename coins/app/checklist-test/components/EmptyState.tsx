import { memo } from "react";

interface EmptyStateProps {
  date: string;
  caseTypeName: string;
}

export const EmptyState = memo(function EmptyState({ date, caseTypeName }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-slate-900/40 rounded-lg border border-slate-700">
      <div className="text-6xl mb-4">📭</div>
      <h2 className="text-2xl font-bold mb-4 text-slate-200">No Series Available</h2>
      <p className="text-slate-400">No {caseTypeName} series available for {(() => {
        const [year, month, day] = date.split('-').map(Number);
        const localDate = new Date(year, month - 1, day);
        return localDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      })()}</p>
      <p className="text-sm text-slate-500 mt-2">Check back tomorrow for new series!</p>
    </div>
  );
});

