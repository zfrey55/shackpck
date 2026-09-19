import type { MetadataRoute } from 'next';

import { prisma } from '@/lib/db';
import { SITE_URL } from '@/lib/site-metadata';

/**
 * /sitemap.xml
 *
 * Generated once at build time. There is no `revalidate`, so the file is
 * frozen at deploy and refreshes on the next build — which is fine, because
 * every content change here already ships as a deploy. If that stops being
 * true, `export const revalidate = 3600` is the lever.
 *
 * Deliberately absent:
 *
 * - /series — the index filters on isFeatured === true, and no row currently
 *   sets it, so the page renders an empty list. Submitting it would hand
 *   Google a blank page. It comes back once ShackHQ getSeries is populated
 *   (see 15-backlog.md).
 * - /checklist/customer/* — noindex, for the same privacy reason its layout
 *   carries the tag. A URL cannot be both submitted and suppressed.
 * - /auth/*, /account, /my-builds, /checkout, /admin — auth-gated or
 *   transactional, nothing to rank.
 */

/** Public routes that exist regardless of what is in the database. */
const STATIC_PATHS = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/repacks', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/checklist', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/build', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.5, changeFrequency: 'yearly' as const },
  { path: '/policy', priority: 0.3, changeFrequency: 'yearly' as const },
];

/**
 * How long to wait on the database before giving up and shipping the static
 * routes alone. Prisma's own connect_timeout is 5s, but a half-open TCP path
 * to Supabase can hang well past that, and no sitemap is worth stalling a
 * deploy over.
 */
const DB_TIMEOUT_MS = 10_000;

type SeriesRow = { slug: string; updatedAt: Date };

/**
 * Active series, or an empty list if the database cannot be reached.
 *
 * A build must never fail over a sitemap. The failure is warned rather than
 * swallowed silently: if DATABASE_URL is scoped to the Netlify runtime instead
 * of the build, this returns nothing and a static-only sitemap would otherwise
 * look exactly like success.
 */
async function fetchSeriesRows(): Promise<SeriesRow[]> {
  try {
    return await Promise.race([
      prisma.series.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`timed out after ${DB_TIMEOUT_MS}ms`)),
          DB_TIMEOUT_MS
        )
      ),
    ]);
  } catch (error) {
    console.warn(
      '[sitemap] Could not read series from the database; emitting static routes only.',
      error
    );
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })
  );

  const seriesRows = await fetchSeriesRows();
  const seriesEntries: MetadataRoute.Sitemap = seriesRows.map((series) => ({
    url: `${SITE_URL}/series/${series.slug}`,
    lastModified: series.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticEntries, ...seriesEntries];
}
