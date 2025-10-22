import Image from 'next/image';
import { RepackCard } from '@/components/RepackCard';

// TODO: Replace placeholder images with actual pack photos in /public/images/packs/
const repacks = [
  {
    id: 'shack-pack-starter',
    name: 'Shackpack Starter',
    description: 'Perfect starter pack featuring a curated selection of premium trading cards from various sports.',
    image: 'https://images.unsplash.com/photo-1611953694403-44b588b5aea3?w=800&auto=format&fit=crop',
    cardCount: '15-20 cards',
    category: 'Multi-Sport',
    availability: 'Out of Stock'
  },
  {
    id: 'shack-pack-deluxe',
    name: 'Shackpack Deluxe',
    description: 'Premium selection with higher grade cards and rare finds from top athletes.',
    image: 'https://images.unsplash.com/photo-1628744876497-eb30460be9f6?w=800&auto=format&fit=crop',
    cardCount: '25-30 cards',
    category: 'Multi-Sport',
    availability: 'Out of Stock'
  },
  {
    id: 'shack-pack-xtreme',
    name: 'Shackpack X-Treme',
    description: 'Extreme value pack with premium cards and exclusive rookie selections.',
    image: 'https://images.unsplash.com/photo-1624378440070-e123f7c3c2ba?w=800&auto=format&fit=crop',
    cardCount: '30-40 cards',
    category: 'Multi-Sport',
    availability: 'Out of Stock'
  },
  {
    id: 'shack-pack-elite',
    name: 'Shackpack Elite',
    description: 'Elite collection featuring guaranteed autographs and numbered parallels.',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop',
    cardCount: '20-25 cards',
    category: 'Premium',
    availability: 'Out of Stock'
  }
];

export default function RepacksPage() {
  return (
    <main className="container py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold">Trading Card Repacks</h1>
        <p className="mt-4 text-xl text-slate-300 max-w-3xl mx-auto">
          Curated collections of premium trading cards, carefully selected for quality and value. 
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
            <p className="text-sm text-slate-400 mt-2">Each card is hand-selected by experienced collectors</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="font-semibold text-gold">Value Focused</h3>
            <p className="text-sm text-slate-400 mt-2">Packs designed to maximize excitement and value</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="font-semibold text-gold">Authenticity Guaranteed</h3>
            <p className="text-sm text-slate-400 mt-2">All cards verified for authenticity and condition</p>
          </div>
        </div>
      </div>
    </main>
  );
}
