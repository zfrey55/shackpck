'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { RepackCard } from '@/components/RepackCard';
import { BrandTabs, BrandHeader } from '@/components/BrandTabs';
import { getCoinPacksForBrand } from '@/lib/repack-catalog';
import { CARD_REPACK_CATALOG } from '@/lib/card-repack-catalog';
import { CoinsCardsToggle, type ProductLine } from '@/components/CoinsCardsToggle';
import { BRANDS, getBrand, toBrandId, type BrandId } from '@/lib/brands';
import {
  brandHasPacks,
  checklistHrefForBrand,
} from '@/lib/customer-attribution';

/**
 * Brands with COIN pack tiles.
 *
 * Same derivation as before — customers flagged hasPacks in CUSTOMER_PACKS —
 * with the added requirement that the brand actually has coin packs. That
 * requirement only excludes card-only brands (Vault Room Breaks), which would
 * otherwise land on an empty coin grid. Every brand that had a coin tab keeps
 * one.
 */
const COIN_BRANDS = BRANDS.filter(
  (brand) => brandHasPacks(brand.id) && getCoinPacksForBrand(brand.id).length > 0
);

/**
 * Brands with CARD pack tiles, derived from the catalog's own entries rather
 * than a list or the `hasCards` flag — a brand appears here only if it really
 * has card tiles, so the tab can never open on an empty grid.
 */
const CARD_BRAND_IDS = new Set(CARD_REPACK_CATALOG.map((pack) => pack.brand));
const CARD_BRANDS = BRANDS.filter((brand) => CARD_BRAND_IDS.has(brand.id));

function brandsForLine(line: ProductLine) {
  return line === 'cards' ? CARD_BRANDS : COIN_BRANDS;
}

/**
 * Product line from the URL.
 *
 * `?line=` matches /checklist exactly, so the two pages read the same param
 * with the same semantics (absent means coins). `?tab=` is the parameter this
 * page used before and is still honored, so older links keep working; it is
 * never written back.
 */
function lineFromSearch(params: URLSearchParams | null): ProductLine {
  const line = params?.get('line') ?? params?.get('tab');
  return line === 'cards' ? 'cards' : 'coins';
}

export function RepacksClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const requestedLine = lineFromSearch(searchParams);
  // Fall back to coins if the cards line has no brands at all.
  const line: ProductLine = CARD_BRANDS.length > 0 ? requestedLine : 'coins';
  const lineBrands = brandsForLine(line);

  // ?brand= is unchanged: same param, same toBrandId resolution as before. It
  // is only clamped when the brand has no tiles on the CURRENT line, so that
  // switching lines can never strand the grid on an empty brand.
  const requestedBrandId = toBrandId(searchParams?.get('brand'));
  const brandId: BrandId = lineBrands.some((b) => b.id === requestedBrandId)
    ? requestedBrandId
    : lineBrands[0]?.id ?? requestedBrandId;
  const brand = getBrand(brandId);

  const packs =
    line === 'cards'
      ? CARD_REPACK_CATALOG.filter((p) => p.brand === brand.id)
      : getCoinPacksForBrand(brand.id);

  // Null for a brand with pack tiles but no checklist content of any kind.
  const checklistHref = checklistHrefForBrand(brand.id);

  const pushState = (nextLine: ProductLine, nextBrand: BrandId) => {
    const p = new URLSearchParams(searchParams?.toString());
    p.delete('tab'); // legacy param: read for back-compat, never written
    if (nextLine === 'cards') p.set('line', 'cards');
    else p.delete('line');
    p.set('brand', nextBrand);
    router.push(`/repacks?${p.toString()}`);
  };

  const setBrand = (next: BrandId) => pushState(line, next);

  const setLine = (next: ProductLine) => {
    // Keep the current brand if it has tiles on the target line; otherwise
    // land on that line's first brand.
    const target = brandsForLine(next);
    const keep = target.some((b) => b.id === brand.id) ? brand.id : target[0]?.id;
    pushState(next, keep ?? brand.id);
  };

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-semibold">Packs</h1>
        <p className="mt-3 text-lg text-slate-300 max-w-3xl mx-auto">
          Browse repacks by brand — every series is backed by a published checklist.
        </p>

        {/* Product line is the OUTER tier; brand tabs sit under it, scoped to it. */}
        {CARD_BRANDS.length > 0 && (
          <div className="mt-6 flex justify-center">
            <CoinsCardsToggle value={line} onChange={setLine} />
          </div>
        )}

        <div className="mt-4">
          <BrandTabs value={brand.id} onChange={setBrand} brands={lineBrands} />
        </div>
      </div>

      {/* Brand header (logo / wordmark + tagline) */}
      <BrandHeader brand={brand} />

      {packs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((repack) => (
            <RepackCard key={repack.id} {...repack} />
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-400 py-16">
          No packs to show for {brand.name} yet — check back soon.
        </div>
      )}

      {/* Checklist link for this brand, omitted when it has no checklist. */}
      {checklistHref && (
        <div className="mt-10 text-center">
          <Link
            href={checklistHref}
            className="inline-flex items-center gap-2 text-gold hover:underline font-medium"
          >
            View {brand.name} checklists
            <span>→</span>
          </Link>
        </div>
      )}

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Why Choose Shackpack?</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-semibold text-gold">Expert Curation</h3>
            <p className="text-sm text-slate-400 mt-2">Each coin is hand-selected by numismatic experts</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-semibold text-gold">Checklist Verified</h3>
            <p className="text-sm text-slate-400 mt-2">Every series ships with a complete, publicly available checklist so buyers always know what&apos;s in the pool</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="font-semibold text-gold">Authenticity Guaranteed</h3>
            <p className="text-sm text-slate-400 mt-2">All coins verified for authenticity and condition</p>
          </div>
        </div>
      </div>
    </>
  );
}
