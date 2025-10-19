"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export type ProductCardProps = {
  slug: string;
  title: string;
  price: string;
  primaryImageUrl: string;
  secondaryImageUrl?: string;
  alt?: string;
};

export function ProductCard({ slug, title, price, primaryImageUrl, secondaryImageUrl, alt }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const displayUrl = hovered && secondaryImageUrl ? secondaryImageUrl : primaryImageUrl;

  return (
    <Link href={`/product/${slug}`} className="group block" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40 shadow-sm transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:shadow-glow">
        <div className="relative aspect-square w-full">
          <Image
            src={displayUrl}
            alt={alt || title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            priority={false}
          />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-slate-200 line-clamp-2">{title}</h3>
        <div className="text-sm font-semibold text-gold">{price}</div>
      </div>
    </Link>
  );
}


