'use client';

import { MAX_PACK_COUNT, MIN_PACK_COUNT } from '@/lib/builder/catalog';

type Props = {
  value: number;
  onChange: (n: number) => void;
  label?: string;
};

const PRESET_SIZES = [10, 15, 20, 25, 30, 50, 100];

export function CaseSizeControl({ value, onChange, label = 'Pack count' }: Props) {
  const clamp = (n: number) =>
    Math.max(MIN_PACK_COUNT, Math.min(MAX_PACK_COUNT, Math.round(n)));

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="range"
          min={MIN_PACK_COUNT}
          max={MAX_PACK_COUNT}
          step={1}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-700 accent-gold"
          aria-label="Pack count"
        />
        <input
          type="number"
          min={MIN_PACK_COUNT}
          max={MAX_PACK_COUNT}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          className="w-20 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-right font-mono text-sm text-slate-100 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {PRESET_SIZES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`rounded-full border px-2.5 py-0.5 text-xs ${
              value === n
                ? 'border-gold bg-gold/20 text-gold'
                : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        Between {MIN_PACK_COUNT} and {MAX_PACK_COUNT} packs per case.
      </p>
    </div>
  );
}
