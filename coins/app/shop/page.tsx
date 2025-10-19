import Link from 'next/link';

const categories = [
  { slug: 'gold', name: 'Gold Coins' },
  { slug: 'silver', name: 'Silver Coins' },
  { slug: 'rare', name: 'Rare / Collectible' }
];

export default function ShopPage() {
  return (
    <main className="container py-10">
      <h1 className="text-3xl font-semibold">Shop Coins</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {categories.map((c) => (
          <Link key={c.slug} href={`/shop/${c.slug}`} className="rounded-lg border border-slate-800 p-6 hover:border-slate-700">
            <div className="text-lg font-medium">{c.name}</div>
            <p className="mt-1 text-sm text-slate-400">Explore {c.name.toLowerCase()}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}


