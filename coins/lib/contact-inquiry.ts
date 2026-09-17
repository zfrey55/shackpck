/**
 * Contact inquiry form: option sets and payload types shared by the form
 * (components/contact/), the API route and the notification email.
 *
 * This module imports NO catalog. The client form gets its product lists as
 * props from the server page, so nothing here drags the catalogs into the
 * browser; catalog-derived data lives in lib/contact-inquiry-catalog.ts.
 *
 * No option names a price. Target price per case is free text and is never
 * parsed.
 */

import type { ProductLine } from '@/lib/product-lines';

export const INQUIRY_REASONS = ['BUYING', 'ORDER', 'OTHER'] as const;
export type InquiryReason = (typeof INQUIRY_REASONS)[number];

export const REASON_LABELS: Record<InquiryReason, string> = {
  BUYING: 'Buying packs',
  ORDER: 'Existing order',
  OTHER: 'Other',
};

/** Form order, which is also the order blocks and email sections render in. */
export const INQUIRY_LINES = ['coins', 'sports', 'pokemon'] as const satisfies readonly ProductLine[];

export const INQUIRY_LINE_LABELS: Record<ProductLine, string> = {
  coins: 'Coins & Bullion',
  sports: 'Sports Cards',
  pokemon: 'Pokemon',
};

export function isInquiryLine(value: unknown): value is ProductLine {
  return (INQUIRY_LINES as readonly unknown[]).includes(value);
}

/** Offered alongside the real products on a line that has ShackPack products. */
export const RECOMMEND_PRODUCT = 'recommend';
/** The ONLY product option on a line with no ShackPack products. */
export const CUSTOM_PRODUCT = 'custom';

export const SPECIAL_PRODUCT_LABELS: Record<string, string> = {
  [RECOMMEND_PRODUCT]: 'Not sure, recommend one',
  [CUSTOM_PRODUCT]: 'Custom / not sure',
};

export const PACKS_PER_SET: Record<ProductLine, readonly string[]> = {
  coins: ['10', '20', 'custom'],
  sports: ['10', 'custom'],
  pokemon: ['10', 'custom'],
};

export const PACKS_PER_SET_LABELS: Record<string, string> = {
  '10': '10',
  '20': '20',
  custom: 'Custom',
};

export const SETS_PER_MONTH = ['1', '2-5', '6-10', '10+'] as const;

export const CUSTOM_BRANDING = ['YES', 'NO', 'MAYBE'] as const;
export type CustomBranding = (typeof CUSTOM_BRANDING)[number];

export const CUSTOM_BRANDING_LABELS: Record<CustomBranding, string> = {
  YES: 'Yes',
  NO: 'No',
  MAYBE: 'Maybe',
};

export const TIMELINES = ['asap', 'within-30-days', 'just-exploring'] as const;
export type Timeline = (typeof TIMELINES)[number];

export const TIMELINE_LABELS: Record<Timeline, string> = {
  asap: 'ASAP',
  'within-30-days': 'Within 30 days',
  'just-exploring': 'Just exploring',
};

/** A purchasable catalog product as the form sees it. */
export type InquiryProduct = { id: string; name: string };
export type ProductsByLine = Record<ProductLine, InquiryProduct[]>;

export type LineDetail = {
  products: string[];
  packsPerSet: string;
  setsPerMonth: string;
};

/**
 * Spam handling. The honeypot is an off-screen field people never see; the
 * minimum fill time rejects submissions made within 3 seconds of the form
 * loading. Both get the normal success response and are neither saved nor
 * emailed, so a bot learns nothing.
 */
export const HONEYPOT_FIELD = 'companyWebsite';
export const MIN_FILL_MS = 3000;

/** The one success body every accepted (or silently dropped) submission gets. */
export const INQUIRY_SUCCESS_BODY = { ok: true } as const;
