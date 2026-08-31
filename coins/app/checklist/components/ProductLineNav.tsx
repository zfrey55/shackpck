'use client';

import { getBrand, type BrandId } from '@/lib/brands';
import { ProductLineTabs } from '@/components/ProductLineTabs';
import { BucketedTabs, type BucketTab } from '@/components/BucketedTabs';
import type { ProductLine } from '@/lib/product-lines';

type ProductLineNavProps = {
  line: ProductLine;
  onLineChange: (next: ProductLine) => void;
  /**
   * Brands with checklist content on the CURRENT card line, derived from the
   * card model. Empty is legitimate — the Pokemon line has no checklists yet —
   * and renders as a message rather than a hidden tier.
   */
  cardBrands: BrandId[];
  activeCardBrand: BrandId;
  onCardBrandChange: (next: BrandId) => void;
};

/**
 * TIER 1 (product line) plus TIER 2 for the two CARD lines.
 *
 * The coin line's tier 2 is CustomerNav instead — customers, not brands — so
 * it is rendered by the caller alongside this. Both use BucketedTabs
 * underneath, so the two rows look identical whichever line is selected.
 *
 * A card line with exactly one brand still shows its tab, unlike the previous
 * `length > 1` rule: with three lines the row is now the only thing telling
 * you which brand you are looking at.
 */
export function ProductLineNav({
  line,
  onLineChange,
  cardBrands,
  activeCardBrand,
  onCardBrandChange,
}: ProductLineNavProps) {
  const primary: BucketTab[] = cardBrands.map((id) => ({
    id,
    label: getBrand(id).name,
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <ProductLineTabs value={line} onChange={onLineChange} />
      </div>

      {line !== 'coins' && primary.length > 0 && (
        <BucketedTabs
          ariaLabel="Card brand"
          primary={primary}
          activePrimary={activeCardBrand}
          onPrimary={(id) => onCardBrandChange(id as BrandId)}
        />
      )}
    </div>
  );
}
