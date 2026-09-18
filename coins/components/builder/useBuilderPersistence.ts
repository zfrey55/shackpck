'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toUpsertInput, type BuildDraft, type PersistedBuild } from '@/lib/builder/types';

/**
 * Server side of the builder: loading a build by id, saving, submitting and
 * the artwork build-id bootstrap.
 *
 * Two things this fixes and must keep doing:
 *   - LOAD STATES are explicit. A failed load never leaves an editable blank
 *     draft that a later save would write as a brand-new build.
 *   - SAVE AND SUBMIT ARE CLICK-SAFE via refs, not just the disabled attribute:
 *     several clicks in one tick all ran before React re-rendered, and each
 *     created its own build.
 */

export type LoadState = 'ready' | 'loading' | 'signed-out' | 'not-found' | 'error';

type Args = {
  loadBuildId: string | null;
  sessionStatus: 'authenticated' | 'loading' | 'unauthenticated';
  /** Called with the loaded build so the draft hook can hydrate from it. */
  onLoaded: (build: PersistedBuild) => void;
  showToast: (state: { kind: 'info' | 'success' | 'error'; message: string }) => void;
};

export function useBuilderPersistence({ loadBuildId, sessionStatus, onLoaded, showToast }: Args) {
  const [buildId, setBuildId] = useState<string | null>(null);
  /**
   * Held in a ref so the load effect depends only on the id and the session.
   * With onLoaded in the dependency list, a caller that rebuilds the callback
   * each render (the draft hook does, since the draft changes) re-ran the effect
   * forever: one fetch per render.
   */
  const onLoadedRef = useRef(onLoaded);
  useEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>(loadBuildId ? 'loading' : 'ready');
  const inFlight = useRef<{ save: boolean; submit: boolean }>({ save: false, submit: false });

  // ---- load ----
  useEffect(() => {
    if (!loadBuildId) {
      setLoadState('ready');
      return;
    }
    if (sessionStatus === 'loading') {
      setLoadState('loading');
      return;
    }
    if (sessionStatus === 'unauthenticated') {
      setLoadState('signed-out');
      return;
    }
    let cancelled = false;
    setLoadState('loading');
    (async () => {
      try {
        const res = await fetch(`/api/build/${loadBuildId}`);
        if (cancelled) return;
        if (res.status === 404 || res.status === 401) {
          setLoadState('not-found');
          return;
        }
        if (!res.ok) {
          setLoadState('error');
          return;
        }
        const data = (await res.json()) as PersistedBuild;
        if (cancelled) return;
        setBuildId(data.id);
        onLoadedRef.current(data);
        setLoadState('ready');
      } catch {
        if (!cancelled) setLoadState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadBuildId, sessionStatus]);

  /** Leave the failed load behind and start a fresh, saveable build. */
  const startNewBuild = useCallback(() => {
    setBuildId(null);
    setLoadState('ready');
  }, []);

  // ---- writes ----
  const persist = useCallback(async (draft: BuildDraft, id: string | null): Promise<PersistedBuild> => {
    const res = await fetch(id ? `/api/build/${id}` : '/api/build', {
      method: id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(id ? toUpsertInput(draft) : { ...toUpsertInput(draft), status: 'SAVED' }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Save failed' }));
      throw new Error(data.error || 'Save failed');
    }
    return res.json();
  }, []);

  const save = useCallback(
    async (draft: BuildDraft): Promise<PersistedBuild | null> => {
      if (inFlight.current.save) return null;
      inFlight.current.save = true;
      setSaving(true);
      try {
        const persisted = await persist(draft, buildId);
        setBuildId(persisted.id);
        return persisted;
      } catch (err) {
        showToast({ kind: 'error', message: err instanceof Error ? err.message : 'Save failed' });
        return null;
      } finally {
        inFlight.current.save = false;
        setSaving(false);
      }
    },
    [buildId, persist, showToast]
  );

  /** Artwork upload needs an id. `created` is true when this call made the build. */
  const ensureBuildId = useCallback(
    async (draft: BuildDraft): Promise<{ id: string; created: boolean } | null> => {
      if (buildId) return { id: buildId, created: false };
      try {
        const persisted = await persist(draft, null);
        setBuildId(persisted.id);
        return { id: persisted.id, created: true };
      } catch {
        return null;
      }
    },
    [buildId, persist]
  );

  /** Undo a build that only existed for an artwork upload that then failed. */
  const discardBuild = useCallback(async (id: string) => {
    try {
      await fetch(`/api/build/${id}`, { method: 'DELETE' });
    } catch {
      /* best effort */
    }
    setBuildId(null);
  }, []);

  const submit = useCallback(
    async (
      draft: BuildDraft,
      extras: { additionalNotes: string | null; phone: string | null }
    ): Promise<PersistedBuild | null> => {
      if (inFlight.current.submit) return null;
      inFlight.current.submit = true;
      setSubmitting(true);
      try {
        const persisted = await persist(draft, buildId);
        setBuildId(persisted.id);
        const res = await fetch(`/api/build/${persisted.id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(extras),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Submit failed' }));
          showToast({ kind: 'error', message: data.error || 'Submit failed' });
          return null;
        }
        return persisted;
      } catch (err) {
        showToast({ kind: 'error', message: err instanceof Error ? err.message : 'Submit failed' });
        return null;
      } finally {
        inFlight.current.submit = false;
        setSubmitting(false);
      }
    },
    [buildId, persist, showToast]
  );

  return { buildId, setBuildId, saving, submitting, loadState, startNewBuild, save, submit, ensureBuildId, discardBuild };
}
