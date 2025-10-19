import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="container py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 px-3 py-1 text-sm text-slate-200/80">
              <span className="h-2 w-2 rounded-full bg-gold shadow-glow" />
              Under construction — preview shop experience
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
              Premium <span className="text-gold">Gold</span> & <span className="text-silver">Silver</span> Coins
            </h1>
            <p className="mt-4 max-w-prose text-slate-300">
              Curated collectibles with verified quality: bullion, proofs, and rare mints.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/shop" className="rounded-md bg-gold px-5 py-2.5 font-medium text-black hover:opacity-90">Shop Coins</Link>
              <Link href="/about" className="rounded-md border border-slate-700 px-5 py-2.5 font-medium hover:border-slate-600">About Us</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <h2 className="text-2xl font-semibold">Shop by Category</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { href: '/shop/gold', label: 'Gold Coins', accent: 'text-gold' },
            { href: '/shop/silver', label: 'Silver Coins', accent: 'text-silver' },
            { href: '/shop/rare', label: 'Rare / Collectible', accent: 'text-slate-200' }
          ].map((c) => (
            <Link key={c.href} href={c.href} className="rounded-lg border border-slate-700 p-6 hover:border-slate-600">
              <div className="text-lg font-medium">
                <span className={c.accent}>{c.label}</span>
              </div>
              <p className="mt-1 text-sm text-slate-400">Explore curated selections</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}


