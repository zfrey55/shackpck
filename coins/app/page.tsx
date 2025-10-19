import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/components/ProductCard';

export default function HomePage() {
  return (
    <main>
      <section className="relative">
        <div className="relative h-[46vh] min-h-[320px] w-full overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1641936500042-f6d3cf1fd8f8?q=80&w=2400&auto=format&fit=crop"
            alt="Gold and silver coins hero"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div className="container absolute inset-0 flex items-end pb-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-black/30 px-3 py-1 text-sm text-slate-200/80 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-gold shadow-glow" />
                Invest in Gold & Silver
              </div>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                Premium Collectible Coins
              </h1>
              <p className="mt-2 max-w-prose text-slate-200/90">Bullion, proofs, and rare mints curated for quality.</p>
              <div className="mt-6 flex gap-4">
                <Link href="/shop" className="rounded-md bg-gold px-5 py-2.5 font-medium text-black hover:opacity-90">Shop Coins</Link>
                <Link href="/about" className="rounded-md border border-slate-700 px-5 py-2.5 font-medium hover:border-slate-600">About Us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <h2 className="text-2xl font-semibold">Featured Coins</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              slug: '2024-gold-eagle-1oz',
              title: '2024 American Gold Eagle 1 oz',
              price: '$2,423',
              primaryImageUrl: 'https://images.unsplash.com/photo-1611078489935-0cb9649b008c?q=80&w=1200&auto=format&fit=crop',
              secondaryImageUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=1200&auto=format&fit=crop'
            },
            {
              slug: '2023-silver-maple-1oz',
              title: '2023 Canadian Silver Maple Leaf 1 oz',
              price: '$34',
              primaryImageUrl: 'https://images.unsplash.com/photo-1608472714553-9fa1a8f2c2af?q=80&w=1200&auto=format&fit=crop',
              secondaryImageUrl: 'https://images.unsplash.com/photo-1547394765-185e1e68c2c5?q=80&w=1200&auto=format&fit=crop'
            },
            {
              slug: '1907-st-gaudens',
              title: '1907 Saint-Gaudens Double Eagle',
              price: '$18,500',
              primaryImageUrl: 'https://images.unsplash.com/photo-1601572600994-9f4558f5f50b?q=80&w=1200&auto=format&fit=crop',
              secondaryImageUrl: 'https://images.unsplash.com/photo-1611078489982-4bbf9d78e07f?q=80&w=1200&auto=format&fit=crop'
            }
          ].map((p) => (
            <ProductCard key={p.slug} {...p} />
          ))}
        </div>
      </section>
    </main>
  );
}


