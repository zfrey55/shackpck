import { ChecklistUpload } from '@/components/ChecklistUpload';

export default function ChecklistPage() {
  return (
    <main className="container py-10">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-semibold">Coin Checklist</h1>
        <p className="mt-4 text-slate-300">
          Upload your coin data via spreadsheet or document to manage your collection.
        </p>
        <ChecklistUpload />
      </div>
    </main>
  );
}
