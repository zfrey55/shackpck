import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/site-metadata';

/**
 * /robots.txt
 *
 * Deliberately permissive. The only Disallow is /api/, which serves JSON no
 * crawler can use and which would otherwise burn crawl budget — /api/series
 * alone returns the whole series table.
 *
 * What is NOT disallowed, and why:
 *
 * - /build — linked from both NavBar and Footer on every page, so it is the
 *   most-linked internal route after "/". It is a real funnel entry and should
 *   rank.
 * - /admin, /account, /my-builds, /checkout, /auth/* — these need noindex, not
 *   Disallow. A disallowed URL is never fetched, so a noindex on it is never
 *   seen, and the URL can still be indexed from an external link with no
 *   snippet. Listing them here would also publish the admin path to anyone who
 *   reads robots.txt. Adding noindex to these is phase 2.
 * - /checklist/customer/* — carries noindex via its own layout.tsx. Same
 *   reasoning: the tag has to be fetchable to be obeyed.
 *
 * No AI crawler is blocked. GPTBot, ClaudeBot, PerplexityBot and friends fall
 * under the same "*" rule as everyone else, by choice.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
