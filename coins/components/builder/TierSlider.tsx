'use client';

import { TIER_DEFS, TIER_ORDER, type Tier } from '@/lib/builder/catalog';

type Props = {
  value: Tier;
  onChange: (tier: Tier) => void;
  compact?: boolean;
};

export function TierSlider({ value, onChange, compact = false }: Props) {
  const index = TIER_ORDER.indexOf(value);
  const def = TIER_DEFS[value];

  return (
    <div className={compact ? 'w-full' : 'w-full space-y-1'}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-200">{def.label}</span>
        <span className="text-gold">{def.range}</span>
      </div>
      <input
        type="range"
        min={0}
        max={TIER_ORDER.length - 1}
        step={1}
        value={index}
        onChange={(e) => onChange(TIER_ORDER[Number(e.target.value)])}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-gold"
        aria-label="Target budget tier"
      />
      {!compact && (
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500">
          {TIER_ORDER.map((t) => (
            <span key={t} className={t === value ? 'text-gold' : ''}>
              {TIER_DEFS[t].label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
