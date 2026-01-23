import Link from 'next/link';
import Image from 'next/image';
import { RepackCard } from '@/components/RepackCard';

const featuredPacks = [
  {
    id: 'reign',
    name: 'Reign by Shackpack',
    description: 'Contents may vary by date. Please refer to the checklist for the most up-to-date information on coin contents.',
    image: '/images/packs/shackpack-reign.png',
    coinCount: '10 coins total',
    category: '1/10 oz Gold'
  },
  {
    id: 'prominence',
    name: 'Prominence by Shackpack',
    description: 'Contents may vary by date. Please refer to the checklist for the most up-to-date information on coin contents.',
    image: '/images/packs/shackpack-prominence.png',
    coinCount: '10 coins total',
    category: '1/4 oz Platinum'
  },
  {
    id: 'apex',
    name: 'Apex by Shackpack',
    description: 'Contents may vary by date. Please refer to the checklist for the most up-to-date information on coin contents.',
    image: '/images/packs/shackpack-apex.png',
    coinCount: '10 coins total',
    category: '1/4 oz Gold'
  },
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
    id: 'shackpack-transcendent-transformed',
    name: 'ShackPack Transcendent Transformed',
    description: 'Contains two 1 oz gold coins and 8 varied silver coins. Our ultimate transformed pack featuring two full troy ounces of gold.',
    image: '/images/packs/shackpack-transcscendenttransformed.jpeg',
    coinCount: '10 coins total',
    category: '2x 1 oz Gold'
  },
  {
    id: 'shackpack-ignite',
    name: 'ShackPack Ignite',
    description: 'Contains one 1/4 oz platinum coin and 9 varied silver coins. Exclusive platinum edition for discerning collectors.',
    image: '/images/packs/shackpack-ignite.PNG',
    coinCount: '10 coins total',
    category: '1/4 oz Platinum'
  },
  {
    id: 'shackpack-eclipse',
    name: 'ShackPack Eclipse',
    description: 'Contains one 1 oz platinum coin and 9 varied silver coins. Ultimate platinum pack featuring a full troy ounce of platinum.',
    image: '/images/packs/shackpack-eclipse.PNG',
    coinCount: '10 coins total',
    category: '1 oz Platinum'
  },
  {
    id: 'shackpack-radiant',
    name: 'ShackPack Radiant',
    description: 'Contains one 1/2 oz platinum coin and 9 varied silver coins.',
    image: '/images/packs/shackpack-radiant.PNG',
    coinCount: '10 coins total',
    category: '1/2 oz Platinum'
  },
  {
    id: 'currencyclash',
    name: 'Currency Clash by Shackpack',
    description: 'A dynamic series featuring variable coin combinations that change frequently.',
    image: '/images/packs/shackpack-currencyclash.png',
    coinCount: 'Variable coins',
    category: 'Variable'
  }
];

export default function HomePage() {
  return (
    <main>
      {/* Hero Banner Section - American Silver Eagles, Gold Eagles, Morgan Dollars */}
      <section className="relative">
        <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
          {/* Updated to show Morgan Dollars, American Silver Eagles, and Gold Eagles */}
          <Image
            src="https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=2400&auto=format&fit=crop"
            alt="American Silver Eagles, Gold Eagles, and Morgan Dollars"
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
                Featuring American Eagles, Morgan Dollars, and premium certified coins
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
              coinCount={pack.coinCount}
              category={pack.category}
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
