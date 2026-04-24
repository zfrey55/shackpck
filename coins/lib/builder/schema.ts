import { z } from 'zod';
import {
  COIN_TYPE_IDS,
  GRADERS,
  MAX_PACK_COUNT,
  MIN_PACK_COUNT,
  TIERS,
} from './catalog';

export const buildLineSchema = z.object({
  id: z.string().cuid().optional(),
  order: z.number().int().min(0).max(4096),
  coinType: z.string().refine((v) => (COIN_TYPE_IDS as string[]).includes(v), {
    message: 'Unknown coin type.',
  }),
  quantity: z.number().int().min(1).max(500),
  grader: z.enum(GRADERS),
  tier: z.enum(TIERS),
  notes: z.string().trim().max(400).optional().nullable(),
});

export type BuildLineInput = z.infer<typeof buildLineSchema>;

export const buildUpsertSchema = z.object({
  name: z.string().trim().min(1).max(120),
  packCount: z
    .number()
    .int()
    .min(MIN_PACK_COUNT, `Minimum ${MIN_PACK_COUNT} packs.`)
    .max(MAX_PACK_COUNT, `Maximum ${MAX_PACK_COUNT} packs.`),
  artworkUrl: z.string().url().max(2048).optional().nullable(),
  artworkKey: z.string().max(512).optional().nullable(),
  notes: z.string().trim().max(4000).optional().nullable(),
  lines: z.array(buildLineSchema).max(500),
});

export type BuildUpsertInput = z.infer<typeof buildUpsertSchema>;

/** Submission payload — customer's contact info is sourced from the session/user record. */
export const buildSubmitSchema = z.object({
  additionalNotes: z.string().trim().max(4000).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
});

export type BuildSubmitInput = z.infer<typeof buildSubmitSchema>;
