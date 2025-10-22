import Image from 'next/image';
import Link from 'next/link';

// TODO: Upload actual PDF files to /public/checklists/ folder
const packChecklists = [
  {
    id: 'shack-pack-starter',
    name: 'Shackpack Starter',
    description: 'Complete checklist for the Starter pack series',
    image: 'https://images.unsplash.com/photo-1611953694403-44b588b5aea3?w=400&auto=format&fit=crop',
    pdfUrl: '/checklists/shackpack-starter.pdf',
    cardCount: '15-20 cards'
  },
  {
    id: 'shack-pack-deluxe',
    name: 'Shackpack Deluxe',
    description: 'Complete checklist for the Deluxe pack series',
    image: 'https://images.unsplash.com/photo-1628744876497-eb30460be9f6?w=400&auto=format&fit=crop',
    pdfUrl: '/checklists/shackpack-deluxe.pdf',
    cardCount: '25-30 cards'
  },
  {
    id: 'shack-pack-xtreme',
    name: 'Shackpack X-Treme',
    description: 'Complete checklist for the X-Treme pack series',
    image: 'https://images.unsplash.com/photo-1624378440070-e123f7c3c2ba?w=400&auto=format&fit=crop',
    pdfUrl: '/checklists/shackpack-xtreme.pdf',
    cardCount: '30-40 cards'
  },
  {
    id: 'shack-pack-elite',
    name: 'Shackpack Elite',
    description: 'Complete checklist for the Elite pack series',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop',
    pdfUrl: '/checklists/shackpack-elite.pdf',
    cardCount: '20-25 cards'
  }
];

export default function ChecklistPage() {
  return (
    <main className="container py-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold">Pack Checklists</h1>
          <p className="mt-4 text-xl text-slate-300">
            Download detailed checklists for each of our trading card repack series
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {packChecklists.map((pack) => (
            <div 
              key={pack.id}
              className="group relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40 shadow-sm transition-all duration-300 hover:border-slate-700 hover:shadow-glow"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <Image
                  src={pack.image}
                  alt={pack.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-slate-200 mb-2">{pack.name}</h3>
                <p className="text-slate-400 text-sm mb-1">{pack.cardCount}</p>
                <p className="text-slate-300 mb-4">{pack.description}</p>
                
                <a
                  href={pack.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 font-medium text-black hover:opacity-90 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Checklist (PDF)
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-lg border border-slate-700 bg-slate-800/30 p-8">
          <h2 className="text-2xl font-semibold mb-4">About Our Checklists</h2>
          <div className="space-y-4 text-slate-300">
            <p>
              Each checklist provides detailed information about the possible cards you could find in our repacks, including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Card names and numbers</li>
              <li>Player information and teams</li>
              <li>Card types (base, insert, parallel, etc.)</li>
              <li>Rarity indicators</li>
              <li>Special features (autographs, memorabilia, etc.)</li>
            </ul>
            <p className="text-sm text-slate-400 mt-6">
              Note: Checklists represent possible contents. Actual pack contents may vary and are subject to availability.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
