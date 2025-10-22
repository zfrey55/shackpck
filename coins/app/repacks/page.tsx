import Image from 'next/image';
import { RepackCard } from '@/components/RepackCard';

// TODO: Replace placeholder images with actual pack photos in /public/images/packs/
// Change image URLs to: /images/packs/shackpack-starter.jpg (etc.)
const repacks = [
  {
    id: 'shack-pack-starter',
    name: 'Shackpack Starter',
    description: 'Perfect starter pack featuring a curated selection of premium gold and silver coins.',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop',
    cardCount: '15-20 coins',
    category: 'Mixed Metals',
    availability: 'Out of Stock'
  },
  {
    id: 'shack-pack-deluxe',
    name: 'Shackpack Deluxe',
    description: 'Premium selection with higher grade coins and rare collectible finds.',
    image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop',
    cardCount: '25-30 coins',
    category: 'Premium Grade',
    availability: 'Out of Stock'
  },
  {
    id: 'shack-pack-xtreme',
    name: 'Shackpack X-Treme',
    description: 'Extreme value pack with premium coins and exclusive rare selections.',
    image: 'https://images.unsplash.com/photo-1622182726803-bae8b8c3a01a?w=800&auto=format&fit=crop',
    cardCount: '30-40 coins',
    category: 'High Value',
    availability: 'Out of Stock'
  },
  {
    id: 'shack-pack-elite',
    name: 'Shackpack Elite',
    description: 'Elite collection featuring guaranteed rare coins and certified numismatic pieces.',
    image: 'https://images.unsplash.com/photo-1621416894627-36c0f32e3fc3?w=800&auto=format&fit=crop',
    cardCount: '20-25 coins',
    category: 'Elite Collection',
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
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-red-700/60 bg-red-900/20 px-4 py-2 text-sm text-red-300">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Currently Out of Stock - Check Back Soon!
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
