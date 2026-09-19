import type { Metadata } from 'next';

/**
 * Keeps /checklist/customer/* out of search results.
 *
 * These pages list which case series were built for a named wholesale buyer,
 * on which dates — B2B purchase history attributable to a named business. That
 * is a customer-relationship question, not an SEO one, and the answer is that
 * it does not belong in a search index.
 *
 * Two further reasons, either of which would be enough on its own:
 *
 * - The same content is already reachable at /checklist?customer=<slug>, which
 *   is what the site's own navigation links to. Indexing both would be
 *   duplicate content.
 * - The route returns 200 for any slug at all, rendering the slug back as a
 *   title-cased heading, so an unbounded space of invented "customer" pages is
 *   crawlable. Returning 404 for unknown slugs is the real fix and is phase 2;
 *   this keeps the space out of the index in the meantime.
 *
 * This layout exists only to carry the tag. It is a server component, so it
 * can export metadata that the client page beneath it cannot — and since that
 * page exports none, nothing overrides this.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CustomerChecklistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
