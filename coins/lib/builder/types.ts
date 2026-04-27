import type { BuildLineInput } from './schema';
import { TIER_ORDER, type Grader, type Tier } from './catalog';

export type BuildLine = {
  id?: string;
  order: number;
  coinType: string;
  quantity: number;
  grader: Grader;
  /**
   * Persisted per-line for storage / email / API stability. The UI no longer
   * lets users set this per row — the BuilderShell propagates the build-level
   * `BuildDraft.tier` into every line on every change, so all lines share the
   * same tier in practice.
   */
  tier: Tier;
  notes?: string | null;
};

export type BuildDraft = {
  id?: string;
  shortCode?: string;
  name: string;
  packCount: number;
  /**
   * Build-level "Target per slot" — applies to every slot in the build. The
   * UI surfaces this as a single slider; we fan it out to every line at
   * serialization time so the server and email rendering stay unchanged.
   */
  tier: Tier;
  status: 'DRAFT' | 'SAVED' | 'SUBMITTED' | 'ARCHIVED';
  artworkUrl?: string | null;
  artworkKey?: string | null;
  notes?: string | null;
  lines: BuildLine[];
};

export type PersistedBuild = BuildDraft & {
  id: string;
  shortCode: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | null;
  archivedAt?: string | null;
};

export function toUpsertInput(draft: BuildDraft): {
  name: string;
  packCount: number;
  artworkUrl?: string | null;
  artworkKey?: string | null;
  notes?: string | null;
  lines: BuildLineInput[];
} {
  return {
    name: draft.name,
    packCount: draft.packCount,
    artworkUrl: draft.artworkUrl ?? null,
    artworkKey: draft.artworkKey ?? null,
    notes: draft.notes ?? null,
    lines: draft.lines.map((line, i) => ({
      id: line.id,
      order: i,
      coinType: line.coinType,
      quantity: line.quantity,
      grader: line.grader,
      tier: draft.tier,
      notes: line.notes ?? null,
    })),
  };
}

export function emptyDraft(packCount = 20, tier: Tier = 'SELECT'): BuildDraft {
  return {
    name: 'My custom ShackPack',
    packCount,
    tier,
    status: 'DRAFT',
    lines: [],
  };
}

export function totalCoins(draft: BuildDraft): number {
  return draft.lines.reduce((sum, l) => sum + (l.quantity || 0), 0);
}

/**
 * Pick a representative build-level tier from a set of lines (e.g. when
 * loading an existing build from the server, or when applying a preset
 * whose lines have heterogeneous tiers).
 *
 * Strategy: most-frequent tier wins; on ties, the higher-end tier wins.
 */
export function dominantTier(
  lines: { tier: Tier }[],
  fallback: Tier = 'SELECT'
): Tier {
  if (lines.length === 0) return fallback;
  const counts = new Map<Tier, number>();
  for (const l of lines) counts.set(l.tier, (counts.get(l.tier) ?? 0) + 1);
  let best: Tier = lines[0].tier;
  let bestCount = 0;
  counts.forEach((count, tier) => {
    const beatsCount = count > bestCount;
    const tieAndHigher =
      count === bestCount && TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(best);
    if (beatsCount || tieAndHigher) {
      best = tier;
      bestCount = count;
    }
  });
  return best;
}
