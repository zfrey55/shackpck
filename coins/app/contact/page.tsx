import { Suspense } from 'react';
import { ContactWizard } from '@/components/contact/ContactWizard';
import { purchasableProductsByLine } from '@/lib/contact-inquiry-catalog';

/**
 * Server component. The product lists are derived from the catalogs here and
 * passed down as props, so the client form never imports a catalog.
 */
export default function ContactPage() {
  const productsByLine = purchasableProductsByLine();
  return (
    <main className="container py-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold">Contact Us</h1>
        <p className="mt-4 text-slate-300">
          Buying packs, asking about an order, or something else? Tell us a little and we&apos;ll get back to you.
        </p>
        <Suspense fallback={<div className="mt-8 text-slate-400">Loading form…</div>}>
          <ContactWizard productsByLine={productsByLine} />
        </Suspense>
      </div>
    </main>
  );
}
