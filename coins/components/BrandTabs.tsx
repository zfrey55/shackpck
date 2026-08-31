'use client';

/**
 * The BrandTabs tab bar that used to live here was removed with the
 * three-tier nav: /repacks now renders its brand tier through the shared
 * BucketedTabs, the same component /checklist uses. BrandHeader is the only
 * surviving export and is still rendered under the brand tier.
 */

import Image from 'next/image';
import type { Brand } from '@/lib/brands';

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
