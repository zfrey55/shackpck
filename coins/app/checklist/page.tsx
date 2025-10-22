export default function ChecklistPage() {
  return (
    <main className="container py-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold">Complete Coin Checklist</h1>
          <p className="mt-4 text-xl text-slate-300">
            View all coins that could be included in our Shackpack repacks
          </p>
        </div>

        {/* Embedded Google Sheet */}
        <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 shadow-lg">
          <div className="relative w-full" style={{ paddingBottom: '600px', minHeight: '600px' }}>
            <iframe
              src="https://docs.google.com/spreadsheets/d/1X2Eeg_0L5lRd_md3l9bNZJQMeksoBterRnJwC1nUH3A/preview?gid=1499354207&rm=minimal"
              className="absolute top-0 left-0 w-full h-full rounded"
              style={{ border: 'none', minHeight: '600px' }}
              title="Shackpack Coin Checklist"
            />
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-slate-700 bg-slate-800/30 p-6">
          <h2 className="text-xl font-semibold mb-3">About This Checklist</h2>
          <div className="space-y-3 text-slate-300 text-sm">
            <p>
              This comprehensive checklist shows all coins that could potentially be included in any of our Shackpack repacks.
            </p>
            <p>
              Each entry includes detailed information such as:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-slate-400">
              <li>Coin name and denomination</li>
              <li>Weight and metal content</li>
              <li>Year of minting</li>
              <li>Grade and grading service (PCGS, NGC, ANACS, etc.)</li>
              <li>Country of origin</li>
            </ul>
            <p className="text-slate-400 mt-4">
              <strong>Note:</strong> This list represents all possible coins across all pack types. Actual pack contents vary and specific coins are not guaranteed in any individual pack.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="https://docs.google.com/spreadsheets/d/1X2Eeg_0L5lRd_md3l9bNZJQMeksoBterRnJwC1nUH3A/edit?gid=1499354207#gid=1499354207"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gold hover:underline font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open in Google Sheets (Full Screen)
          </a>
        </div>
      </div>
    </main>
  );
}
