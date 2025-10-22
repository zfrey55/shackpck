import Image from 'next/image';
import { RepackCard } from '@/components/RepackCard';

const repacks = [
  {
    id: 'shackpack-starter',
    name: 'Shackpack Starter',
    description: 'Perfect starter pack featuring a curated selection of premium gold and silver coins.',
    image: '/images/packs/shackpack-starter.jpg',
    cardCount: '15-20 coins',
    category: 'Mixed Metals',
    availability: 'Out of Stock'
  },
  {
    id: 'shackpack-deluxe',
    name: 'Shackpack Deluxe',
    description: 'Premium selection with higher grade coins and rare collectible finds.',
    image: '/images/packs/shackpack-deluxe.jpg',
    cardCount: '25-30 coins',
    category: 'Premium Grade',
    availability: 'Out of Stock'
  },
  {
    id: 'shackpack-xtreme',
    name: 'Shackpack X-Treme',
    description: 'Extreme value pack with premium coins and exclusive rare selections.',
    image: '/images/packs/shackpack-xtreme.jpg',
    cardCount: '30-40 coins',
    category: 'High Value',
    availability: 'Out of Stock'
  },
  {
    id: 'shackpack-transcendent',
    name: 'Shackpack Transcendent',
    description: 'Transcendent collection featuring museum-quality coins and exceptional rarities.',
    image: '/images/packs/shackpack-transcendent.jpg',
    cardCount: '20-25 coins',
    category: 'Elite Collection',
    availability: 'Out of Stock'
  },
  {
    id: 'shackpack-unleashed',
    name: 'Shackpack Unleashed',
    description: 'Unleashed excitement with incredible variety and guaranteed premium pieces.',
    image: '/images/packs/shackpack-unleashed.jpg',
    cardCount: '35-45 coins',
    category: 'Ultimate Value',
    availability: 'Out of Stock'
  },
  {
    id: 'shackpack-resurgence',
    name: 'Shackpack Resurgence',
    description: 'Resurgence pack featuring classic coins with renewed collector interest.',
    image: '/images/packs/shackpack-resurgence.jpg',
    cardCount: '25-30 coins',
    category: 'Classic Collection',
    availability: 'Out of Stock'
  }
];

export default function RepacksPage() {
  return (
    <main className="container py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold">Gold & Silver Coin Repacks</h1>
        <p className="mt-4 text-xl text-slate-300 max-w-3xl mx-auto">
          Curated collections of premium coins, carefully selected for quality and value. 
          Each pack is assembled by experts to provide the best collecting experience.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {repacks.map((repack) => (
          <RepackCard key={repack.id} {...repack} />
        ))}
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
            <div className="text-4xl mb-3">📈</div>
            <h3 className="font-semibold text-gold">Value Focused</h3>
            <p className="text-sm text-slate-400 mt-2">Packs designed to maximize excitement and value</p>
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
