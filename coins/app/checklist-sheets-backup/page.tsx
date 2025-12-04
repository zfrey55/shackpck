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
              src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSWqzRuGL06uwNasHPxwvCLZCrWh6PJ55NhIkMuCTzjI0oiTr3r9us4hkQ6Fmah-mZgpb7Q7gAYPF2o/pubhtml?widget=true&amp;headers=false"
              className="w-full h-full"
              frameBorder="0"
              title="ShackPack Checklist"
            />
          </div>
        </section>


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
