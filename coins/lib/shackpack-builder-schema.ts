import { z } from 'zod';

/** Submitted with POST /api/contact when subject is custom-build */
export const shackpackBuilderSpecSchema = z.object({
  productLine: z.enum(['coins', 'cards', 'both', 'not-sure']),
  inspiration: z
    .enum([
      'flex',
      'expo',
      'currency-clash',
      'coinwave-style',
      'card-line',
      'wholly-custom',
      'not-sure',
    ])
    .optional(),
  packCount: z.string().trim().min(1).max(120),
  caseCount: z.string().trim().max(120).optional(),
  /** User-described spotlight / featured cards or coins (not a guarantee). */
  spotlightNotes: z.string().trim().max(4000).optional(),
  budgetRange: z.enum([
    'under-5k',
    '5k-15k',
    '15k-50k',
    '50k-plus',
    'discuss-privately',
  ]),
  designNotes: z.string().trim().min(20).max(8000),
  timeline: z.enum(['rush', '1-3mo', '3-6mo', 'flexible']).optional(),
});

export type ShackpackBuilderSpec = z.infer<typeof shackpackBuilderSpecSchema>;

export const PRODUCT_LINE_LABELS: Record<ShackpackBuilderSpec['productLine'], string> = {
  coins: 'Graded coin repacks',
  cards: 'Graded card repacks',
  both: 'Coins and cards',
  'not-sure': 'Not sure yet — advise me',
};

export const INSPIRATION_LABELS: Record<
  NonNullable<ShackpackBuilderSpec['inspiration']>,
  string
> = {
  flex: 'ShackPack Flex–style (fully custom configuration)',
  expo: 'ShackPack Expo–style (events / special occasions)',
  'currency-clash': 'Currency Clash–style (curated currency mix)',
  'coinwave-style': 'Coinwave-style multi-coin case',
  'card-line': 'ShackPack TCG / Football card lines',
  'wholly-custom': 'Wholly custom — no specific template',
  'not-sure': 'Not sure — recommend a direction',
};

export const BUDGET_LABELS: Record<ShackpackBuilderSpec['budgetRange'], string> = {
  'under-5k': 'Under $5,000 (indicative)',
  '5k-15k': '$5,000 – $15,000',
  '15k-50k': '$15,000 – $50,000',
  '50k-plus': '$50,000+',
  'discuss-privately': 'Prefer to discuss privately',
};

export const TIMELINE_LABELS: Record<
  NonNullable<ShackpackBuilderSpec['timeline']>,
  string
> = {
  rush: 'ASAP / rush',
  '1-3mo': '1–3 months',
  '3-6mo': '3–6 months',
  flexible: 'Flexible',
};
