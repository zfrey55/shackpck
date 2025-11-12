import Image from 'next/image';
import { RepackCard } from '@/components/RepackCard';

const repacks = [
  {
    id: 'shackpack',
    name: 'ShackPack',
    description: 'Contains one 1/10 oz gold coin and 9 varied silver coins. Perfect entry into premium coin collecting.',
    image: '/images/packs/shackpack-starter.jpg',
    coinCount: '10 coins total',
    category: '1/10 oz Gold'
  },
  {
    id: 'shackpack-deluxe',
    name: 'ShackPack Deluxe',
    description: 'Contains two 1/10 oz gold coins and 8 varied silver coins. Enhanced gold content for serious collectors.',
    image: '/images/packs/shackpack-deluxe.jpg',
    coinCount: '10 coins total',
    category: '2x 1/10 oz Gold'
  },
  {
    id: 'shackpack-xtreme',
    name: 'ShackPack Xtreme',
    description: 'Contains one 1/4 oz gold coin and 9 varied silver coins. Increased gold weight with premium selections.',
    image: '/images/packs/shackpack-xtreme.jpg',
    coinCount: '10 coins total',
    category: '1/4 oz Gold'
  },
  {
    id: 'shackpack-unleashed',
    name: 'ShackPack Unleashed',
    description: 'Contains two 1/4 oz gold coins and 8 varied silver coins. Double the gold for maximum impact.',
    image: '/images/packs/shackpack-unleashed.jpg',
    coinCount: '10 coins total',
    category: '2x 1/4 oz Gold'
  },
  {
    id: 'shackpack-resurgence',
    name: 'ShackPack Resurgence',
    description: 'Contains one 1/2 oz gold coin and 9 varied silver coins. Substantial gold content with diverse silver pieces.',
    image: '/images/packs/shackpack-resurgence.jpg',
    coinCount: '10 coins total',
    category: '1/2 oz Gold'
  },
  {
    id: 'shackpack-transcendent',
    name: 'ShackPack Transcendent',
    description: 'Contains one 1 oz gold coin and 9 varied silver coins. Our ultimate pack featuring a full troy ounce of gold.',
    image: '/images/packs/shackpack-transcendent.jpg',
    coinCount: '10 coins total',
    category: '1 oz Gold'
  },
  {
    id: 'shackpack-ignite',
    name: 'ShackPack Ignite',
    description: 'Contains one 1/4 oz platinum coin and 9 varied silver coins. Exclusive platinum edition for discerning collectors.',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=800&auto=format&fit=crop',
    coinCount: '10 coins total',
    category: '1/4 oz Platinum'
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
