/**
 * One source of truth for the site's public identity.
 *
 * These strings are consumed by app/layout.tsx (title, description,
 * metadataBase, Open Graph, Twitter), app/robots.ts, app/sitemap.ts and
 * components/StructuredData.tsx. They are centralised so the copy cannot drift
 * between the <title>, the og:title and the JSON-LD — three places that are
 * supposed to agree and that nobody checks against each other.
 */

/** Canonical origin. No trailing slash. */
export const SITE_URL = 'https://shackpck.com';

/** Brand name as it should appear to people, not the lowercase domain. */
export const SITE_NAME = 'ShackPack';

export const SITE_TITLE = 'ShackPack — Premium Coin, Bullion and Card Repacks';

export const SITE_DESCRIPTION =
  'Premium coin, bullion, sports card and Pokemon card repacks. Every series is backed by a published checklist; contents vary by series.';

/** Social card image, 1200x630. Path is relative to metadataBase. */
export const OG_IMAGE_PATH = '/og-default.png';

export const OG_IMAGE_ALT =
  'ShackPack — premium coin, bullion and card repacks';
