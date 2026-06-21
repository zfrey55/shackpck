'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { RepackCard } from '@/components/RepackCard';
import { BrandTabs, BrandHeader } from '@/components/BrandTabs';
import { getCoinPacksForBrand } from '@/lib/repack-catalog';
import { CARD_REPACK_CATALOG } from '@/lib/card-repack-catalog';
import { CoinsCardsToggle, type ProductLine } from '@/components/CoinsCardsToggle';
import { getBrand, toBrandId, type BrandId } from '@/lib/brands';

function brandFromSearch(params: URLSearchParams | null): BrandId {
  return toBrandId(params?.get('brand'));
}

function lineFromSearch(params: URLSearchParams | null): ProductLine {
  return params?.get('tab') === 'cards' ? 'cards' : 'coins';
}

export function RepacksClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const brandId = brandFromSearch(searchParams);
  const brand = getBrand(brandId);
  const productLine = lineFromSearch(searchParams);

  // Cards only exist for brands flagged hasCards (ShackPack today). Force coins
  // for everyone else so a stale ?tab=cards can't show an empty grid.
  const effectiveLine: ProductLine = brand.hasCards ? productLine : 'coins';

  const coinPacks = getCoinPacksForBrand(brand.id);
  const cardPacks = brand.hasCards
    ? CARD_REPACK_CATALOG.filter((p) => p.brand === brand.id)
    : [];
  const packs = effectiveLine === 'cards' ? cardPacks : coinPacks;

  const setBrand = (next: BrandId) => {
    const p = new URLSearchParams(searchParams?.toString());
    p.set('brand', next);
    p.delete('tab'); // reset Coins/Cards when switching brand
    router.push(`/repacks?${p.toString()}`);
  };

  const setLine = (next: ProductLine) => {
    const p = new URLSearchParams(searchParams?.toString());
    p.set('brand', brand.id);
    p.set('tab', next);
    router.push(`/repacks?${p.toString()}`);
  };

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-semibold">Packs</h1>
        <p className="mt-3 text-lg text-slate-300 max-w-3xl mx-auto">
          Browse repacks by brand — every series is backed by a published checklist.
        </p>
        <div className="mt-6">
          <BrandTabs value={brand.id} onChange={setBrand} />
        </div>
      </div>

      {/* Brand header (logo / wordmark + tagline) */}
      <BrandHeader brand={brand} />

      {/* Coins/Cards sub-toggle, only for brands that have cards */}
      {brand.hasCards && (
        <div className="mb-8 flex justify-center">
          <CoinsCardsToggle value={effectiveLine} onChange={setLine} />
        </div>
      )}

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

      {/* Checklist link for this brand */}
      <div className="mt-10 text-center">
        <Link
          href={`/checklist?brand=${brand.id}`}
          className="inline-flex items-center gap-2 text-gold hover:underline font-medium"
        >
          View {brand.name} checklists
          <span>→</span>
        </Link>
      </div>

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
