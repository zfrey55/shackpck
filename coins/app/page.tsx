'use client';

import Link from 'next/link';
import Image from 'next/image';
import { RepackCard } from '@/components/RepackCard';
import { FeaturedSeriesSection } from '@/components/FeaturedSeriesSection';
import { getHomeFeaturedPacks } from '@/lib/repack-catalog';
import { CARD_REPACK_CATALOG } from '@/lib/card-repack-catalog';
import { BRANDS } from '@/lib/brands';

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
                Premium Coin & Card Repacks
              </p>
              <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
                Graded coins and multi-sport cards — American Eagles, Morgan Dollars, NFL, NBA &amp; MLB rookies, all with published checklists
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Link
                  href="/repacks?brand=shackpack"
                  className="rounded-md bg-gold px-5 py-3 font-semibold text-black hover:opacity-90 transition-opacity"
                >
                  Coin Repacks
                </Link>
                <Link
                  href="/repacks?brand=shackpack&tab=cards"
                  className="rounded-md bg-gold/90 px-5 py-3 font-semibold text-black hover:opacity-90 transition-opacity"
                >
                  Card Repacks
                </Link>
                <Link 
                  href="/checklist" 
                  className="rounded-md border-2 border-white px-5 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  View Checklists
                </Link>
                <Link
                  href="/build"
                  className="rounded-md border-2 border-gold/80 px-5 py-3 font-semibold text-gold hover:bg-gold/10 transition-colors"
                >
                  Custom build
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by brand */}
      <section className="container py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold">Shop by Brand</h2>
          <p className="mt-3 text-lg text-slate-400">
            Each customer has their own branded packs and checklists
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {BRANDS.map((brand) => (
            <Link
              key={brand.id}
              href={`/repacks?brand=${brand.id}`}
              className="rounded-full border border-slate-700 bg-slate-900/60 px-6 py-3 font-semibold text-slate-200 transition-colors hover:border-gold/60 hover:text-gold"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Series Section */}
      <FeaturedSeriesSection />

      {/* Coin Repacks — featured (unchanged catalog) */}
      <section className="container py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold">Coin Repacks</h2>
          <p className="mt-3 text-lg text-slate-400">
            Featured graded coin repack collections
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {getHomeFeaturedPacks().map((pack) => (
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
            href="/repacks?brand=shackpack"
            className="inline-flex items-center gap-2 text-gold hover:underline font-medium"
          >
            View all coin repacks
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Card Repacks */}
      <section className="container pb-16 pt-0">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold">Card Repacks</h2>
          <p className="mt-3 text-lg text-slate-400">
            Multi-sport card series — Fusion, Nova, Select &amp; Inception. 10 cards per product.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARD_REPACK_CATALOG.map((pack) => (
            <RepackCard
              key={pack.id}
              id={pack.id}
              name={pack.name}
              description={pack.description}
              image={pack.image}
              coinCount={pack.coinCount}
              category={pack.category}
              usePlaceholder={pack.usePlaceholder}
            />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/repacks?brand=shackpack&tab=cards"
            className="inline-flex items-center gap-2 text-gold hover:underline font-medium"
          >
            View all card repacks
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
                Each pack is carefully assembled with hand-picked coins and graded cards selected by experienced specialists
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="font-semibold text-xl text-gold mb-2">Quality Guaranteed</h3>
              <p className="text-slate-400">
                Every item is verified for authenticity and condition before being added to our packs
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="font-semibold text-xl text-gold mb-2">Published Checklists</h3>
              <p className="text-slate-400">
                Every ShackPack is a professionally sealed, graded coin or card product with a fully published checklist. Know what&apos;s possible before you buy — then open and see what you get.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
