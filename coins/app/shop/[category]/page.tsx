import { ProductCard } from '@/components/ProductCard';

export function generateStaticParams() {
  return [
    { category: 'gold' },
    { category: 'silver' },
    { category: 'rare' }
  ];
}

const sample = [
  {
    slug: 'sample-gold-1',
    title: 'Gold Proof Coin 1 oz',
    price: '$2,199',
    primaryImageUrl: 'https://images.unsplash.com/photo-1611078489935-0cb9649b008c?q=80&w=1200&auto=format&fit=crop',
    secondaryImageUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=1200&auto=format&fit=crop'
  },
  {
    slug: 'sample-silver-1',
    title: 'Silver Bullion Coin 1 oz',
    price: '$32',
    primaryImageUrl: 'https://images.unsplash.com/photo-1608472714553-9fa1a8f2c2af?q=80&w=1200&auto=format&fit=crop',
    secondaryImageUrl: 'https://images.unsplash.com/photo-1547394765-185e1e68c2c5?q=80&w=1200&auto=format&fit=crop'
  }
];

export default function CategoryPage({ params }: { params: { category: string } }) {
  const title = params.category?.[0]?.toUpperCase() + params.category?.slice(1);
  return (
    <main className="container py-10">
      <h1 className="text-3xl font-semibold">{title} Coins</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sample.map((p) => (
          <ProductCard key={p.slug} {...p} />
        ))}
      </div>
    </main>
  );
}


