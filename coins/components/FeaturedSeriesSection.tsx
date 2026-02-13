'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartProvider';
import { useToast } from './ToastProvider';
import { Series } from '@/lib/types';
import { isDirectPurchaseEnabled, CONTACT_INFO } from '@/lib/feature-flags';

interface TopHit {
  position: number;
  coinType: string;
  year: string;
  grade?: string;
  gradingCompany?: string;
  cost?: number;
  description?: string; // Written in inventory app, read-only here
}

interface FeaturedSeries extends Series {
  topHits?: TopHit[]; // 1-5 coins
  caseType?: string;
  displayDate?: string;
}

export function FeaturedSeriesSection() {
  const [featuredSeries, setFeaturedSeries] = useState<FeaturedSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    fetchFeaturedSeries();
  }, []);

  const fetchFeaturedSeries = async () => {
    try {
      // Fetch from inventory app API directly
      const response = await fetch('/api/series?featured=true');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Featured series API response:', data);
        
        // Handle both array and single object responses
        let seriesArray: any[] = [];
        if (Array.isArray(data)) {
          console.log('Received array of', data.length, 'series');
          console.log('All series data:', data);
          seriesArray = data.filter((s: any) => {
            const packsRemaining = s.packsRemaining || (s.totalPacks - s.packsSold);
            const isActive = s.isActive && packsRemaining > 0;
            console.log(`Series: ${s.name}, isActive: ${s.isActive}, isFeatured: ${s.isFeatured}, packsRemaining: ${packsRemaining}, willShow: ${isActive}`);
            if (!isActive) {
              console.log('Filtered out series:', s.name, 'isActive:', s.isActive, 'packsRemaining:', packsRemaining);
            }
            return isActive;
          });
          console.log('Filtered series array:', seriesArray.length, 'series will be displayed');
        } else if (data && data.isActive) {
          const packsRemaining = data.packsRemaining || (data.totalPacks - data.packsSold);
          console.log('Received single series:', data.name, 'isActive:', data.isActive, 'isFeatured:', data.isFeatured, 'packsRemaining:', packsRemaining);
          if (packsRemaining > 0) {
            seriesArray = [data];
          }
        } else if (data) {
          console.log('Received non-array data:', data);
        } else {
          console.log('No data received from API');
        }
        
        console.log('Final featured series array:', seriesArray.length, 'items');
        setFeaturedSeries(seriesArray);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch featured series:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching featured series:', error);
      // Don't show error to user, just show empty state
    } finally {
      setLoading(false);
    }
  };

  const fetchTopHits = async (series: any): Promise<FeaturedSeries> => {
    // If topHits are already in the series data, use them
    if (series.topHits) {
      return { ...series, topHits: series.topHits };
    }
    
    // Also check for legacy top5Coins field for backward compatibility
    if (series.top5Coins) {
      return { ...series, topHits: series.top5Coins };
    }

    // Otherwise, try to fetch from checklist API if caseType and displayDate are available
    if (series.caseType && series.displayDate) {
      try {
        const checklistResponse = await fetch(
          `/api/checklist?date=${series.displayDate}&caseType=${series.caseType}`
        );
        if (checklistResponse.ok) {
          const checklist = await checklistResponse.json();
          // Top hits are manually selected, so if not in series data, return empty
        }
      } catch (error) {
        console.error('Error fetching top hits:', error);
      }
    }

    return series;
  };

  const handleBuyNow = async (series: FeaturedSeries) => {
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

    // Show success notification
    showToast('1 pack added to cart!', 'success');
  };

  if (loading) {
    return (
      <section className="container py-16">
        <div className="text-center">
          <p className="text-slate-400">Loading featured series...</p>
        </div>
      </section>
    );
  }

  // Show message if no featured series (for debugging)
  if (featuredSeries.length === 0) {
    return (
      <section className="container py-16">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gold">
            Active Series
          </h2>
          <p className="text-slate-400">
            No active specialized series available at this time.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Check the API endpoint: /api/series?featured=true
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gold">
          Active Series
        </h2>
        <p className="text-slate-400">Specialized series available now</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {featuredSeries.map((series) => {
          // Use currency clash image for Currency Clash series
          let imageUrl = series.images[0] || '/images/packs/shackpack-starter.jpg';
          if (series.name?.toLowerCase().includes('currency clash') || series.slug?.includes('currency-clash')) {
            imageUrl = '/images/packs/shackpack-currencyclash.png';
          }
          const price = (series.pricePerPack / 100).toFixed(2);
          const packsRemaining = series.packsRemaining ?? (series.totalPacks - (series.packsSold || 0));
          const soldPercentage = ((series.totalPacks - packsRemaining) / series.totalPacks) * 100;

          return (
            <div
              key={series.id}
              className="bg-gradient-to-r from-gold/10 to-slate-900/40 rounded-lg border border-gold/30 p-6 hover:border-gold/50 transition-colors"
            >
              <Link href={`/series/${series.slug}`} className="block mb-4">
                <div className="relative aspect-[4/3] w-full bg-slate-900 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={imageUrl}
                    alt={series.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{series.name}</h3>
                {series.description && (
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">{series.description}</p>
                )}
              </Link>

              <div className="space-y-4">
                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-semibold">${price}</span>
                    <span className="text-gold font-semibold text-sm">
                      {packsRemaining} / {series.totalPacks} left
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-gold h-2 rounded-full transition-all"
                      style={{ width: `${soldPercentage}%` }}
                    />
                  </div>
                </div>

                {series.topHits && series.topHits.length > 0 && (
                  <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700">
                    <h4 className="text-sm font-semibold mb-2 text-gold">Top Hits</h4>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {series.topHits.slice(0, 3).map((coin, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="text-gold font-semibold">#{coin.position}</span>
                          <span className="truncate">
                            {coin.year} {coin.coinType}
                          </span>
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
                    Details
                  </Link>
                  {isDirectPurchaseEnabled() ? (
                    <button
                      onClick={() => handleBuyNow(series)}
                      disabled={!series.isActive || packsRemaining === 0}
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
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
