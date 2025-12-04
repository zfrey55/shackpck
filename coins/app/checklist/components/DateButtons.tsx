import { memo } from "react";

interface DateButtonsProps {
  dates: { displayDate: string; totalCases: number }[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export const DateButtons = memo(function DateButtons({
  dates,
  selectedDate,
  onDateSelect
}: DateButtonsProps) {
  if (dates.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-slate-200 mb-4 text-center">
        Available Checklists
      </h2>
      <div className="flex flex-wrap gap-3 justify-center">
        {dates.map((dateItem) => {
          const isSelected = dateItem.displayDate === selectedDate;
          const isLatest = dateItem.displayDate === dates[0].displayDate;
          
          // Parse date as local time to avoid timezone issues
          const [year, month, day] = dateItem.displayDate.split('-').map(Number);
          const localDate = new Date(year, month - 1, day);
          const displayText = localDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <button
              key={dateItem.displayDate}
              onClick={() => onDateSelect(dateItem.displayDate)}
              className={`
                relative px-6 py-3 rounded-lg border-2 font-semibold transition-all
                ${isSelected
                  ? 'bg-gold text-slate-900 border-gold shadow-lg scale-105'
                  : 'bg-slate-800/50 text-slate-300 border-slate-600 hover:border-gold hover:text-gold'
                }
              `}
            >
              <div className="text-sm">{displayText}</div>
              <div className="text-xs opacity-75 mt-1">
                {dateItem.totalCases} series
              </div>
              {isLatest && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Latest
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

