import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type RepackCardProps = {
  id: string;
  name: string;
  description: string;
  image: string;
  coinCount: string;
  category: string;
};

export function RepackCard({ 
  id,
  name, 
  description, 
  image, 
  coinCount, 
  category
}: RepackCardProps) {
  const isCoinwave = id.startsWith('coinwave-');
  const isXtreme = id === 'shackpack-xtreme';
  const isDeluxe = id === 'shackpack-deluxe';

  let imageClass =
    'object-cover transition-transform duration-500 will-change-transform ';
  if (isCoinwave) {
    // Wider artwork (e.g. 16:9): zoom so the card crops like a square hero
    imageClass += 'scale-[1.32] group-hover:scale-[1.4] ';
  } else if (isXtreme) {
    imageClass += 'scale-[1.45] group-hover:scale-[1.52] ';
  } else {
    imageClass += 'group-hover:scale-105 ';
  }

  const imageStyle: CSSProperties | undefined = isDeluxe
    ? { objectPosition: 'center 70%' }
    : isCoinwave || isXtreme
      ? { objectPosition: 'center center' }
      : undefined;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40 shadow-sm transition-all duration-300 hover:border-slate-700 hover:shadow-glow">
      <div className="relative aspect-[4/3] w-full bg-slate-950 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={imageClass}
          style={imageStyle}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>
      
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-slate-200 mb-2">{name}</h3>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span>{coinCount}</span>
            <span>•</span>
            <span>{category}</span>
          </div>
        </div>
        
        <p className="text-slate-300 mb-4 line-clamp-3">{description}</p>
        
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
