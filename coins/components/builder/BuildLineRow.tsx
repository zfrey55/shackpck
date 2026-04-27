'use client';

import {
  getCoinDef,
  GRADERS,
  GRADER_LABELS,
  type Grader,
} from '@/lib/builder/catalog';
import type { BuildLine } from '@/lib/builder/types';

type Props = {
  line: BuildLine;
  index: number;
  onChange: (patch: Partial<BuildLine>) => void;
  onRemove: () => void;
};

export function BuildLineRow({ line, index, onChange, onRemove }: Props) {
  const coin = getCoinDef(line.coinType);
  const label = coin?.label ?? line.coinType;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h4 className="truncate text-sm font-semibold text-slate-100">{label}</h4>
          </div>
          {coin?.hint && <p className="mt-0.5 truncate text-[11px] text-slate-500">{coin.hint}</p>}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:border-red-500 hover:text-red-400"
          aria-label={`Remove ${label}`}
        >
          Remove
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr]">
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Qty
          </label>
          <input
            type="number"
            min={1}
            max={500}
            value={line.quantity}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              if (!Number.isNaN(n)) onChange({ quantity: Math.max(1, Math.min(500, n)) });
            }}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-100 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Grader preference
          </label>
          <select
            value={line.grader}
            onChange={(e) => onChange({ grader: e.target.value as Grader })}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-100 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          >
            {GRADERS.map((g) => (
              <option key={g} value={g}>
                {GRADER_LABELS[g]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Line notes (optional)
        </label>
        <input
          type="text"
          maxLength={400}
          value={line.notes ?? ''}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="e.g. prefer MS65+ / specific design / series preference"
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>
    </div>
  );
}
