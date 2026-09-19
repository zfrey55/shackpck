import { CONTACT_INFO } from '@/lib/feature-flags';
import {
  OG_IMAGE_ALT,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from '@/lib/site-metadata';

/**
 * Organization + WebSite JSON-LD, emitted once from the root layout.
 *
 * Scope is deliberately narrow. There is no Product, Offer or ItemList here
 * and there must not be until checkout is enabled: marking up a price and an
 * availability on pages whose only purchase path is a phone number asserts a
 * transactable offer that does not exist, which is exactly the
 * markup-does-not-match-the-page mismatch that draws a manual action.
 *
 * Organization and WebSite make no commerce claims, so they are safe to ship
 * while checkout is off.
 *
 * sameAs is absent on purpose: the social links in the footer are all "#"
 * placeholders, and asserting profiles that do not exist is worse than
 * asserting none.
 */

/**
 * schema.org wants E.164, not the display string. CONTACT_INFO.phone is
 * '(561) 870-4222' by default but is env-overridable, so this normalises
 * whatever it holds rather than hardcoding the formatted result.
 */
function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  // Unrecognised shape: hand it over untouched rather than mangle it.
  return phone;
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/shackpack-favicon.png`,
        width: 192,
        height: 192,
        caption: OG_IMAGE_ALT,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: toE164(CONTACT_INFO.phone),
        email: CONTACT_INFO.email,
        areaServed: 'US',
        availableLanguage: 'English',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      publisher: { '@id': `${SITE_URL}/#organization` },
      // No potentialAction/SearchAction — the site has no search.
    },
  ],
};

/**
 * `<` is escaped so a value that ever contains "</script" cannot break out of
 * the script element. Nothing here is user-supplied today; the escape is one
 * call and removes the question.
 */
export const STRUCTURED_DATA_JSON = JSON.stringify(structuredData).replace(
  /</g,
  '\\u003c'
);

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA_JSON }}
    />
  );
}
