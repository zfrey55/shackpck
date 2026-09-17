/**
 * Server-side validation for POST /api/contact.
 *
 * A discriminated union on `reason`. BUYING carries the multi-step answers;
 * ORDER and OTHER are the short form. Products are checked against the real
 * purchasable catalog ids for their line, so a client cannot submit an id we
 * do not sell or a product under the wrong line.
 */

import { z } from 'zod';
import {
  CUSTOM_BRANDING,
  INQUIRY_LINES,
  PACKS_PER_SET,
  SETS_PER_MONTH,
  TIMELINES,
} from '@/lib/contact-inquiry';
import {
  allowedProductValues,
  lineForProductId,
  purchasableProductsByLine,
} from '@/lib/contact-inquiry-catalog';
import { US_STATES } from '@/lib/us-states';

const PRODUCTS_BY_LINE = purchasableProductsByLine();

const name = z.string().trim().min(1).max(120);
/** Optional free text: blank becomes undefined so it is stored as null. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const common = {
  firstName: name,
  lastName: name,
  email: z.string().trim().email().max(254),
  honeypot: z.string().max(1000).optional().default(''),
  elapsedMs: z.number().finite().nonnegative(),
};

const lineDetail = z.object({
  products: z.array(z.string().max(100)).min(1).max(100),
  packsPerSet: z.string(),
  setsPerMonth: z.enum(SETS_PER_MONTH),
});

const buying = z.object({
  reason: z.literal('BUYING'),
  ...common,
  phone: z.string().trim().min(1).max(40),
  businessName: z.string().trim().min(1).max(200),
  whatnotHandle: optionalText(100),
  state: z.string().refine((code) => US_STATES.some((s) => s.code === code), 'Unknown state'),
  productLines: z.array(z.enum(INQUIRY_LINES)).min(1).max(INQUIRY_LINES.length),
  lineDetails: z
    .object({ coins: lineDetail.optional(), sports: lineDetail.optional(), pokemon: lineDetail.optional() })
    .strict(),
  customBranding: z.enum(CUSTOM_BRANDING),
  targetPricePerCase: optionalText(200),
  timeline: z.enum(TIMELINES),
  message: optionalText(10000),
  sourcePack: z.string().max(100).optional(),
});

const simple = <R extends 'ORDER' | 'OTHER'>(reason: R) =>
  z.object({
    reason: z.literal(reason),
    ...common,
    phone: optionalText(40),
    message: z.string().trim().min(1).max(10000),
  });

export const inquirySchema = z
  .discriminatedUnion('reason', [buying, simple('ORDER'), simple('OTHER')])
  .superRefine((v, ctx) => {
    if (v.reason !== 'BUYING') return;
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });

    if (new Set(v.productLines).size !== v.productLines.length) {
      issue(['productLines'], 'Duplicate product line');
    }
    for (const line of INQUIRY_LINES) {
      const detail = v.lineDetails[line];
      const selected = v.productLines.includes(line);
      if (selected && !detail) issue(['lineDetails', line], 'Missing details for a selected line');
      if (!selected && detail) issue(['lineDetails', line], 'Details for a line that was not selected');
      if (!detail) continue;

      const allowed = allowedProductValues(line, PRODUCTS_BY_LINE);
      if (detail.products.some((p) => !allowed.has(p))) {
        issue(['lineDetails', line, 'products'], 'Unknown product for this line');
      }
      if (new Set(detail.products).size !== detail.products.length) {
        issue(['lineDetails', line, 'products'], 'Duplicate product');
      }
      if (!PACKS_PER_SET[line].includes(detail.packsPerSet)) {
        issue(['lineDetails', line, 'packsPerSet'], 'Invalid packs per set for this line');
      }
    }
    if (v.sourcePack !== undefined && lineForProductId(v.sourcePack, PRODUCTS_BY_LINE) === null) {
      issue(['sourcePack'], 'Unknown source pack');
    }
  });

export type InquiryInput = z.infer<typeof inquirySchema>;
export type BuyingInquiryInput = Extract<InquiryInput, { reason: 'BUYING' }>;
