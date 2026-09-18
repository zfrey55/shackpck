'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_PACK_COUNT, MIN_PACK_COUNT, type CoinTypeDef, type Preset, type Tier } from '@/lib/builder/catalog';
import {
  draftSnapshot,
  isDirty as computeDirty,
  parseStash,
  serializeStash,
  stashKey,
} from '@/lib/builder/draft-state';
import { dominantTier, emptyDraft, type BuildDraft, type BuildLine } from '@/lib/builder/types';

/**
 * Draft state for the builder: the draft itself, its edits, dirty tracking
 * against the last saved state, and the sessionStorage stash that carries
 * work-in-progress through the sign-in gate (a full page navigation).
 *
 * Dirty/stash logic lives in lib/builder/draft-state (pure, fixture-tested);
 * this hook is the React wiring around it.
 */
export function useBuilderDraft(initialDraft: BuildDraft | null) {
  const [draft, setDraft] = useState<BuildDraft>(() => initialDraft ?? emptyDraft(20));
  const [notes, setNotes] = useState(initialDraft?.notes ?? '');
  const [phone, setPhone] = useState('');
  /**
   * Snapshot of the state a save would have written. It starts as the pristine
   * draft this page opened with, so the first real edit registers as unsaved
   * work even before the build has ever been saved.
   */
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(() => {
    const start = initialDraft ?? emptyDraft(20);
    return draftSnapshot(start, initialDraft?.notes ?? '');
  });
  const scopeRef = useRef<string | null>(initialDraft?.id ?? null);

  const dirty = computeDirty(draft, notes, savedSnapshot);

  /** Warn before a reload or a close that would drop unsaved work. */
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  /** Replace the whole draft (remote load, stash restore, start-new). */
  const replaceDraft = useCallback(
    (next: BuildDraft, nextNotes: string, opts: { phone?: string } = {}) => {
      setDraft(next);
      setNotes(nextNotes);
      if (opts.phone !== undefined) setPhone(opts.phone);
      scopeRef.current = next.id ?? null;
      // Whether this came from a save, a server load or a reset, the new draft
      // is the baseline that later edits are measured against.
      setSavedSnapshot(draftSnapshot(next, nextNotes));
    },
    []
  );

  // ---- stash ----
  const stashDraft = useCallback((opts: { artworkPending?: boolean } = {}) => {
    const body = serializeStash({ draft, notes, phone, artworkPending: opts.artworkPending === true });
    if (!body) return false;
    try {
      window.sessionStorage.setItem(stashKey(scopeRef.current), body);
      return true;
    } catch {
      return false; // private mode / quota: the gate still works, the draft just is not kept
    }
  }, [draft, notes, phone]);

  const clearStash = useCallback(() => {
    try {
      window.sessionStorage.removeItem(stashKey(scopeRef.current));
      window.sessionStorage.removeItem(stashKey(null));
    } catch {
      /* ignore */
    }
  }, []);

  /** Restore a stash for this scope. Returns the payload it restored, or null. */
  const restoreStash = useCallback(
    (scopeId: string | null) => {
      let raw: string | null = null;
      try {
        raw = window.sessionStorage.getItem(stashKey(scopeId));
      } catch {
        return null;
      }
      const payload = parseStash(raw);
      if (!payload) return null;
      setDraft(payload.draft);
      setNotes(payload.notes);
      setPhone(payload.phone);
      scopeRef.current = payload.draft.id ?? scopeId;
      // The baseline is left alone on purpose: restored work is compared against
      // the last saved state (or the pristine draft), so it shows as unsaved.
      return payload;
    },
    []
  );

  // ---- edits ----
  const patchDraft = useCallback((patch: Partial<BuildDraft>) => setDraft((d) => ({ ...d, ...patch })), []);

  const setPackCount = useCallback(
    (n: number) => patchDraft({ packCount: Math.max(MIN_PACK_COUNT, Math.min(MAX_PACK_COUNT, n)) }),
    [patchDraft]
  );

  const addCoin = useCallback((coin: CoinTypeDef) => {
    setDraft((d) => {
      const existing = d.lines.find((l) => l.coinType === coin.id);
      if (existing) {
        return {
          ...d,
          lines: d.lines.map((l) => (l === existing ? { ...l, quantity: Math.min(500, l.quantity + 1) } : l)),
        };
      }
      const line: BuildLine = { order: d.lines.length, coinType: coin.id, quantity: 1, grader: 'ANY', tier: d.tier, notes: null };
      return { ...d, lines: [...d.lines, line] };
    });
  }, []);

  const setBuildTier = useCallback((tier: Tier) => {
    setDraft((d) => ({ ...d, tier, lines: d.lines.map((l) => ({ ...l, tier })) }));
  }, []);

  const changeLine = useCallback((index: number, patch: Partial<BuildLine>) => {
    setDraft((d) => ({ ...d, lines: d.lines.map((l, i) => (i === index ? { ...l, ...patch } : l)) }));
  }, []);

  const removeLine = useCallback((index: number) => {
    setDraft((d) => ({ ...d, lines: d.lines.filter((_, i) => i !== index) }));
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setDraft((d) => {
      const presetTier = dominantTier(preset.lines, d.tier);
      return {
        ...d,
        name: d.lines.length === 0 ? `${preset.name} (custom)` : d.name,
        packCount: preset.packCount,
        tier: presetTier,
        lines: preset.lines.map((line, i) => ({
          order: i,
          coinType: line.coinType,
          quantity: line.quantity,
          grader: line.grader,
          tier: presetTier,
        })),
      };
    });
  }, []);

  const clearLines = useCallback(() => setDraft((d) => ({ ...d, lines: [] })), []);

  return {
    draft,
    notes,
    phone,
    dirty,
    setNotes,
    setPhone,
    patchDraft,
    setPackCount,
    addCoin,
    setBuildTier,
    changeLine,
    removeLine,
    applyPreset,
    clearLines,
    replaceDraft,
    stashDraft,
    clearStash,
    restoreStash,
  };
}
