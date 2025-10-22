import Image from 'next/image';
import Link from 'next/link';

// Google Sheet link from user: https://docs.google.com/spreadsheets/d/1X2Eeg_0L5lRd_md3l9bNZJQMeksoBterRnJwC1nUH3A/edit?gid=1499354207#gid=1499354207
// The sheet contains sections for: Shackpack, Deluxe, and all coin details

const packChecklists = [
  {
    id: 'shackpack-starter',
    name: 'Shackpack Starter',
    description: 'Complete list of all coins that could be included in the Starter pack',
    image: '/images/packs/shackpack-starter.jpg',
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1X2Eeg_0L5lRd_md3l9bNZJQMeksoBterRnJwC1nUH3A/edit?gid=1499354207#gid=1499354207',
    pdfUrl: '/checklists/shackpack-starter.pdf',
    coinCount: '15-20 coins'
  },
  {
    id: 'shackpack-deluxe',
    name: 'Shackpack Deluxe',
    description: 'Complete list of all coins that could be included in the Deluxe pack',
    image: '/images/packs/shackpack-deluxe.jpg',
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1X2Eeg_0L5lRd_md3l9bNZJQMeksoBterRnJwC1nUH3A/edit?gid=1499354207#gid=1499354207',
    pdfUrl: '/checklists/shackpack-deluxe.pdf',
    coinCount: '25-30 coins'
  },
  {
    id: 'shackpack-xtreme',
    name: 'Shackpack X-Treme',
    description: 'Complete list of all coins that could be included in the X-Treme pack',
    image: '/images/packs/shackpack-xtreme.jpg',
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1X2Eeg_0L5lRd_md3l9bNZJQMeksoBterRnJwC1nUH3A/edit?gid=1499354207#gid=1499354207',
    pdfUrl: '/checklists/shackpack-xtreme.pdf',
    coinCount: '30-40 coins'
  },
  {
    id: 'shackpack-transcendent',
    name: 'Shackpack Transcendent',
    description: 'Complete list of all coins that could be included in the Transcendent pack',
    image: '/images/packs/shackpack-transcendent.jpg',
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1X2Eeg_0L5lRd_md3l9bNZJQMeksoBterRnJwC1nUH3A/edit?gid=1499354207#gid=1499354207',
    pdfUrl: '/checklists/shackpack-transcendent.pdf',
    coinCount: '20-25 coins'
  },
  {
    id: 'shackpack-unleashed',
    name: 'Shackpack Unleashed',
    description: 'Complete list of all coins that could be included in the Unleashed pack',
    image: '/images/packs/shackpack-unleashed.jpg',
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1X2Eeg_0L5lRd_md3l9bNZJQMeksoBterRnJwC1nUH3A/edit?gid=1499354207#gid=1499354207',
    pdfUrl: '/checklists/shackpack-unleashed.pdf',
    coinCount: '35-45 coins'
  },
  {
    id: 'shackpack-resurgence',
    name: 'Shackpack Resurgence',
    description: 'Complete list of all coins that could be included in the Resurgence pack',
    image: '/images/packs/shackpack-resurgence.jpg',
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1X2Eeg_0L5lRd_md3l9bNZJQMeksoBterRnJwC1nUH3A/edit?gid=1499354207#gid=1499354207',
    pdfUrl: '/checklists/shackpack-resurgence.pdf',
    coinCount: '25-30 coins'
  }
];

export default function ChecklistPage() {
  return (
    <main className="container py-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold">Pack Coin Lists</h1>
          <p className="mt-4 text-xl text-slate-300">
            View detailed lists of all coins that could be included in each of our repack series
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-slate-200 mb-2">{pack.name}</h3>
                <p className="text-slate-400 text-sm mb-1">{pack.coinCount}</p>
                <p className="text-slate-300 mb-6">{pack.description}</p>
                
                <div className="flex flex-col gap-3">
                  {/* Google Sheet Link */}
                  <a
                    href={pack.googleSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-5 py-2.5 font-medium text-black hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Coin List (Google Sheet)
                  </a>

                  {/* PDF Link */}
                  <a
                    href={pack.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-700 px-5 py-2.5 font-medium text-slate-300 hover:border-slate-600 hover:bg-slate-800/50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF List
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-lg border border-slate-700 bg-slate-800/30 p-8">
          <h2 className="text-2xl font-semibold mb-4">About Our Coin Lists</h2>
          <div className="space-y-4 text-slate-300">
            <p>
              Each list provides detailed information about all the coins that could potentially be found in our repacks, including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Coin names and denominations</li>
              <li>Year and mint mark</li>
              <li>Metal type and weight</li>
              <li>Purity specifications</li>
              <li>Grading service and grade (PCGS, NGC, ANACS, etc.)</li>
              <li>Country of origin</li>
              <li>Special features or historical significance</li>
            </ul>
            <p className="text-sm text-slate-400 mt-6">
              <strong>Note:</strong> These lists represent the complete pool of possible contents. Actual pack contents may vary based on availability, and we cannot guarantee specific coins in any individual pack. Each pack is curated to provide excellent value and variety.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-blue-700/60 bg-blue-900/20 p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-300">💡 How to Use These Lists</h3>
          <div className="text-slate-300 space-y-2 text-sm">
            <p><strong>Google Sheet:</strong> Live, searchable, sortable list updated regularly with all possible coins</p>
            <p><strong>PDF:</strong> Downloadable version you can print or save offline for reference</p>
            <p>Use these lists to track which coins you've received and which ones you're still hunting for!</p>
          </div>
        </div>
      </div>
    </main>
  );
}
