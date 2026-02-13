import Image from 'next/image';
import Link from 'next/link';

interface SeriesCardProps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  pricePerPack: number;
  packsRemaining: number;
  totalPacks: number;
  isActive: boolean;
}

export function SeriesCard({
  name,
  slug,
  description,
  images,
  pricePerPack,
  packsRemaining,
  totalPacks,
  isActive,
}: SeriesCardProps) {
  const imageUrl = images[0] || '/images/packs/shackpack-starter.jpg';
  const price = (pricePerPack / 100).toFixed(2);
  const soldPercentage = ((totalPacks - packsRemaining) / totalPacks) * 100;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40 shadow-sm transition-all duration-300 hover:border-slate-700 hover:shadow-glow">
      <div className="relative aspect-[4/3] w-full bg-slate-950">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        {!isActive && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-xl font-semibold text-white">Sold Out</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-slate-200 mb-2">{name}</h3>
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>${price} per pack</span>
            <span className="text-gold font-semibold">
              {packsRemaining} / {totalPacks} packs left
            </span>
          </div>
          {description && (
            <p className="text-slate-300 mb-4 line-clamp-3">{description}</p>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-gold h-2 rounded-full transition-all"
              style={{ width: `${soldPercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {soldPercentage.toFixed(0)}% sold
          </p>
        </div>

        <div className="pt-3 border-t border-slate-700/50">
          {isActive && packsRemaining > 0 ? (
            <Link
              href={`/series/${slug}`}
              className="block w-full text-center px-4 py-2 bg-gold text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Buy Packs
            </Link>
          ) : (
            <button
              disabled
              className="block w-full text-center px-4 py-2 bg-slate-700 text-slate-400 rounded-lg cursor-not-allowed font-medium"
            >
              Sold Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
