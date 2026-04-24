import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MyBuildsClient } from './MyBuildsClient';

export const metadata: Metadata = {
  title: 'My ShackPack Builds',
  description: 'Your saved ShackPack Builder designs — edit, duplicate, archive, or submit.',
};

export const dynamic = 'force-dynamic';

export default function MyBuildsPage() {
  return (
    <main className="container py-10">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-6">
          <Link href="/build" className="text-xs text-gold hover:underline">
            ← Back to builder
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gold">My builds</h1>
          <p className="mt-1 text-sm text-slate-400">
            Every build you save lives here. Edit, duplicate, or send to ShackPack when you're
            ready.
          </p>
        </div>
        <Suspense
          fallback={<div className="py-16 text-center text-slate-400">Loading your builds…</div>}
        >
          <MyBuildsClient />
        </Suspense>
      </div>
    </main>
  );
}
