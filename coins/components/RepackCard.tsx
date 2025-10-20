import Image from 'next/image';

type RepackCardProps = {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
  coinCount: string;
  metalType: string;
  availability: string;
};

export function RepackCard({ 
  name, 
  price, 
  description, 
  image, 
  coinCount, 
  metalType, 
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
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            availability === 'Limited' 
              ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
              : 'bg-green-500/20 text-green-300 border border-green-500/30'
          }`}>
            {availability}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-slate-200">{name}</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-gold">{price}</div>
            <div className="text-sm text-slate-400">{coinCount}</div>
          </div>
        </div>
        
        <p className="text-slate-300 mb-4 line-clamp-3">{description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`inline-block h-3 w-3 rounded-full ${
              metalType === 'Gold' ? 'bg-gold' : 
              metalType === 'Silver' ? 'bg-silver' : 
              'bg-gradient-to-r from-gold to-silver'
            }`} />
            <span className="text-sm font-medium text-slate-300">{metalType}</span>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-slate-400">Showcase Only</div>
            <div className="text-xs text-slate-500">Not for sale</div>
          </div>
        </div>
      </div>
    </div>
  );
}
