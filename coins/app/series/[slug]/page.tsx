'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/ToastProvider';
import { isDirectPurchaseEnabled, CONTACT_INFO } from '@/lib/feature-flags';
import { Series } from '@/lib/types';
import type { DailyChecklistResponse, CaseData } from '@/app/checklist/types';

export default function SeriesPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [checklist, setChecklist] = useState<DailyChecklistResponse | null>(null);
  const [seriesChecklist, setSeriesChecklist] = useState<any[]>([]); // Checklist from series API response
  const [topHits, setTopHits] = useState<any[]>([]);
  const [showChecklist, setShowChecklist] = useState(false);

  useEffect(() => {
    fetchSeries();
  }, [slug]);

  const fetchSeries = async () => {
    try {
      const response = await fetch(`/api/series/${slug}`);
      if (!response.ok) {
        throw new Error('Series not found');
      }
      const data = await response.json();
      setSeries(data);
      
      // Extract top hits if available (also check legacy top5Coins for backward compatibility)
      if (data.topHits && Array.isArray(data.topHits)) {
        setTopHits(data.topHits);
      } else if (data.top5Coins && Array.isArray(data.top5Coins)) {
        setTopHits(data.top5Coins);
      }
      
      // Use checklist from series API response if available
      if (data.checklist && Array.isArray(data.checklist)) {
        setSeriesChecklist(data.checklist);
      } else if (data.caseType && data.displayDate) {
        // Fallback to fetching from checklist API
        fetchChecklist(data.caseType, data.displayDate);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchChecklist = async (caseType: string, displayDate: string) => {
    try {
      const response = await fetch(`/api/series/${slug}/checklist`);
      if (response.ok) {
        const data = await response.json();
        if (data.checklist) {
          setChecklist(data.checklist);
        }
      }
    } catch (err) {
      console.error('Error fetching checklist:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!series) return;

    if (quantity < 1 || quantity > 5) {
      setError('Quantity must be between 1 and 5');
      return;
    }

    if (quantity > series.packsRemaining) {
      setError(`Only ${series.packsRemaining} packs remaining`);
      return;
    }

    // Validate cart before adding
    const validationResponse = await fetch('/api/cart/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ seriesId: series.id, quantity }],
      }),
    });

    const validation = await validationResponse.json();

    if (!validationResponse.ok || validation.errors?.length > 0) {
      setError(validation.errors[0] || 'Failed to add to cart');
      return;
    }

    addItem({
      seriesId: series.id,
      seriesName: series.name,
      seriesSlug: series.slug,
      quantity,
      pricePerPack: series.pricePerPack,
      image: series.images[0],
    });

    // Show success toast
    showToast(`${quantity} pack${quantity > 1 ? 's' : ''} added to cart!`, 'success');
    setError('');
  };

  if (loading) {
    return (
      <main className="container py-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (error && !series) {
    return (
      <main className="container py-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </main>
    );
  }

  if (!series) {
    return (
      <main className="container py-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-400">Series not found</p>
        </div>
      </main>
    );
  }

  // Use currency clash image for Currency Clash series
  let imageUrl = series.images[0] || '/images/packs/shackpack-starter.jpg';
  if (series.name?.toLowerCase().includes('currency clash') || series.slug?.includes('currency-clash')) {
    imageUrl = '/images/packs/shackpack-currencyclash.png';
  }
  const price = (series.pricePerPack / 100).toFixed(2);
  const soldPercentage = ((series.totalPacks - series.packsRemaining) / series.totalPacks) * 100;

  return (
    <main className="container py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative aspect-square bg-slate-900 rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={series.name}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{series.name}</h1>
            <p className="text-3xl font-semibold text-gold mb-6">
              ${price} per pack
            </p>

            {series.description && (
              <p className="text-slate-300 mb-6">{series.description}</p>
            )}

            {/* Inventory info */}
            <div className="mb-6 p-4 bg-slate-900/40 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Packs Remaining</span>
                <span className="text-gold font-semibold text-lg">
                  {series.packsRemaining} / {series.totalPacks}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                <div
                  className="bg-gold h-2 rounded-full transition-all"
                  style={{ width: `${soldPercentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {soldPercentage.toFixed(0)}% sold
              </p>
            </div>

            {/* Top Hits */}
            {topHits.length > 0 && (
              <div className="mb-6 p-4 bg-slate-900/40 rounded-lg border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 text-gold">Top Hits</h3>
                <ul className="space-y-3">
                  {topHits.map((coin, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-300">
                      <span className="text-gold font-semibold text-lg">#{coin.position}</span>
                      <div>
                        <span className="font-medium">
                          {coin.year} {coin.coinType}
                        </span>
                        {coin.grade && coin.gradingCompany && (
                          <span className="text-slate-400 ml-2">
                            {coin.grade} {coin.gradingCompany}
                          </span>
                        )}
                        {coin.description && (
                          <p className="text-sm text-slate-400 mt-1">{coin.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Purchase form */}
            {series.isActive && series.packsRemaining > 0 ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium mb-2">
                    Quantity (max 5 per user)
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={Math.min(5, series.packsRemaining)}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.min(Math.max(1, val), Math.min(5, series.packsRemaining)));
                      setError('');
                    }}
                    className="w-24 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-200 text-sm">
                    {error}
                  </div>
                )}

                {isDirectPurchaseEnabled() ? (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-gold text-black font-semibold py-4 rounded-lg hover:opacity-90 transition-opacity text-lg"
                  >
                    Add to Cart - ${(parseFloat(price) * quantity).toFixed(2)}
                  </button>
                ) : (
                  <Link
                    href={CONTACT_INFO.contactPage}
                    className="w-full bg-gold text-black font-semibold py-4 rounded-lg hover:opacity-90 transition-opacity text-lg text-center block"
                  >
                    Contact Us to Purchase
                  </Link>
                )}

                <p className="text-sm text-slate-400 text-center">
                  Free shipping for account holders • $4.99 for guests
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg text-center">
                <p className="text-slate-400">This series is sold out</p>
              </div>
            )}
          </div>
        </div>

        {/* Full Checklist Section */}
        {(seriesChecklist.length > 0 || (checklist && checklist.cases.length > 0)) && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Full Checklist</h2>
              <button
                onClick={() => setShowChecklist(!showChecklist)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
              >
                {showChecklist ? 'Hide Checklist' : 'Show Checklist'}
              </button>
            </div>

            {showChecklist && (
              <div className="bg-slate-900/40 rounded-lg border border-slate-700 p-6">
                {/* Use series checklist if available (from API response), otherwise use checklist API data */}
                {seriesChecklist.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {seriesChecklist.map((coin: any, idx: number) => (
                      <div key={idx} className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded">
                        <div className="font-medium">
                          {coin.year} {coin.coinType}
                        </div>
                        {coin.grade && coin.gradingCompany && (
                          <div className="text-xs text-slate-400">
                            {coin.grade} {coin.gradingCompany}
                          </div>
                        )}
                        {coin.weight && (
                          <div className="text-xs text-gold mt-1">
                            {coin.weight}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : checklist && checklist.cases.length > 0 ? (
                  <>
                    <div className="mb-4 text-slate-400">
                      <p>Display Date: {checklist.displayDate}</p>
                      <p>Total Cases: {checklist.totalCases}</p>
                    </div>
                    <div className="space-y-6">
                      {checklist.cases.map((caseData: CaseData) => (
                        <div key={caseData.caseId} className="border-b border-slate-700 pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gold">
                              {caseData.displayName}
                            </h3>
                            <span className="text-sm text-slate-400">
                              {caseData.totalCoins} coins
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-3">
                            {caseData.coins.map((coin, idx) => (
                              <div key={idx} className="text-sm text-slate-300 bg-slate-800/50 p-2 rounded">
                                <div className="font-medium">
                                  {coin.year} {coin.coinType}
                                </div>
                                {coin.grade && coin.gradingCompany && (
                                  <div className="text-xs text-slate-400">
                                    {coin.grade} {coin.gradingCompany}
                                  </div>
                                )}
                                {coin.weight && (
                                  <div className="text-xs text-gold mt-1">
                                    {coin.weight}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
