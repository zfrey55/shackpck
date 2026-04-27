'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { RepackCard } from '@/components/RepackCard';
import { REPACK_CATALOG } from '@/lib/repack-catalog';
import { CARD_REPACK_CATALOG } from '@/lib/card-repack-catalog';
import { CoinsCardsToggle, type ProductLine } from '@/components/CoinsCardsToggle';

function tabFromSearch(params: URLSearchParams | null): ProductLine {
  const t = params?.get('tab');
  return t === 'cards' ? 'cards' : 'coins';
}

export function RepacksClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = tabFromSearch(searchParams);

  const handleTab = (next: ProductLine) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set('tab', next === 'cards' ? 'cards' : 'coins');
    router.push(`/repacks?${p.toString()}`);
  };

  return (
    <>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-semibold">Coin & Card Repacks</h1>
        <p className="mt-4 text-xl text-slate-300 max-w-3xl mx-auto">
          Curated graded coins and graded trading cards, each backed by published checklists.
        </p>
        <div className="mt-6 flex justify-center">
          <CoinsCardsToggle value={tab} onChange={handleTab} />
        </div>
      </div>

      {tab === 'coins' ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REPACK_CATALOG.map((repack) => (
            <RepackCard key={repack.id} {...repack} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARD_REPACK_CATALOG.map((repack) => (
            <RepackCard key={repack.id} {...repack} />
          ))}
        </div>
      )}

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Why Choose Shackpack?</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-semibold text-gold">Expert Curation</h3>
            <p className="text-sm text-slate-400 mt-2">Each coin is hand-selected by numismatic experts</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-semibold text-gold">Checklist Verified</h3>
            <p className="text-sm text-slate-400 mt-2">Every series ships with a complete, publicly available checklist so buyers always know what&apos;s in the pool</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="font-semibold text-gold">Authenticity Guaranteed</h3>
            <p className="text-sm text-slate-400 mt-2">All coins verified for authenticity and condition</p>
          </div>
        </div>
      </div>
    </>
  );
}
