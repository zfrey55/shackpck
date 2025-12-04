import { memo } from "react";

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DateSelector = memo(function DateSelector({ 
  selectedDate, 
  onDateChange 
}: DateSelectorProps) {
  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    onDateChange(today);
  };

  return (
    <div className="mb-8 text-center">
      <label className="mr-2 text-slate-300">View checklist for:</label>
      <input 
        type="date" 
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="border border-slate-600 rounded px-3 py-2 bg-slate-800 text-slate-200"
      />
      <button 
        onClick={handleToday}
        className="ml-2 bg-gold text-slate-900 px-4 py-2 rounded font-semibold hover:bg-gold/90 transition"
      >
        Today
      </button>
    </div>
  );
});

