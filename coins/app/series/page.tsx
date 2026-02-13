'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/ToastProvider';
import { isDirectPurchaseEnabled, CONTACT_INFO } from '@/lib/feature-flags';
import { CoinInventorySeries } from '@/lib/coin-inventory-api';

export default function SeriesPage() {
  const [activeSeries, setActiveSeries] = useState<CoinInventorySeries[]>([]);
  const [pastSeries, setPastSeries] = useState<CoinInventorySeries[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      // Fetch featured series from inventory app
      const response = await fetch('/api/series?featured=true');
      
      if (response.ok) {
        const data = await response.json();
        const allSeries = Array.isArray(data) ? data : [];
        
        // Filter for featured series (isFeatured=true)
        const featuredSeries = allSeries.filter((s: any) => {
          return s.isFeatured === true;
        });
        
        // Separate active and past series
        const active = featuredSeries.filter((s: any) => {
          const packsRemaining = s.packsRemaining || (s.totalPacks - s.packsSold);
          return s.isActive && packsRemaining > 0;
        });
        const past = featuredSeries.filter((s: any) => {
          const packsRemaining = s.packsRemaining || (s.totalPacks - s.packsSold);
          return !s.isActive || packsRemaining === 0;
        });
        
        setActiveSeries(active);
        setPastSeries(past);
      }
    } catch (error) {
      console.error('Error fetching series:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async (series: CoinInventorySeries) => {
    // Validate before adding
    const validationResponse = await fetch('/api/cart/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ seriesId: series.id, quantity: 1 }],
      }),
    });

    const validation = await validationResponse.json();

    if (!validationResponse.ok || validation.errors?.length > 0) {
      showToast(validation.errors[0] || 'Failed to add to cart', 'error');
      return;
    }

    // Add 1 pack to cart
    addItem({
      seriesId: series.id,
      seriesName: series.name,
      seriesSlug: series.slug,
      quantity: 1,
      pricePerPack: series.pricePerPack,
      image: series.images[0],
    });

    showToast('1 pack added to cart!', 'success');
  };

  if (loading) {
    return (
      <main className="container py-16">
        <div className="text-center">
          <p className="text-slate-400">Loading series...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Featured Series</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Individual pack series featuring premium coins. Each pack is a mystery until you open it!
        </p>
      </div>

      {/* Active Series */}
      {activeSeries.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Active Series</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeSeries.map((series) => (
              <SeriesCard
                key={series.id}
                series={series}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        </section>
      )}

      {/* Past Series */}
      {pastSeries.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">Past Series</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pastSeries.map((series) => (
              <SeriesCard
                key={series.id}
                series={series}
                onBuyNow={handleBuyNow}
                isPast={true}
              />
            ))}
          </div>
        </section>
      )}

      {activeSeries.length === 0 && pastSeries.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400">No series available at this time.</p>
        </div>
      )}
    </main>
  );
}

interface SeriesCardProps {
  series: CoinInventorySeries;
  onBuyNow: (series: CoinInventorySeries) => void;
  isPast?: boolean;
}

function SeriesCard({ series, onBuyNow, isPast = false }: SeriesCardProps) {
  // Use currency clash image for Currency Clash series
  let imageUrl = series.images[0] || '/images/packs/shackpack-starter.jpg';
  if (series.name?.toLowerCase().includes('currency clash') || series.slug?.includes('currency-clash')) {
    imageUrl = '/images/packs/shackpack-currencyclash.png';
  }
  const price = (series.pricePerPack / 100).toFixed(2);
  const packsRemaining = series.packsRemaining ?? (series.totalPacks - (series.packsSold || 0));
  const soldPercentage = ((series.totalPacks - packsRemaining) / series.totalPacks) * 100;

  return (
    <div className="bg-gradient-to-r from-gold/10 to-slate-900/40 rounded-lg border border-gold/30 p-6 hover:border-gold/50 transition-colors">
      <Link href={`/series/${series.slug}`} className="block mb-4">
        <div className="relative aspect-[4/3] w-full bg-slate-900 rounded-lg overflow-hidden mb-4">
          <Image
            src={imageUrl}
            alt={series.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {isPast && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-xl font-semibold text-white">Sold Out</span>
            </div>
          )}
        </div>
        <h3 className="text-xl font-semibold mb-2">{series.name}</h3>
        {series.description && (
          <p className="text-sm text-slate-400 line-clamp-3 mb-4">{series.description}</p>
        )}
      </Link>

      <div className="space-y-4">
        <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-semibold">${price}</span>
            <span className={`font-semibold text-sm ${isPast ? 'text-slate-400' : 'text-gold'}`}>
              {packsRemaining} / {series.totalPacks} left
            </span>
          </div>
          {!isPast && (
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-gold h-2 rounded-full transition-all"
                style={{ width: `${soldPercentage}%` }}
              />
            </div>
          )}
        </div>

        {series.topHits && series.topHits.length > 0 && (
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700">
            <h4 className="text-sm font-semibold mb-2 text-gold">Top Hits</h4>
            <ul className="space-y-1 text-xs text-slate-300">
              {series.topHits.map((coin, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gold font-semibold">#{coin.position}</span>
                  <div>
                    <span className="block">{coin.year} {coin.coinType}</span>
                    {coin.description && (
                      <span className="text-slate-400 text-xs">{coin.description}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <Link
            href={`/series/${series.slug}`}
            className="flex-1 text-center px-4 py-2 border-2 border-gold text-gold font-semibold rounded-lg hover:bg-gold/10 transition-colors text-sm"
          >
            View Details
          </Link>
          {!isPast && (
            isDirectPurchaseEnabled() ? (
              <button
                onClick={() => onBuyNow(series)}
                disabled={packsRemaining === 0}
                className="flex-1 px-4 py-2 bg-gold text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Buy Now
              </button>
            ) : (
              <Link
                href={CONTACT_INFO.contactPage}
                className="flex-1 text-center px-4 py-2 bg-gold text-black font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                Contact Us
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}
