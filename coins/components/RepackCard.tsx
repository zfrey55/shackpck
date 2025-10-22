import Image from 'next/image';

type RepackCardProps = {
  id: string;
  name: string;
  description: string;
  image: string;
  cardCount: string;
  category: string;
  availability: string;
};

export function RepackCard({ 
  name, 
  description, 
  image, 
  cardCount, 
  category,
  availability 
}: RepackCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40 shadow-sm transition-all duration-300 hover:border-slate-700 hover:shadow-glow">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-4 right-4">
          <span className="rounded-full px-3 py-1 text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
            {availability}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-slate-200 mb-2">{name}</h3>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span>{cardCount}</span>
            <span>•</span>
            <span>{category}</span>
          </div>
        </div>
        
        <p className="text-slate-300 mb-4 line-clamp-3">{description}</p>
        
        <div className="text-center pt-3 border-t border-slate-700/50">
          <div className="text-sm font-medium text-red-400">Currently Unavailable</div>
          <div className="text-xs text-slate-500 mt-1">Check back for restock updates</div>
        </div>
      </div>
    </div>
  );
}
