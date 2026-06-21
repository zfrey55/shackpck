'use client';

import Image from 'next/image';
import { BRANDS, type Brand, type BrandId } from '@/lib/brands';

type BrandTabsProps = {
  value: BrandId;
  onChange: (next: BrandId) => void;
  className?: string;
};

/** Horizontal, scrollable customer-brand tab bar. ShackPack is first/default. */
export function BrandTabs({ value, onChange, className = '' }: BrandTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Customer brand"
      className={`flex flex-wrap items-center justify-center gap-2 ${className}`}
    >
      {BRANDS.map((brand) => {
        const active = brand.id === value;
        return (
          <button
            key={brand.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(brand.id)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              active
                ? 'bg-gold text-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {brand.name}
          </button>
        );
      })}
    </div>
  );
}

/** Logo (or text wordmark fallback) + name + tagline header for a brand. */
export function BrandHeader({ brand }: { brand: Brand }) {
  return (
    <div className="text-center mb-10">
      {brand.logo ? (
        <div className="relative mx-auto mb-4 h-20 w-48">
          <Image
            src={brand.logo}
            alt={brand.name}
            fill
            sizes="192px"
            className="object-contain"
          />
        </div>
      ) : (
        <h2 className="text-3xl font-bold tracking-tight text-gold sm:text-4xl">
          {brand.name}
        </h2>
      )}
      <p className="mt-3 text-lg text-slate-300 max-w-2xl mx-auto">{brand.tagline}</p>
    </div>
  );
}
