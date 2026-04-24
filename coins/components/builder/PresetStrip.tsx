'use client';

import { BUILDER_PRESETS, type Preset } from '@/lib/builder/catalog';

type Props = {
  onApply: (preset: Preset) => void;
};

export function PresetStrip({ onApply }: Props) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Start with a preset
        </h3>
        <p className="text-[11px] text-slate-500">Everything is fully editable after.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {BUILDER_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onApply(p)}
            title={p.description}
            className="group relative rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-left transition-colors hover:border-gold/60 hover:bg-slate-800"
          >
            <p className="text-sm font-semibold text-slate-100 group-hover:text-gold">
              {p.name}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              {p.packCount} packs · {p.lines.length ? `${p.lines.length} lines` : 'blank'}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
