"use client";

export default function ChecklistPage() {
  return (
    <main className="container py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gold">ShackPack Series Checklist</h1>
          <p className="text-lg text-slate-300">
            View all coins that may appear in ShackPack cases
          </p>
          <p className="text-sm text-slate-400 italic">
            Possible contents only — specific coins not guaranteed in every pack
          </p>
        </header>

        {/* Embedded Google Sheet */}
        <section className="rounded-lg border border-slate-700 bg-slate-900/40 overflow-hidden">
          <div className="w-full" style={{ height: "800px" }}>
            <iframe
              src="YOUR_GOOGLE_SHEET_PUBLISH_URL_HERE"
              className="w-full h-full"
              frameBorder="0"
              title="ShackPack Checklist"
            />
          </div>
        </section>

        {/* Instructions */}
        <div className="rounded-lg border border-blue-700/50 bg-blue-900/20 p-4 text-sm text-blue-200">
          <p className="font-semibold mb-2">📝 How to set up your Google Sheet:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Open your Google Sheet</li>
            <li>Click <strong>File → Share → Publish to web</strong></li>
            <li>Choose "Embed" and click "Publish"</li>
            <li>Copy the iframe URL (the part inside src="...")</li>
            <li>Replace <code className="bg-slate-800 px-2 py-1 rounded">YOUR_GOOGLE_SHEET_PUBLISH_URL_HERE</code> above with your URL</li>
          </ol>
        </div>

        {/* Footer */}
        <footer className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 text-sm text-slate-300 space-y-2">
          <p>
            This checklist shows coins that MAY appear in ShackPack cases. 
            Specific contents vary by case and are not guaranteed.
          </p>
          <p className="text-xs text-slate-500">
            Checklist updated manually via Google Sheets • No purchase necessary to view
          </p>
        </footer>
      </div>
    </main>
  );
}
