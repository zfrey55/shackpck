'use client';

import { useDroppable } from '@dnd-kit/core';
import { BuildLineRow } from './BuildLineRow';
import type { BuildDraft, BuildLine } from '@/lib/builder/types';
import { totalCoins } from '@/lib/builder/types';

type Props = {
  draft: BuildDraft;
  onLineChange: (index: number, patch: Partial<BuildLine>) => void;
  onLineRemove: (index: number) => void;
};

export function BuildCanvas({ draft, onLineChange, onLineRemove }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id: 'build-canvas' });

  const coinsListed = totalCoins(draft);
  const unassigned = draft.packCount - coinsListed;
  const over = coinsListed > draft.packCount;

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border-2 border-dashed p-4 transition-colors ${
        isOver ? 'border-gold bg-slate-900/40' : 'border-slate-800 bg-slate-950/40'
      }`}
      aria-label="Build canvas — drop coins here"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-900/60 p-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400">Build</p>
          <p className="text-lg font-semibold text-slate-100">{draft.name}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-slate-400">Packs:</span>{' '}
            <span className="font-mono text-slate-100">{draft.packCount}</span>
          </div>
          <div>
            <span className="text-slate-400">Coins listed:</span>{' '}
            <span className={`font-mono ${over ? 'text-red-400' : 'text-slate-100'}`}>
              {coinsListed}
            </span>
          </div>
          {unassigned > 0 && (
            <div className="rounded bg-amber-900/40 px-2 py-0.5 text-xs text-amber-200">
              {unassigned} unassigned
            </div>
          )}
          {over && (
            <div className="rounded bg-red-900/40 px-2 py-0.5 text-xs text-red-200">
              {Math.abs(unassigned)} over
            </div>
          )}
        </div>
      </div>

      {draft.lines.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900/30 p-8 text-center">
          <p className="text-base font-semibold text-slate-300">Your build is empty</p>
          <p className="mt-1 text-sm text-slate-500">
            Drag coins from the catalog on the left, or pick a preset above to start.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {draft.lines.map((line, i) => (
            <BuildLineRow
              key={line.id ?? `new-${i}`}
              line={line}
              index={i}
              onChange={(patch) => onLineChange(i, patch)}
              onRemove={() => onLineRemove(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
