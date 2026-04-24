'use client';

import { useMemo, useState } from 'react';
import {
  COIN_CATEGORY_LABELS,
  COIN_CATEGORY_ORDER,
  GRADER_LABELS,
  TIER_DEFS,
  getCoinDef,
  type CoinCategory,
  type Grader,
  type Tier,
} from '@/lib/builder/catalog';
import type { PersistedBuild } from '@/lib/builder/types';

type Props = {
  builds: PersistedBuild[];
  initialLeftId?: string;
  initialRightId?: string;
  onClose: () => void;
};

type Aggregate = Record<CoinCategory, number>;

function categoryTotals(build: PersistedBuild): Aggregate {
  const out: Aggregate = {
    gold: 0,
    platinum: 0,
    'silver-bullion': 0,
    'classic-silver': 0,
    denominational: 0,
    other: 0,
  };
  for (const line of build.lines) {
    const coin = getCoinDef(line.coinType);
    if (!coin) continue;
    out[coin.category] += line.quantity;
  }
  return out;
}

function totalCoins(build: PersistedBuild): number {
  return build.lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function CompareDrawer({ builds, initialLeftId, initialRightId, onClose }: Props) {
  const [leftId, setLeftId] = useState(initialLeftId ?? builds[0]?.id ?? '');
  const [rightId, setRightId] = useState(
    initialRightId ?? builds.find((b) => b.id !== (initialLeftId ?? builds[0]?.id))?.id ?? ''
  );

  const left = builds.find((b) => b.id === leftId) ?? null;
  const right = builds.find((b) => b.id === rightId) ?? null;

  const leftTotals = useMemo(() => (left ? categoryTotals(left) : null), [left]);
  const rightTotals = useMemo(() => (right ? categoryTotals(right) : null), [right]);

  return (
    <div className="fixed inset-0 z-40 bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="mx-auto mt-10 max-h-[85vh] max-w-5xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-950 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gold">Compare builds</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-700 px-3 py-1 text-sm text-slate-300 hover:border-gold/60"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[{ label: 'Left', id: leftId, set: setLeftId }, { label: 'Right', id: rightId, set: setRightId }].map(
            ({ label, id, set }) => (
              <div key={label}>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {label}
                </label>
                <select
                  value={id}
                  onChange={(e) => set(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-100 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  <option value="">Pick a build</option>
                  {builds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} · {b.packCount} packs · {b.status}
                    </option>
                  ))}
                </select>
              </div>
            )
          )}
        </div>

        {left && right ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[left, right].map((b) => (
              <div
                key={b.id}
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
              >
                <p className="text-xs uppercase tracking-wider text-slate-400">
                  {b.status} · Ref {b.shortCode}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-100">{b.name}</h3>
                <p className="text-xs text-slate-500">
                  {b.packCount} packs · {totalCoins(b)} coins listed
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  {COIN_CATEGORY_ORDER.map((cat) => {
                    const totals = b === left ? leftTotals : rightTotals;
                    const n = totals?.[cat] ?? 0;
                    return (
                      <div key={cat} className="flex justify-between rounded bg-slate-950/60 px-2 py-1">
                        <span className="text-slate-400">{COIN_CATEGORY_LABELS[cat]}</span>
                        <span className={`font-mono ${n > 0 ? 'text-gold' : 'text-slate-600'}`}>
                          {n}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <ul className="mt-3 space-y-1 text-xs text-slate-300">
                  {b.lines.map((line) => {
                    const coin = getCoinDef(line.coinType);
                    const tier = TIER_DEFS[line.tier as Tier];
                    const grader = GRADER_LABELS[line.grader as Grader] ?? line.grader;
                    return (
                      <li key={line.id ?? `${line.coinType}-${line.order}`} className="truncate">
                        <span className="font-mono text-slate-500">{line.quantity}×</span>{' '}
                        <span className="text-slate-100">{coin?.label ?? line.coinType}</span>{' '}
                        <span className="text-slate-500">— {grader} · {tier?.label ?? line.tier}</span>
                      </li>
                    );
                  })}
                  {b.lines.length === 0 && (
                    <li className="italic text-slate-500">No lines yet.</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-slate-500">
            Select two builds to compare them side by side.
          </p>
        )}
      </div>
    </div>
  );
}
