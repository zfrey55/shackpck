import { ProductGallery } from '@/components/ProductGallery';

// Static sample slugs for export. Replace with real data source later.
export function generateStaticParams() {
  return [
    { slug: '2024-gold-eagle-1oz' },
    { slug: '2023-silver-maple-1oz' },
    { slug: '1907-st-gaudens' }
  ];
}

const images = [
  'https://images.unsplash.com/photo-1611078489935-0cb9649b008c?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1611078489982-4bbf9d78e07f?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1601572600994-9f4558f5f50b?q=80&w=1600&auto=format&fit=crop'
];

export default function ProductPage() {
  return (
    <main className="container py-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={images} />
        <div>
          <h1 className="text-2xl font-semibold">American Gold Eagle 1 oz</h1>
          <div className="mt-2 text-xl font-bold text-gold">$2,423</div>
          <p className="mt-4 max-w-prose text-slate-300">Year: 2024 • Weight: 1 oz • Purity: .9167 gold</p>
          <div className="mt-6">
            <button className="rounded-md bg-gold px-5 py-2.5 font-medium text-black hover:opacity-90">Add to Cart</button>
          </div>
        </div>
      </div>
    </main>
  );
}


