import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminBuildsClient } from './AdminBuildsClient';

export const metadata: Metadata = {
  title: 'Admin · Builder inquiries',
  description: 'ShackPack Builder submissions — full configuration for every customer build.',
};

export const dynamic = 'force-dynamic';

export default function AdminBuildsPage() {
  return (
    <main className="container py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <Link href="/admin" className="text-xs text-gold hover:underline">
              ← Admin dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gold">Builder inquiries</h1>
            <p className="mt-1 text-sm text-slate-400">
              Every ShackPack Builder submission, read straight from the database. If a notification
              email arrived blank, the full configuration is here.
            </p>
          </div>
        </div>
        <Suspense
          fallback={
            <p className="py-12 text-center text-slate-400">Loading builder inquiries…</p>
          }
        >
          <AdminBuildsClient />
        </Suspense>
      </div>
    </main>
  );
}
