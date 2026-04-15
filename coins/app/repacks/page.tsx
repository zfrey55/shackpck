import { Suspense } from 'react';
import { RepacksClient } from './RepacksClient';

export default function RepacksPage() {
  return (
    <main className="container py-10">
      <Suspense fallback={<div className="text-center text-slate-400 py-12">Loading…</div>}>
        <RepacksClient />
      </Suspense>
    </main>
  );
}
