import Link from 'next/link';
import Image from 'next/image';
import { RepackCard } from '@/components/RepackCard';

const featuredPacks = [
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

export default function HomePage() {
  return (
    <main>
      {/* Hero Banner Section */}
      <section className="relative">
        <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=2400&auto=format&fit=crop"
            alt="Shackpack Gold and Silver Coins"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Hero content */}
          <div className="container absolute inset-0 flex items-center justify-center text-center">
            <div className="max-w-4xl">
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl text-white drop-shadow-lg">
                Shackpack
              </h1>
              <p className="mt-4 text-2xl text-white/90 drop-shadow-md">
                Premium Gold & Silver Coin Repacks
              </p>
              <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
                Expertly curated collections featuring the best gold and silver coins and collectibles
              </p>
              <div className="mt-8 flex gap-4 justify-center">
                <Link 
                  href="/repacks" 
                  className="rounded-md bg-gold px-6 py-3 font-semibold text-black hover:opacity-90 transition-opacity"
                >
                  View All Packs
                </Link>
                <Link 
                  href="/checklist" 
                  className="rounded-md border-2 border-white px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  View Coin Lists
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Packs Section */}
      <section className="container py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold">Featured Packs</h2>
          <p className="mt-3 text-lg text-slate-400">
            Discover our most popular coin repack collections
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPacks.map((pack) => (
            <RepackCard 
              key={pack.id}
              id={pack.id}
              name={pack.name}
              description={pack.description}
              image={pack.image}
              cardCount={pack.cardCount}
              category={pack.category}
              availability={pack.availability}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            href="/repacks" 
            className="inline-flex items-center gap-2 text-gold hover:underline font-medium"
          >
            View All Packs
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-slate-900/40 py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold">Why Choose Shackpack?</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-semibold text-xl text-gold mb-2">Expert Curation</h3>
              <p className="text-slate-400">
                Each pack is carefully assembled with hand-picked coins selected by experienced numismatists
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="font-semibold text-xl text-gold mb-2">Quality Guaranteed</h3>
              <p className="text-slate-400">
                Every coin is verified for authenticity and condition before being added to our packs
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="font-semibold text-xl text-gold mb-2">Exciting Value</h3>
              <p className="text-slate-400">
                Experience the thrill of opening packs filled with potential rare coins, gold, silver, and more
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
