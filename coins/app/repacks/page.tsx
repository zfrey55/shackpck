import Image from 'next/image';
import { RepackCard } from '@/components/RepackCard';

const repacks = [
  {
    id: 'premium-gold-pack',
    name: 'Premium Gold Pack',
    price: '$2,500',
    description: 'Curated selection of premium gold coins including Eagles, Maple Leafs, and rare finds.',
    image: 'https://images.unsplash.com/photo-1611078489935-0cb9649b008c?q=80&w=1200&auto=format&fit=crop',
    coinCount: '5-7 coins',
    metalType: 'Gold',
    availability: 'Limited'
  },
  {
    id: 'silver-starter-pack',
    name: 'Silver Starter Pack',
    price: '$150',
    description: 'Perfect introduction to silver collecting with government and private mint coins.',
    image: 'https://images.unsplash.com/photo-1608472714553-9fa1a8f2c2af?q=80&w=1200&auto=format&fit=crop',
    coinCount: '8-10 coins',
    metalType: 'Silver',
    availability: 'In Stock'
  },
  {
    id: 'mixed-precious-pack',
    name: 'Mixed Precious Metals Pack',
    price: '$800',
    description: 'Diverse collection featuring both gold and silver coins from various mints worldwide.',
    image: 'https://images.unsplash.com/photo-1601572600994-9f4558f5f50b?q=80&w=1200&auto=format&fit=crop',
    coinCount: '6-8 coins',
    metalType: 'Mixed',
    availability: 'In Stock'
  },
  {
    id: 'rare-collector-pack',
    name: 'Rare Collector Pack',
    price: '$5,000',
    description: 'Exclusive pack containing rare and collectible coins with historical significance.',
    image: 'https://images.unsplash.com/photo-1611078489982-4bbf9d78e07f?q=80&w=1200&auto=format&fit=crop',
    coinCount: '3-5 coins',
    metalType: 'Mixed',
    availability: 'Limited'
  }
];

export default function RepacksPage() {
  return (
    <main className="container py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold">Coin Repacks</h1>
        <p className="mt-4 text-xl text-slate-300 max-w-3xl mx-auto">
          Curated collections of premium coins, carefully selected for quality and value. 
          Each pack is assembled by our experts to provide the best collecting experience.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-800/30 px-4 py-2 text-sm text-slate-300">
          <span className="h-2 w-2 rounded-full bg-gold shadow-glow" />
          Showcase Only - Not Available for Purchase
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
        {repacks.map((repack) => (
          <RepackCard key={repack.id} {...repack} />
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Why Choose Our Repacks?</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-semibold text-gold">Expert Curation</h3>
            <p className="text-sm text-slate-400 mt-2">Each coin is hand-selected by numismatic experts</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="font-semibold text-gold">Value Focused</h3>
            <p className="text-sm text-slate-400 mt-2">Packs designed for long-term appreciation</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="font-semibold text-gold">Authenticity Guaranteed</h3>
            <p className="text-sm text-slate-400 mt-2">All coins verified for authenticity and condition</p>
          </div>
        </div>
      </div>
    </main>
  );
}
