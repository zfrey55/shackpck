import type { BuildLineInput } from './schema';
import type { Grader, Tier } from './catalog';

export type BuildLine = {
  id?: string;
  order: number;
  coinType: string;
  quantity: number;
  grader: Grader;
  tier: Tier;
  notes?: string | null;
};

export type BuildDraft = {
  id?: string;
  shortCode?: string;
  name: string;
  packCount: number;
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
      tier: line.tier,
      notes: line.notes ?? null,
    })),
  };
}

export function emptyDraft(packCount = 20): BuildDraft {
  return {
    name: 'My custom ShackPack',
    packCount,
    status: 'DRAFT',
    lines: [],
  };
}

export function totalCoins(draft: BuildDraft): number {
  return draft.lines.reduce((sum, l) => sum + (l.quantity || 0), 0);
}
