'use client';

export type ProductLine = 'coins' | 'cards';

type CoinsCardsToggleProps = {
  value: ProductLine;
  onChange: (next: ProductLine) => void;
  className?: string;
};

export function CoinsCardsToggle({ value, onChange, className = '' }: CoinsCardsToggleProps) {
  const btn = (line: ProductLine, label: string) => (
    <button
      type="button"
      onClick={() => onChange(line)}
      className={`rounded-md px-5 py-2 text-sm font-semibold transition-colors ${
        value === line
          ? 'bg-gold text-black'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 p-1 ${className}`}
      role="tablist"
      aria-label="Product category"
    >
      {btn('coins', 'Coins')}
      {btn('cards', 'Cards')}
    </div>
  );
}
