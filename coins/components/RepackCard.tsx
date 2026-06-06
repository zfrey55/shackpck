import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PackImagePlaceholder } from '@/components/PackImagePlaceholder';

type RepackCardProps = {
  id: string;
  name: string;
  description: string;
  /** Pack artwork URL; omit or set usePlaceholder for branded coming-soon art. */
  image: string;
  coinCount: string;
  category: string;
  /** When true, shows branded placeholder instead of loading image URL. */
  usePlaceholder?: boolean;
};

export function RepackCard({ 
  id,
  name, 
  description, 
  image, 
  coinCount, 
  category,
  usePlaceholder = false,
}: RepackCardProps) {
  const showPlaceholder = usePlaceholder || !image;
  const isCoinwave = id.startsWith('coinwave-');
  const isXtreme = id === 'shackpack-xtreme';
  const isDeluxe = id === 'shackpack-deluxe';
  // Tall portrait pack mockups for card product lines — use object-contain so
  // the full pack shows without cropping the top/bottom of the box.
  const isCardPack =
    id === 'shackpack-fusion' ||
    id === 'shackpack-select' ||
    id === 'shackpack-nova' ||
    id === 'shackpack-inception';

  let imageClass =
    (isCardPack ? 'object-contain ' : 'object-cover ') +
    'transition-transform duration-500 will-change-transform ';
  if (isCoinwave) {
    // Wide artwork: slight zoom-out; anchor to top so the upper portion of the art is visible
    imageClass += 'origin-top scale-[0.92] group-hover:scale-[0.97] ';
  } else if (isXtreme) {
    imageClass += 'scale-[1.45] group-hover:scale-[1.52] ';
  } else if (isCardPack) {
    imageClass += 'group-hover:scale-[1.03] ';
  } else {
    imageClass += 'group-hover:scale-105 ';
  }

  const imageStyle: CSSProperties | undefined = isDeluxe
    ? { objectPosition: 'center 70%' }
    : isXtreme
      ? { objectPosition: 'center center' }
      : isCoinwave
        ? { objectPosition: 'center top' }
        : undefined;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40 shadow-sm transition-all duration-300 hover:border-slate-700 hover:shadow-glow">
      <div className="relative aspect-[4/3] w-full bg-slate-950 overflow-hidden">
        {showPlaceholder ? (
          <PackImagePlaceholder />
        ) : (
          <>
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={imageClass}
              style={imageStyle}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </>
        )}
      </div>
      
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-slate-200 mb-2">{name}</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
            {/* Coin packs always show their coinCount badge. Card packs only
                show it when explicitly set (e.g. Nova / Inception publish
                "10 cards per series"; Fusion / Select leave it blank). */}
            {(!isCardPack || coinCount) && (
              <>
                <span>{coinCount}</span>
                <span className="text-slate-600">•</span>
              </>
            )}
            <span>{category}</span>
          </div>
        </div>
        
        <p className="text-slate-300 mb-4 text-sm leading-relaxed">{description}</p>
        
        <div className="pt-3 border-t border-slate-700/50">
          <Link
            href="/contact"
            className="block w-full text-center px-4 py-2 bg-gold/10 border border-gold/30 text-gold rounded-lg hover:bg-gold/20 transition-colors font-medium"
          >
            Contact for Price
          </Link>
        </div>
      </div>
    </div>
  );
}
