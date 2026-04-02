import { RepackCard } from '@/components/RepackCard';
import { REPACK_CATALOG } from '@/lib/repack-catalog';

export default function RepacksPage() {
  return (
    <main className="container py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold">Gold & Silver Coin Repacks</h1>
        <p className="mt-4 text-xl text-slate-300 max-w-3xl mx-auto">
          Curated collections of premium coins, carefully selected for quality and value. 
          Each pack is assembled by experts to provide the best collecting experience.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {REPACK_CATALOG.map((repack) => (
          <RepackCard key={repack.id} {...repack} />
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Why Choose Shackpack?</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-semibold text-gold">Expert Curation</h3>
            <p className="text-sm text-slate-400 mt-2">Each coin is hand-selected by numismatic experts</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="font-semibold text-gold">Value Focused</h3>
            <p className="text-sm text-slate-400 mt-2">Packs designed to maximize excitement and value</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="font-semibold text-gold">Authenticity Guaranteed</h3>
            <p className="text-sm text-slate-400 mt-2">All coins verified for authenticity and condition</p>
          </div>
        </div>
      </div>
    </main>
  );
}
