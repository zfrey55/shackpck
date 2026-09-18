'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { TIER_DEFS, type CoinTypeDef } from '@/lib/builder/catalog';
import { dominantTier, emptyDraft, totalCoins, type BuildDraft, type PersistedBuild } from '@/lib/builder/types';
import { ArtworkUploader } from './ArtworkUploader';
import { BuildCanvas } from './BuildCanvas';
import { BuilderHeader } from './BuilderHeader';
import { BuilderLoadState } from './BuilderLoadState';
import { CaseSizeControl } from './CaseSizeControl';
import { CoinCatalog } from './CoinCatalog';
import { PresetStrip } from './PresetStrip';
import { SignInGateModal } from './SignInGateModal';
import { TierSlider } from './TierSlider';
import { useBuilderDraft } from './useBuilderDraft';
import { useBuilderPersistence } from './useBuilderPersistence';

type Props = {
  initialDraft?: BuildDraft | null;
  /** When present, the build is fetched after mount and hydrated. */
  loadBuildId?: string | null;
  /** Server-resolved: false when Netlify Blobs is not configured in this environment. */
  artworkAvailable?: boolean;
};

type ToastState = { kind: 'info' | 'success' | 'error'; message: string } | null;

export function BuilderShell({ initialDraft = null, loadBuildId = null, artworkAvailable = true }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isSignedIn = status === 'authenticated';

  const [toast, setToast] = useState<ToastState>(null);
  const toastTimer = useRef<number | null>(null);
  const showToast = useCallback((state: NonNullable<ToastState>, ms = 4500) => {
    setToast(state);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), ms);
  }, []);

  const d = useBuilderDraft(initialDraft);
  // Stable across renders (useCallback([]) inside the hook): safe in effect deps.
  const { replaceDraft, restoreStash, clearStash, stashDraft } = d;
  const [gate, setGate] = useState<null | 'save' | 'submit' | 'upload'>(null);
  /**
   * A picked file is previewing locally and has not been uploaded yet. Kept in a
   * ref as well: the uploader reports it and opens the gate in the SAME event,
   * so the gate handler would otherwise read the pre-click value.
   */
  const artworkPendingRef = useRef(false);
  const setArtworkPendingBoth = useCallback((pending: boolean) => {
    artworkPendingRef.current = pending;
  }, []);
  /** After a restore: the artwork the visitor had picked did not survive. */
  const [artworkNeedsReupload, setArtworkNeedsReupload] = useState(false);
  /** A save or submit came back 401: the session timed out mid-edit. */
  const [sessionExpired, setSessionExpired] = useState(false);

  const onLoaded = useCallback(
    (build: PersistedBuild) => {
      const buildTier = dominantTier(build.lines, 'SELECT');
      replaceDraft(
        {
          id: build.id,
          shortCode: build.shortCode,
          name: build.name,
          packCount: build.packCount,
          tier: buildTier,
          status: build.status,
          artworkUrl: build.artworkUrl ?? null,
          artworkKey: build.artworkKey ?? null,
          notes: build.notes ?? null,
          lines: build.lines.map((l, i) => ({
            id: (l as { id?: string }).id,
            order: i,
            coinType: l.coinType,
            quantity: l.quantity,
            grader: l.grader,
            tier: buildTier,
            notes: l.notes ?? null,
          })),
        },
        build.notes ?? ''
      );
    },
    [replaceDraft]
  );

  /** 401 on a write: stash the work FIRST, then say so. Nothing is lost. */
  const onSessionExpired = useCallback(() => {
    stashDraft({ artworkPending: artworkPendingRef.current });
    setSessionExpired(true);
  }, [stashDraft]);

  const p = useBuilderPersistence({
    loadBuildId,
    sessionStatus: status,
    onLoaded,
    showToast,
    onSessionExpired,
  });

  // Restore a stash left behind by the sign-in gate, once, per scope.
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current || p.loadState !== 'ready') return;
    restoredRef.current = true;
    const restored = restoreStash(loadBuildId ?? null);
    if (!restored) return;
    if (restored.artworkPending) {
      // The file itself could not come with it: uploading needs a saved build.
      setArtworkNeedsReupload(true);
      showToast(
        { kind: 'info', message: 'Picked your build back up. Your artwork was not saved — please upload it again.' },
        8000
      );
    } else {
      showToast({ kind: 'info', message: 'Picked your build back up where you left off.' });
    }
  }, [restoreStash, loadBuildId, p.loadState, showToast]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const coinsListed = totalCoins(d.draft);
  const isOver = coinsListed > d.draft.packCount;
  const submitted = d.draft.status === 'SUBMITTED';
  const signInHref = useCallback(
    () => `/auth/signin?callbackUrl=${encodeURIComponent(typeof window === 'undefined' ? '/build' : window.location.pathname + window.location.search)}`,
    []
  );

  const openGate = useCallback(
    (reason: 'save' | 'submit' | 'upload') => {
      stashDraft({ artworkPending: artworkPendingRef.current });
      setGate(reason);
    },
    [stashDraft]
  );

  const doSave = useCallback(async () => {
    if (!isSignedIn) return openGate('save');
    const persisted = await p.save(d.draft);
    if (!persisted) return;
    d.replaceDraft(
      { ...d.draft, id: persisted.id, shortCode: persisted.shortCode, status: persisted.status as BuildDraft['status'] },
      d.notes
    );
    clearStash();
    showToast({ kind: 'success', message: 'Build saved to your account.' });
  }, [clearStash, d, isSignedIn, openGate, p, showToast]);

  const doSubmit = useCallback(async () => {
    if (!isSignedIn) return openGate('submit');
    if (d.draft.lines.length === 0) {
      showToast({ kind: 'error', message: 'Add at least one coin before submitting.' });
      return;
    }
    const persisted = await p.submit(d.draft, {
      additionalNotes: d.notes || null,
      phone: d.phone || null,
    });
    if (!persisted) return;
    clearStash();
    router.push(`/my-builds?submitted=${persisted.id}`);
  }, [clearStash, d, isSignedIn, openGate, p, router, showToast]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || over.id !== 'build-canvas') return;
      const data = active.data.current as { type?: string; coin?: CoinTypeDef } | undefined;
      if (data?.type === 'catalog' && data.coin) d.addCoin(data.coin);
    },
    [d]
  );

  const startNew = useCallback(() => {
    clearStash();
    d.replaceDraft(emptyDraft(20), '', { phone: '' });
    p.startNewBuild();
    router.replace('/build');
  }, [clearStash, d, p, router]);

  if (p.loadState !== 'ready') {
    return (
      <BuilderLoadState
        state={p.loadState}
        signInHref={signInHref()}
        onStartNew={startNew}
        onRetry={() => router.refresh()}
      />
    );
  }

  const sessionName = session?.user?.name || session?.user?.email || '';

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SignInGateModal open={gate !== null} reason={gate ?? 'save'} onClose={() => setGate(null)} />
      {toast && (
        <div
          className={`fixed inset-x-0 top-20 z-40 mx-auto max-w-md rounded-md border px-4 py-3 text-sm shadow-lg ${
            toast.kind === 'success'
              ? 'border-emerald-500/60 bg-emerald-900/80 text-emerald-100'
              : toast.kind === 'error'
                ? 'border-red-500/60 bg-red-900/80 text-red-100'
                : 'border-gold/60 bg-slate-900 text-slate-100'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      )}

      <div className="space-y-4">
        {sessionExpired && (
          <div
            data-session-expired
            role="alert"
            className="rounded-lg border border-amber-600/70 bg-amber-900/30 p-3 text-sm text-amber-100"
          >
            <strong>Your session expired.</strong> Sign in to save your build — your work is kept here and comes back
            with you.{' '}
            <Link href={signInHref()} className="font-semibold underline">
              Sign in
            </Link>
          </div>
        )}
        <BuilderHeader
          name={d.draft.name}
          shortCode={d.draft.shortCode}
          onNameChange={(name) => d.patchDraft({ name })}
          dirty={d.dirty}
          saving={p.saving}
          submitting={p.submitting}
          submitted={submitted}
          canSubmit={!isOver && d.draft.lines.length > 0}
          isNew={!p.buildId}
          onSave={() => void doSave()}
          onSubmit={() => void doSubmit()}
        />

        {submitted ? (
          <div className="rounded-lg border border-emerald-700/50 bg-emerald-900/20 p-3 text-sm text-emerald-100">
            This build has been sent to ShackPack. We&apos;ll follow up to confirm availability and pricing. You can
            duplicate it from{' '}
            <Link href="/my-builds" className="underline">
              My builds
            </Link>{' '}
            to iterate.
          </div>
        ) : (
          <div className="rounded-lg border border-amber-800/50 bg-amber-900/15 p-3 text-xs text-amber-100">
            This builder is a <strong>quote request</strong>, not an order. Tier ranges are your
            <em> target per slot</em> — final availability and pricing are confirmed by the team before production. No
            payment is taken here.
          </div>
        )}

        <PresetStrip
          onApply={(preset) => {
            d.applyPreset(preset);
            showToast({ kind: 'info', message: `Loaded preset: ${preset.name}. Edit freely.` });
          }}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr_340px]">
          <aside className="order-2 lg:order-1">
            <CoinCatalog onAdd={d.addCoin} />
          </aside>

          <section className="order-1 lg:order-2 space-y-4">
            <CaseSizeControl value={d.draft.packCount} onChange={d.setPackCount} />

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Target per slot</h3>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    A single budget tier applied to every slot in this build.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-100">{TIER_DEFS[d.draft.tier].label}</div>
                  <div className="text-xs text-gold">{TIER_DEFS[d.draft.tier].range}</div>
                </div>
              </div>
              <div className="mt-3">
                <TierSlider value={d.draft.tier} onChange={d.setBuildTier} />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">{TIER_DEFS[d.draft.tier].hint}</p>
            </div>

            <BuildCanvas draft={d.draft} onLineChange={d.changeLine} onLineRemove={d.removeLine} />
            {d.draft.lines.length > 0 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Clear all lines from this build?')) d.clearLines();
                  }}
                  className="rounded-md border border-slate-800 px-3 py-1 text-xs text-slate-500 hover:border-red-500 hover:text-red-400"
                >
                  Clear build
                </button>
              </div>
            )}

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Extra details for the ShackPack team
              </h3>
              <label className="mt-2 block text-[11px] font-medium uppercase tracking-wide text-slate-400" htmlFor="build-phone">
                Phone (optional)
              </label>
              <input
                id="build-phone"
                value={d.phone}
                onChange={(e) => d.setPhone(e.target.value)}
                maxLength={40}
                placeholder="Best number to reach you"
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-100 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <label className="mt-3 block text-[11px] font-medium uppercase tracking-wide text-slate-400" htmlFor="build-notes">
                Notes for us (optional)
              </label>
              <textarea
                id="build-notes"
                value={d.notes}
                onChange={(e) => d.setNotes(e.target.value)}
                maxLength={4000}
                rows={3}
                placeholder="Anything we should know — target timeline, special requests, design inspiration, preferred graders…"
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-100 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
              {sessionName && (
                <p className="mt-2 text-[11px] text-slate-500">
                  Sending as <span className="text-slate-300">{sessionName}</span>.
                </p>
              )}
            </div>
          </section>

          <aside className="order-3">
            <ArtworkUploader
              artworkUrl={d.draft.artworkUrl}
              isSignedIn={isSignedIn}
              canUpload={artworkAvailable}
              buildId={p.buildId}
              ensureBuildId={() => p.ensureBuildId(d.draft)}
              needsReupload={artworkNeedsReupload}
              onLocalPreviewChange={(pending) => {
                setArtworkPendingBoth(pending);
                if (pending) setArtworkNeedsReupload(false);
              }}
              onUploaded={({ artworkUrl, artworkKey }) => {
                d.patchDraft({ artworkUrl, artworkKey });
                setArtworkPendingBoth(false);
                setArtworkNeedsReupload(false);
              }}
              onCleared={() => {
                d.patchDraft({ artworkUrl: null, artworkKey: null });
                setArtworkPendingBoth(false);
                setArtworkNeedsReupload(false);
              }}
              onRequireSignIn={() => openGate('upload')}
              onUploadFailed={(createdBuildId) => {
                // The build only existed so the upload had an id: undo it.
                if (createdBuildId) {
                  void p.discardBuild(createdBuildId);
                  d.patchDraft({ id: undefined, shortCode: undefined, status: 'DRAFT' });
                }
              }}
            />
          </aside>
        </div>
      </div>
    </DndContext>
  );
}
