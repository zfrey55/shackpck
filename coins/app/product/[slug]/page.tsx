"use client";
import Image from 'next/image';
import { useState } from 'react';

const images = [
  'https://images.unsplash.com/photo-1611078489935-0cb9649b008c?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1611078489982-4bbf9d78e07f?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1601572600994-9f4558f5f50b?q=80&w=1600&auto=format&fit=crop'
];

export default function ProductPage() {
  const [index, setIndex] = useState(0);
  return (
    <main className="container py-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40">
            <Image
              src={images[index]}
              alt="Coin image"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {images.map((src, i) => (
              <button key={src} onClick={() => setIndex(i)} className={`relative aspect-square overflow-hidden rounded border ${i === index ? 'border-gold' : 'border-slate-800'} hover:border-slate-700`}>
                <Image src={src} alt="Thumbnail" fill sizes="25vw" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
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


