"use client";
import Image from 'next/image';
import { useState } from 'react';

export function ProductGallery({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  return (
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
  );
}


