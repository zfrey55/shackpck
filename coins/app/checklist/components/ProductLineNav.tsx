'use client';

import { getBrand, type BrandId } from '@/lib/brands';
import { CoinsCardsToggle, type ProductLine } from '@/components/CoinsCardsToggle';

type ProductLineNavProps = {
  line: ProductLine;
  onLineChange: (next: ProductLine) => void;
  /**
   * Brands with card content, derived from the card model. Only rendered on
   * the Cards line; the Coins line uses CustomerNav underneath instead.
   */
  cardBrands: BrandId[];
  activeCardBrand: BrandId;
  onCardBrandChange: (next: BrandId) => void;
};

/**
 * Top-tier product-line nav: Coins / Cards.
 *
 * Coins and Cards used to be a toggle nested inside the ShackPack customer
 * tab, which meant a customer's card content had nowhere to live. The product
 * line is now the OUTER tier and brand tabs sit underneath it, scoped to the
 * selected line — customer tabs for coins, card brands for cards.
 */
export function ProductLineNav({
  line,
  onLineChange,
  cardBrands,
  activeCardBrand,
  onCardBrandChange,
}: ProductLineNavProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <CoinsCardsToggle value={line} onChange={onLineChange} />
      </div>

      {line === 'cards' && cardBrands.length > 1 && (
        <div
          role="tablist"
          aria-label="Card brand"
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {cardBrands.map((brandId) => {
            const active = brandId === activeCardBrand;
            return (
              <button
                key={brandId}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onCardBrandChange(brandId)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-gold text-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {getBrand(brandId).name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
