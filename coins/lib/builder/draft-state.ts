import type { BuildDraft } from './types';
import { GRADERS, MAX_PACK_COUNT, MIN_PACK_COUNT, TIERS } from './catalog';

/**
 * Pure helpers for builder draft state: dirty comparison and the
 * sessionStorage stash that carries a work-in-progress draft through the
 * sign-in gate (a full page navigation, which would otherwise lose it).
 *
 * No React and no browser APIs here, so this is covered by
 * scripts/test-builder-draft.ts.
 */

export const STASH_VERSION = 'v2';

/** One stash per build scope: an unsaved build and build <id> never overwrite each other. */
export function stashKey(buildId?: string | null): string {
  const scope = buildId && buildId.trim() ? buildId.trim() : 'new';
  return `shackpack:builder:draft:${STASH_VERSION}:${scope}`;
}

export type StashPayload = { draft: BuildDraft; notes: string; phone: string };

/**
 * Stable string of everything a save would persist. Two drafts that would
 * write the same row produce the same snapshot, so trailing whitespace or a
 * re-render never looks like an edit.
 */
export function draftSnapshot(draft: BuildDraft, notes: string): string {
  return JSON.stringify({
    name: draft.name.trim(),
    packCount: draft.packCount,
    tier: draft.tier,
    artworkUrl: draft.artworkUrl ?? null,
    artworkKey: draft.artworkKey ?? null,
    notes: (notes ?? '').trim(),
    lines: draft.lines.map((l) => ({
      coinType: l.coinType,
      quantity: l.quantity,
      grader: l.grader,
      notes: (l.notes ?? '').trim(),
    })),
  });
}

export function isDirty(draft: BuildDraft, notes: string, savedSnapshot: string | null): boolean {
  if (savedSnapshot === null) return false;
  return draftSnapshot(draft, notes) !== savedSnapshot;
}

/** Guard against a huge stash (quota errors) — a build this size is not a real one. */
export const MAX_STASH_CHARS = 256 * 1024;

export function serializeStash(payload: StashPayload): string | null {
  const body = JSON.stringify({
    version: STASH_VERSION,
    draft: payload.draft,
    notes: payload.notes ?? '',
    phone: payload.phone ?? '',
  });
  return body.length > MAX_STASH_CHARS ? null : body;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === 'string' ? v : null);
const int = (v: unknown) => (typeof v === 'number' && Number.isInteger(v) ? v : null);

/**
 * Parse a stash back. Anything unexpected returns null: the stash is
 * attacker-reachable (it is just sessionStorage) and a stale version must never
 * hydrate the builder with a half-valid draft.
 */
export function parseStash(raw: string | null | undefined): StashPayload | null {
  if (!raw || raw.length > MAX_STASH_CHARS) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(parsed) || parsed.version !== STASH_VERSION) return null;
  const d = parsed.draft;
  if (!isRecord(d)) return null;

  const name = str(d.name);
  const packCount = int(d.packCount);
  const tier = str(d.tier);
  const status = str(d.status);
  if (name === null || packCount === null || tier === null || status === null) return null;
  if (packCount < MIN_PACK_COUNT || packCount > MAX_PACK_COUNT) return null;
  if (!(TIERS as readonly string[]).includes(tier)) return null;
  if (!['DRAFT', 'SAVED', 'SUBMITTED', 'ARCHIVED'].includes(status)) return null;
  if (!Array.isArray(d.lines) || d.lines.length > 500) return null;

  const lines: BuildDraft['lines'] = [];
  for (const [i, entry] of d.lines.entries()) {
    if (!isRecord(entry)) return null;
    const coinType = str(entry.coinType);
    const quantity = int(entry.quantity);
    const grader = str(entry.grader);
    if (coinType === null || quantity === null || grader === null) return null;
    if (quantity < 1 || quantity > 500) return null;
    if (!(GRADERS as readonly string[]).includes(grader)) return null;
    lines.push({
      order: i,
      coinType,
      quantity,
      grader: grader as BuildDraft['lines'][number]['grader'],
      tier: tier as BuildDraft['tier'],
      notes: str(entry.notes),
    });
  }

  return {
    draft: {
      id: str(d.id) ?? undefined,
      shortCode: str(d.shortCode) ?? undefined,
      name,
      packCount,
      tier: tier as BuildDraft['tier'],
      status: status as BuildDraft['status'],
      artworkUrl: str(d.artworkUrl),
      artworkKey: str(d.artworkKey),
      notes: str(d.notes),
      lines,
    },
    notes: str(parsed.notes) ?? '',
    phone: str(parsed.phone) ?? '',
  };
}
