import Link from 'next/link';
import type { Metadata } from 'next';
import { BuilderShell } from '@/components/builder/BuilderShell';

export const metadata: Metadata = {
  title: 'ShackPack Builder — Design your custom case',
  description:
    'Design a custom ShackPack case: choose pack count, drag coins from the catalog, set per-slot targets, and upload your pack artwork. Submissions are quote requests — no payment is taken until we confirm.',
};

export default function BuildPage({
  searchParams,
}: {
  searchParams?: { id?: string };
}) {
  const id = typeof searchParams?.id === 'string' ? searchParams.id : null;

  return (
    <main className="container py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gold sm:text-4xl">ShackPack Builder</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">
              Build your custom case: pick your pack count, add the coins you want, set a target
              per slot, and (optionally) upload your pack artwork. When you're happy, send it to
              us for review.
            </p>
          </div>
          <div className="flex gap-3 text-sm">
            <Link href="/my-builds" className="text-gold hover:underline">
              My builds
            </Link>
            <span className="text-slate-600">·</span>
            <Link href="/policy" className="text-slate-400 hover:text-gold hover:underline">
              Policies
            </Link>
            <span className="text-slate-600">·</span>
            <Link href="/contact" className="text-slate-400 hover:text-gold hover:underline">
              Contact
            </Link>
          </div>
        </div>

        <BuilderShell loadBuildId={id} />
      </div>
    </main>
  );
}
