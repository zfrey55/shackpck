'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  COIN_CATEGORY_LABELS,
  COIN_CATEGORY_ORDER,
  coinsByCategory,
  type CoinTypeDef,
} from '@/lib/builder/catalog';

type Props = {
  onAdd: (coin: CoinTypeDef) => void;
};

export function CoinCatalog({ onAdd }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(COIN_CATEGORY_ORDER.slice(0, 3))
  );

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300">
        <p>
          <span className="font-semibold text-gold">All coins are certified.</span>{' '}
          Pick your preferred grader on each line. Drag a tile to add, or click to drop it in.
        </p>
      </div>
      {COIN_CATEGORY_ORDER.map((cat) => {
        const coins = coinsByCategory(cat);
        const isOpen = expanded.has(cat);
        return (
          <div key={cat} className="rounded-md border border-slate-800 bg-slate-950/60">
            <button
              type="button"
              onClick={() => toggle(cat)}
              className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-900/50"
              aria-expanded={isOpen}
            >
              <span>{COIN_CATEGORY_LABELS[cat]}</span>
              <span className="text-xs text-slate-500">
                {isOpen ? '−' : '+'} {coins.length}
              </span>
            </button>
            {isOpen && (
              <div className="flex flex-col gap-1.5 px-2 pb-2">
                {coins.map((coin) => (
                  <CoinTile key={coin.id} coin={coin} onAdd={onAdd} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CoinTile({ coin, onAdd }: { coin: CoinTypeDef; onAdd: (c: CoinTypeDef) => void }) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: `catalog-${coin.id}`,
    data: { type: 'catalog', coin },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: 0.7 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group flex cursor-grab items-center justify-between rounded-md border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs transition-colors hover:border-gold/60 hover:bg-slate-900 ${
        isDragging ? 'ring-2 ring-gold' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-100">{coin.label}</p>
        {coin.hint && <p className="truncate text-[11px] text-slate-500">{coin.hint}</p>}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAdd(coin);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="ml-2 rounded border border-gold/40 px-2 py-0.5 text-[11px] font-semibold text-gold opacity-0 transition-opacity group-hover:opacity-100"
      >
        Add
      </button>
    </div>
  );
}
