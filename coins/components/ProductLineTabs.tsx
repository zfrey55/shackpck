'use client';

import { PRODUCT_LINES, type ProductLine } from '@/lib/product-lines';

type ProductLineTabsProps = {
  value: ProductLine;
  onChange: (next: ProductLine) => void;
  className?: string;
};

/**
 * TIER 1: the product-line nav — Coins / Sports Cards / Pokemon Cards.
 *
 * Every line is ALWAYS selectable, including one with no content yet. A line
 * that renders an explicit empty state tells a visitor the category exists and
 * is coming; hiding the button tells them nothing. The empty state is the
 * page's job, not this component's.
 *
 * Replaces the two-way CoinsCardsToggle. Identical markup on both /repacks and
 * /checklist so the two pages read as one nav.
 */
export function ProductLineTabs({ value, onChange, className = '' }: ProductLineTabsProps) {
  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 p-1 ${className}`}
      role="tablist"
      aria-label="Product line"
    >
      {PRODUCT_LINES.map((line) => (
        <button
          key={line.id}
          type="button"
          role="tab"
          aria-selected={value === line.id}
          onClick={() => onChange(line.id)}
          className={`rounded-md px-5 py-2 text-sm font-semibold transition-colors ${
            value === line.id
              ? 'bg-gold text-black'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {line.label}
        </button>
      ))}
    </div>
  );
}
