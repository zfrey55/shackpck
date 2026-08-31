'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { RepackCard } from '@/components/RepackCard';
import { BrandHeader } from '@/components/BrandTabs';
import { ProductLineTabs } from '@/components/ProductLineTabs';
import { BucketedTabs, type BucketTab } from '@/components/BucketedTabs';
import { getBrand, type BrandId } from '@/lib/brands';
import { checklistHrefForBrand } from '@/lib/customer-attribution';
import {
  packsForLineAndBrand,
  parseProductLine,
  writeLineParam,
  PRODUCT_LINES,
  type ProductLine,
} from '@/lib/product-lines';
import { brandsForLine, bucketForBrand, resolveBrandForLine } from './repacks-nav';

/**
 * /repacks, three tiers: product line -> brand -> pack grid.
 *
 * Tier 1 and tier 2 are the same components /checklist uses (ProductLineTabs
 * and BucketedTabs), reading the same `?line=` param with the same semantics,
 * so a visitor moving between the pages sees one nav rather than two.
 *
 * Tier 2 on the coin line is bucketed — ShackPack / Bullion Bureau / Other,
 * with Other revealing the rest — exactly as the checklist's customer nav
 * behaves. The card lines have few enough brands to list flat.
 *
 * URL contract, unchanged where it already existed:
 *   ?brand=<id>  the selected brand.
 *   ?tab=        legacy alias for ?line=, still read, never written.
 *   ?line=       coins|sports|pokemon; 'cards' still resolves to sports.
 */

/** Human label for a line, from the single PRODUCT_LINES source. */
function lineLabel(line: ProductLine): string {
  return PRODUCT_LINES.find((l) => l.id === line)?.label ?? 'Packs';
}

export function RepacksClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // `?tab=` predates `?line=` and is still honored for older links; it is read
  // here and never written back.
  const line = parseProductLine(
    searchParams?.get('line') ?? searchParams?.get('tab')
  );

  const { featured, other, hasOther } = brandsForLine(line);
  const brandId = resolveBrandForLine(line, searchParams?.get('brand') as BrandId | null);
  const brand = brandId ? getBrand(brandId) : null;
  const packs = brandId ? packsForLineAndBrand(line, brandId) : [];

  // Null for a brand with pack tiles but no checklist content of any kind.
  const checklistHref = brandId ? checklistHrefForBrand(brandId) : null;

  const pushState = (nextLine: ProductLine, nextBrand: BrandId | null) => {
    const p = new URLSearchParams(searchParams?.toString());
    p.delete('tab'); // legacy param: read for back-compat, never written
    writeLineParam(p, nextLine);
    if (nextBrand) p.set('brand', nextBrand);
    else p.delete('brand');
    const query = p.toString();
    router.push(query ? `/repacks?${query}` : '/repacks');
  };

  const setLine = (next: ProductLine) =>
    // Keep the current brand if it has tiles on the target line; otherwise
    // land on that line's first brand.
    pushState(next, resolveBrandForLine(next, brandId));

  const setBrand = (next: BrandId) => pushState(line, next);

  // TIER 2. The coin line buckets its long tail behind "Other"; the card lines
  // list their handful of brands flat. Both render through BucketedTabs.
  const primary: BucketTab[] = [
    ...featured.map((b) => ({ id: b.id, label: b.name })),
    ...(hasOther ? [{ id: 'other', label: 'Other' }] : []),
  ];
  const secondary: BucketTab[] = other.map((b) => ({ id: b.id, label: b.name }));
  const activePrimary = brandId ? bucketForBrand(line, brandId) : '';

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-semibold">Packs</h1>
        <p className="mt-3 text-lg text-slate-300 max-w-3xl mx-auto">
          Browse repacks by brand — every series is backed by a published checklist.
        </p>

        {/* TIER 1 — product line. Always all three, even an empty one. */}
        <div className="mt-6 flex justify-center">
          <ProductLineTabs value={line} onChange={setLine} />
        </div>

        {/* TIER 2 — brand, scoped to the selected line. */}
        {primary.length > 0 && (
          <div className="mt-4">
            <BucketedTabs
              ariaLabel="Brand"
              primary={primary}
              activePrimary={activePrimary}
              onPrimary={(id) => {
                if (id === 'other') setBrand(other[0]?.id ?? (brandId as BrandId));
                else setBrand(id as BrandId);
              }}
              bucketId="other"
              secondary={secondary}
              activeSecondary={brandId}
              onSecondary={(id) => setBrand(id as BrandId)}
              emptyLabel="No other brands on this line."
            />
          </div>
        )}
      </div>

      {/* A line with no packs at all stays selectable and says so. */}
      {brand === null ? (
        <div className="rounded-lg border border-slate-700 bg-slate-900/40 py-16 text-center">
          <div className="mb-4 text-6xl">🃏</div>
          <h2 className="mb-2 text-2xl font-bold text-slate-200">
            {lineLabel(line)} coming soon
          </h2>
          <p className="text-slate-400">
            No {lineLabel(line).toLowerCase()} packs are available yet — check back soon.
          </p>
        </div>
      ) : (
        <>
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
        </>
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
