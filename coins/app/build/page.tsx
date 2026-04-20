import Link from 'next/link';
import type { Metadata } from 'next';
import { ShackpackBuilderWizard } from '@/components/shackpack-builder/ShackpackBuilderWizard';

export const metadata: Metadata = {
  title: 'ShackPack Builder — Custom Shackpack',
  description:
    'Design your custom ShackPack case: scale, featured highlights, budget, and branding. Our team follows up to finalize every custom series.',
};

export default function BuildPage() {
  return (
    <main className="container py-10">
      <div className="mx-auto max-w-3xl px-4">
        <p className="text-center text-sm text-gold">
          <Link href="/contact" className="hover:underline">
            Prefer email only?
          </Link>{' '}
          ·{' '}
          <Link href="/policy" className="hover:underline">
            Policies
          </Link>
        </p>
        <h1 className="mt-4 text-center text-4xl font-bold text-gold">ShackPack Builder</h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-slate-300">
          Walk through your custom case — product line, scale, budget, design direction, and contact
          details. Custom configurations are quoted and finalized with ShackPack before production;
          this form is not a binding order.
        </p>
        <div className="mt-8 rounded-lg border border-amber-700/40 bg-amber-900/15 p-4 text-center text-sm text-amber-100">
          Custom series (Flex, Expo, Currency Clash, and bespoke lines) require direct coordination.
          Submitting this form starts a conversation — not a commitment to buy.
        </div>
        <div className="mt-10">
          <ShackpackBuilderWizard />
        </div>
      </div>
    </main>
  );
}
