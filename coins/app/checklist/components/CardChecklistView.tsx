'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import {
  CARD_CHECKLIST_SERIES,
  CARD_PRODUCT_LINES,
  CARD_PRODUCT_ORDER,
  type CardChecklistRow,
  type CardProductId,
  type CardProductLine,
  type CardSeriesDefinition,
} from '@/lib/card-checklist-data';
import { GradePill } from './GradePill';

function MetaItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-200">{value}</div>
    </div>
  );
}

function ConditionCell({ row }: { row: CardChecklistRow }) {
  if (row.isGraded && row.grader && row.grade) {
    return <GradePill grader={row.grader} grade={row.grade} />;
  }
  return (
    <span className="inline-flex min-w-[7rem] justify-center rounded border border-slate-600 bg-slate-800/60 px-2 py-0.5 text-xs font-semibold text-slate-300">
      {row.condition}
    </span>
  );
}

function SportRow({ row }: { row: CardChecklistRow }) {
  return (
    <div className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-start gap-3 border-b border-slate-700/80 py-3 text-sm sm:grid-cols-[40px_110px_minmax(0,1fr)_auto] sm:items-center">
      <div className="font-bold text-gold">{row.position}.</div>
      <div className="hidden text-xs text-slate-300 sm:block">
        <span className="rounded bg-slate-800 px-2 py-0.5">{row.sport}</span>
      </div>
      <div className="min-w-0 text-slate-200">
        <span className="text-slate-300">{row.year}</span>
        <span className="text-slate-500"> · </span>
        <span>{row.setName}</span>
        <span className="text-slate-500"> · </span>
        <span className="font-medium">{row.cardName}</span>
        <span className="text-slate-500"> · </span>
        <span className="text-slate-300">{row.variation}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Qty 1</span>
        <ConditionCell row={row} />
      </div>
    </div>
  );
}

function showTypeLabel(showType: 'multi-show' | 'single-show'): string {
  return showType === 'multi-show' ? 'Multi-Show' : 'Single Show';
}

function SeriesHeader({
  product,
  series,
}: {
  product: CardProductLine;
  series: CardSeriesDefinition;
}) {
  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-slate-700 bg-slate-900/60">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-[260px_minmax(0,1fr)]">
        <div className="relative aspect-[3/4] w-full bg-slate-950 md:aspect-auto md:min-h-[280px]">
          <Image
            src={product.imageSrc}
            alt={product.imageAlt}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 260px"
            priority={false}
          />
        </div>
        <div className="p-5">
          <div className="mb-1 text-xs uppercase tracking-wider text-slate-400">
            Multi-Sport · {showTypeLabel(product.showType)}
          </div>
          <h2 className="text-2xl font-bold text-gold">{series.displayLabel}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{product.tagline}</p>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            <MetaItem label="Brand / Manufacturer" value={product.brand} />
            <MetaItem label="Title of Product" value={product.productTitle} />
            <MetaItem
              label="Type"
              value={`Multi-Sport · ${showTypeLabel(product.showType)}`}
            />
            <MetaItem label="Quantity per Item" value={product.quantityPerItem} />
            <MetaItem label="Cards per Product" value={series.rows.length} />
          </div>
        </div>
      </div>
    </div>
  );
}

type ProductOption = {
  product: CardProductLine;
  series: CardSeriesDefinition[];
};

function buildProductOptions(): ProductOption[] {
  return CARD_PRODUCT_ORDER.map((id) => ({
    product: CARD_PRODUCT_LINES[id],
    series: CARD_CHECKLIST_SERIES.filter((s) => s.productId === id),
  })).filter((opt) => opt.series.length > 0);
}

export function CardChecklistView() {
  const productOptions = useMemo(buildProductOptions, []);
  const [productId, setProductId] = useState<CardProductId>(
    productOptions[0]?.product.id ?? 'fusion'
  );

  const seriesForProduct = useMemo(
    () => productOptions.find((p) => p.product.id === productId)?.series ?? [],
    [productOptions, productId]
  );

  const [seriesId, setSeriesId] = useState<string>(seriesForProduct[0]?.id ?? '');

  const activeSeries = useMemo(
    () => seriesForProduct.find((s) => s.id === seriesId) ?? seriesForProduct[0],
    [seriesForProduct, seriesId]
  );

  const activeProduct = activeSeries ? CARD_PRODUCT_LINES[activeSeries.productId] : null;

  if (!activeSeries || !activeProduct) return null;

  const handleProductChange = (next: CardProductId) => {
    setProductId(next);
    const firstSeries = productOptions.find((p) => p.product.id === next)?.series[0];
    if (firstSeries) setSeriesId(firstSeries.id);
  };

  const showSeriesPicker = seriesForProduct.length > 1;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
        <div
          className={`grid grid-cols-1 gap-3 ${
            showSeriesPicker ? 'sm:grid-cols-2' : ''
          }`}
        >
          <div>
            <label
              htmlFor="card-product-select"
              className="mb-2 block text-sm font-medium text-slate-400"
            >
              Product
            </label>
            <select
              id="card-product-select"
              value={productId}
              onChange={(e) => handleProductChange(e.target.value as CardProductId)}
              className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            >
              {productOptions.map(({ product }) => (
                <option key={product.id} value={product.id}>
                  {product.productName} (Multi-Sport · {showTypeLabel(product.showType)})
                </option>
              ))}
            </select>
          </div>
          {showSeriesPicker && (
            <div>
              <label
                htmlFor="card-series-select"
                className="mb-2 block text-sm font-medium text-slate-400"
              >
                Series
              </label>
              <select
                id="card-series-select"
                value={activeSeries.id}
                onChange={(e) => setSeriesId(e.target.value)}
                className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-slate-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {seriesForProduct.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.displayLabel}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <SeriesHeader product={activeProduct} series={activeSeries} />

      <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 shadow-lg">
        <div className="mb-5 rounded-md border border-amber-600/60 bg-amber-900/20 p-3 text-sm leading-relaxed text-amber-100">
          <strong>EXAMPLE CHECKLIST — NOT A FINALIZED SERIES.</strong> The 10 cards listed
          below illustrate the format, sport mix, era mix, and condition mix of this product.
          The actual cards in any produced ShackPack will be different.
        </div>

        <div className="mb-6 space-y-3 text-sm text-slate-300">
          {activeSeries.overviewParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="font-semibold text-slate-200">Example cards (illustrative only):</p>
        </div>

        <div className="mb-1 hidden border-b border-slate-700 pb-2 text-xs uppercase tracking-wider text-slate-500 sm:block">
          <div className="grid grid-cols-[40px_110px_minmax(0,1fr)_auto] gap-3">
            <span>#</span>
            <span>Sport</span>
            <span>Year · Set · Player · Variation</span>
            <span className="text-right">Qty / Condition</span>
          </div>
        </div>

        <div className="max-h-[min(70vh,640px)] overflow-y-auto pr-1">
          {activeSeries.rows.map((row) => (
            <SportRow key={`${activeSeries.id}-${row.position}`} row={row} />
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Grade pills: PSA (blue), BGS (orange), SGC (green). Raw / ungraded cards are shown in
          gray. Quantity is 1 for each individual item.
        </p>
      </div>
    </div>
  );
}
