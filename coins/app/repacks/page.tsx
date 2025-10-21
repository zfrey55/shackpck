import Image from 'next/image';
import { RepackCard } from '@/components/RepackCard';

const repacks = [
  {
    id: 'shack-pack',
    name: 'Shack Pack',
    price: '$99',
    description: 'Our signature starter pack featuring a curated selection of quality coins.',
    image: 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Shack+Pack',
    coinCount: '3-5 coins',
    metalType: 'Mixed',
    availability: 'In Stock'
  },
  {
    id: 'shack-pack-deluxe',
    name: 'Shack Pack Deluxe',
    price: '$199',
    description: 'Premium selection with higher grade coins and rare finds.',
    image: 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Shack+Pack+Deluxe',
    coinCount: '5-7 coins',
    metalType: 'Mixed',
    availability: 'In Stock'
  },
  {
    id: 'shack-pack-x-treme',
    name: 'Shack Pack X-Treme',
    price: '$299',
    description: 'Extreme value pack with premium coins and exclusive selections.',
    image: 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Shack+Pack+X-Treme',
    coinCount: '6-8 coins',
    metalType: 'Mixed',
    availability: 'Limited'
  },
  {
    id: 'shack-pack-eclipse',
    name: 'Shack Pack Eclipse',
    price: '$399',
    description: 'Rare and collectible coins with historical significance and premium quality.',
    image: 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Shack+Pack+Eclipse',
    coinCount: '4-6 coins',
    metalType: 'Mixed',
    availability: 'Limited'
  },
  {
    id: 'shack-pack-transcendent',
    name: 'Shack Pack Transcendent',
    price: '$499',
    description: 'Ultra-premium collection featuring the finest coins available.',
    image: 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Shack+Pack+Transcendent',
    coinCount: '3-5 coins',
    metalType: 'Mixed',
    availability: 'Limited'
  },
  {
    id: 'shack-pack-resurgence',
    name: 'Shack Pack Resurgence',
    price: '$349',
    description: 'Revival collection featuring classic designs and modern minting techniques.',
    image: 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Shack+Pack+Resurgence',
    coinCount: '5-7 coins',
    metalType: 'Mixed',
    availability: 'In Stock'
  },
  {
    id: 'shack-pack-x-treme-2',
    name: 'Shack Pack X-Treme',
    price: '$299',
    description: 'Extreme value pack with premium coins and exclusive selections.',
    image: 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Shack+Pack+X-Treme',
    coinCount: '6-8 coins',
    metalType: 'Mixed',
    availability: 'Limited'
  },
  {
    id: 'shack-pack-ignite',
    name: 'Shack Pack Ignite',
    price: '$249',
    description: 'Ignite your collection with this dynamic selection of premium coins.',
    image: 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Shack+Pack+Ignite',
    coinCount: '4-6 coins',
    metalType: 'Mixed',
    availability: 'In Stock'
  },
  {
    id: 'shack-pack-x-treme-unleashed',
    name: 'Shack Pack X-Treme Unleashed',
    price: '$599',
    description: 'The ultimate unleashed experience with the most exclusive coin selections.',
    image: 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Shack+Pack+X-Treme+Unleashed',
    coinCount: '6-8 coins',
    metalType: 'Mixed',
    availability: 'Limited'
  },
  {
    id: 'shack-pack-transcendent-2',
    name: 'Shack Pack Transcendent',
    price: '$499',
    description: 'Ultra-premium collection featuring the finest coins available.',
    image: 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Shack+Pack+Transcendent',
    coinCount: '3-5 coins',
    metalType: 'Mixed',
    availability: 'Limited'
  },
  {
    id: 'shack-pack-transcendent-reformed',
    name: 'Shack Pack Transcendent Reformed',
    price: '$699',
    description: 'Reformed and refined transcendent collection with the highest quality standards.',
    image: 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Shack+Pack+Transcendent+Reformed',
    coinCount: '4-6 coins',
    metalType: 'Mixed',
    availability: 'Limited'
  },
  {
    id: 'shack-pack-lucid',
    name: 'Shack Pack Lucid',
    price: '$449',
    description: 'Crystal clear quality with lucid selections of premium coins.',
    image: 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Shack+Pack+Lucid',
    coinCount: '5-7 coins',
    metalType: 'Mixed',
    availability: 'In Stock'
  },
  {
    id: 'shack-pack-flash',
    name: 'Shack Pack Flash',
    price: '$149',
    description: 'Quick and exciting collection perfect for rapid expansion of your portfolio.',
    image: 'https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Shack+Pack+Flash',
    coinCount: '3-5 coins',
    metalType: 'Mixed',
    availability: 'In Stock'
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
