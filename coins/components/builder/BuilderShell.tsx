'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  MAX_PACK_COUNT,
  MIN_PACK_COUNT,
  type CoinTypeDef,
  type Preset,
} from '@/lib/builder/catalog';
import {
  emptyDraft,
  toUpsertInput,
  totalCoins,
  type BuildDraft,
  type BuildLine,
  type PersistedBuild,
} from '@/lib/builder/types';
import { CaseSizeControl } from './CaseSizeControl';
import { CoinCatalog } from './CoinCatalog';
import { BuildCanvas } from './BuildCanvas';
import { PresetStrip } from './PresetStrip';
import { ArtworkUploader } from './ArtworkUploader';
import { SignInGateModal } from './SignInGateModal';

type Props = {
  initialDraft?: BuildDraft | null;
  /** When present, BuilderShell fetches this build after mount and hydrates. */
  loadBuildId?: string | null;
};

type ToastState = { kind: 'info' | 'success' | 'error'; message: string } | null;

export function BuilderShell({ initialDraft = null, loadBuildId = null }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isSignedIn = status === 'authenticated';

  const [draft, setDraft] = useState<BuildDraft>(() => initialDraft ?? emptyDraft(20));
  const [buildId, setBuildId] = useState<string | null>(initialDraft?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState(initialDraft?.notes ?? '');
  const [phone, setPhone] = useState('');
  const [gate, setGate] = useState<null | 'save' | 'submit' | 'upload'>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [loadingRemote, setLoadingRemote] = useState(Boolean(loadBuildId));

  // Hydrate from server when ?id= is present.
  useEffect(() => {
    if (!loadBuildId) return;
    if (status !== 'authenticated') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/build/${loadBuildId}`);
        if (!res.ok) {
          setToast({ kind: 'error', message: 'Could not load that build.' });
          return;
        }
        const data = (await res.json()) as PersistedBuild;
        if (cancelled) return;
        setDraft({
          id: data.id,
          shortCode: data.shortCode,
          name: data.name,
          packCount: data.packCount,
          status: data.status,
          artworkUrl: data.artworkUrl ?? null,
          artworkKey: data.artworkKey ?? null,
          notes: data.notes ?? null,
          lines: data.lines.map((l, i) => ({
            id: (l as { id?: string }).id,
            order: i,
            coinType: l.coinType,
            quantity: l.quantity,
            grader: l.grader,
            tier: l.tier,
            notes: l.notes ?? null,
          })),
        });
        setBuildId(data.id);
        setAdditionalNotes(data.notes ?? '');
      } finally {
        if (!cancelled) setLoadingRemote(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadBuildId, status]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const showToast = useCallback((state: NonNullable<ToastState>, ms = 4500) => {
    setToast(state);
    window.setTimeout(() => setToast(null), ms);
  }, []);

  const coinsListed = totalCoins(draft);
  const isOver = coinsListed > draft.packCount;
  const submitted = draft.status === 'SUBMITTED';

  // --- mutation helpers ---
  const patchDraft = (patch: Partial<BuildDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  };

  const addCoin = useCallback((coin: CoinTypeDef) => {
    setDraft((d) => {
      const existing = d.lines.find((l) => l.coinType === coin.id);
      if (existing) {
        return {
          ...d,
          lines: d.lines.map((l) =>
            l === existing ? { ...l, quantity: Math.min(500, l.quantity + 1) } : l
          ),
        };
      }
      const line: BuildLine = {
        order: d.lines.length,
        coinType: coin.id,
        quantity: 1,
        grader: 'ANY',
        tier: coin.defaultTier,
        notes: null,
      };
      return { ...d, lines: [...d.lines, line] };
    });
  }, []);

  const changeLine = useCallback((index: number, patch: Partial<BuildLine>) => {
    setDraft((d) => {
      const lines = d.lines.map((l, i) => (i === index ? { ...l, ...patch } : l));
      return { ...d, lines };
    });
  }, []);

  const removeLine = useCallback((index: number) => {
    setDraft((d) => ({ ...d, lines: d.lines.filter((_, i) => i !== index) }));
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setDraft((d) => ({
      ...d,
      name: d.lines.length === 0 ? `${preset.name} (custom)` : d.name,
      packCount: preset.packCount,
      lines: preset.lines.map((line, i) => ({
        order: i,
        coinType: line.coinType,
        quantity: line.quantity,
        grader: line.grader,
        tier: line.tier,
      })),
    }));
    showToast({ kind: 'info', message: `Loaded preset: ${preset.name}. Edit freely.` });
  }, [showToast]);

  const clearBuild = useCallback(() => {
    if (!window.confirm('Clear all lines from this build?')) return;
    setDraft((d) => ({ ...d, lines: [] }));
  }, []);

  // --- persistence ---
  const persistAsNew = useCallback(
    async (nextDraft: BuildDraft): Promise<PersistedBuild | null> => {
      const res = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...toUpsertInput(nextDraft), status: 'SAVED' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Save failed' }));
        throw new Error(data.error || 'Save failed');
      }
      return res.json();
    },
    []
  );

  const persistUpdate = useCallback(
    async (id: string, nextDraft: BuildDraft): Promise<PersistedBuild> => {
      const res = await fetch(`/api/build/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toUpsertInput(nextDraft)),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Save failed' }));
        throw new Error(data.error || 'Save failed');
      }
      return res.json();
    },
    []
  );

  const doSave = useCallback(async () => {
    if (!isSignedIn) {
      setGate('save');
      return null;
    }
    setSaving(true);
    try {
      const persisted = buildId
        ? await persistUpdate(buildId, draft)
        : await persistAsNew(draft);
      if (persisted) {
        setBuildId(persisted.id);
        setDraft((d) => ({
          ...d,
          id: persisted.id,
          shortCode: persisted.shortCode,
          status: persisted.status as BuildDraft['status'],
        }));
        showToast({ kind: 'success', message: 'Build saved to your account.' });
      }
      return persisted;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      showToast({ kind: 'error', message: msg });
      return null;
    } finally {
      setSaving(false);
    }
  }, [buildId, draft, isSignedIn, persistAsNew, persistUpdate, showToast]);

  /** Used by artwork uploader: if the build isn't saved yet, create a DRAFT so we have an id. */
  const ensureBuildId = useCallback(async (): Promise<string | null> => {
    if (buildId) return buildId;
    if (!isSignedIn) return null;
    const persisted = await persistAsNew(draft);
    if (persisted) {
      setBuildId(persisted.id);
      setDraft((d) => ({ ...d, id: persisted.id, shortCode: persisted.shortCode, status: 'SAVED' }));
      return persisted.id;
    }
    return null;
  }, [buildId, draft, isSignedIn, persistAsNew]);

  const doSubmit = useCallback(async () => {
    if (!isSignedIn) {
      setGate('submit');
      return;
    }
    if (draft.lines.length === 0) {
      showToast({ kind: 'error', message: 'Add at least one coin before submitting.' });
      return;
    }
    setSubmitting(true);
    try {
      // Save first so server has the latest state.
      const persisted = buildId
        ? await persistUpdate(buildId, draft)
        : await persistAsNew(draft);
      if (!persisted) {
        showToast({ kind: 'error', message: 'Could not save build before submitting.' });
        setSubmitting(false);
        return;
      }
      setBuildId(persisted.id);

      const res = await fetch(`/api/build/${persisted.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          additionalNotes: additionalNotes || null,
          phone: phone || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Submit failed' }));
        showToast({ kind: 'error', message: data.error || 'Submit failed' });
        return;
      }
      showToast({
        kind: 'success',
        message: "Sent to the ShackPack team — we'll follow up with pricing and confirmation.",
      });
      router.push(`/my-builds?submitted=${persisted.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submit failed';
      showToast({ kind: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  }, [
    additionalNotes,
    buildId,
    draft,
    isSignedIn,
    persistAsNew,
    persistUpdate,
    phone,
    router,
    showToast,
  ]);

  // --- drag handlers ---
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      if (over.id !== 'build-canvas') return;
      const data = active.data.current as { type?: string; coin?: CoinTypeDef } | undefined;
      if (data?.type === 'catalog' && data.coin) {
        addCoin(data.coin);
      }
    },
    [addCoin]
  );

  const sessionName = session?.user?.name || session?.user?.email || '';

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SignInGateModal
        open={gate !== null}
        reason={gate ?? 'save'}
        onClose={() => setGate(null)}
      />
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
        {/* Header / quick status */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Build name
            </label>
            <input
              value={draft.name}
              onChange={(e) => patchDraft({ name: e.target.value })}
              maxLength={120}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-base font-semibold text-slate-100 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {draft.shortCode && (
              <p className="mt-1 text-[10px] font-mono text-slate-500">Ref {draft.shortCode}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/my-builds"
              className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-gold/60 hover:text-gold"
            >
              My builds
            </Link>
            <button
              type="button"
              onClick={() => void doSave()}
              disabled={saving || submitted}
              className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:border-gold/60 disabled:opacity-60"
            >
              {saving ? 'Saving…' : buildId ? 'Save changes' : 'Save build'}
            </button>
            <button
              type="button"
              onClick={() => void doSubmit()}
              disabled={submitting || submitted || isOver || draft.lines.length === 0}
              className="rounded-md bg-gold px-4 py-1.5 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Sending…' : submitted ? 'Submitted' : 'Send to ShackPack'}
            </button>
          </div>
        </div>

        {/* Status banner */}
        {submitted ? (
          <div className="rounded-lg border border-emerald-700/50 bg-emerald-900/20 p-3 text-sm text-emerald-100">
            This build has been sent to ShackPack. We'll follow up to confirm availability and
            pricing. You can duplicate it from{' '}
            <Link href="/my-builds" className="underline">
              My builds
            </Link>{' '}
            to iterate.
          </div>
        ) : (
          <div className="rounded-lg border border-amber-800/50 bg-amber-900/15 p-3 text-xs text-amber-100">
            This builder is a <strong>quote request</strong>, not an order. Tier ranges are your
            <em> target per slot</em> — final availability and pricing are confirmed by the team
            before production. No payment is taken here.
          </div>
        )}

        <PresetStrip onApply={applyPreset} />

        {/* Main three-column grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr_340px]">
          <aside className="order-2 lg:order-1">
            <CoinCatalog onAdd={addCoin} />
          </aside>

          <section className="order-1 lg:order-2 space-y-4">
            <CaseSizeControl
              value={draft.packCount}
              onChange={(n) => patchDraft({ packCount: Math.max(MIN_PACK_COUNT, Math.min(MAX_PACK_COUNT, n)) })}
            />
            <BuildCanvas
              draft={draft}
              onLineChange={changeLine}
              onLineRemove={removeLine}
            />
            {draft.lines.length > 0 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearBuild}
                  className="rounded-md border border-slate-800 px-3 py-1 text-xs text-slate-500 hover:border-red-500 hover:text-red-400"
                >
                  Clear build
                </button>
              </div>
            )}

            {/* Submission extras */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Extra details for the ShackPack team
              </h3>
              <label className="mt-2 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Phone (optional)
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={40}
                placeholder="Best number to reach you"
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-100 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <label className="mt-3 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Notes for us (optional)
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
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
              artworkUrl={draft.artworkUrl}
              isSignedIn={isSignedIn}
              canUpload={true}
              buildId={buildId}
              ensureBuildId={ensureBuildId}
              onUploaded={({ artworkUrl, artworkKey }) =>
                patchDraft({ artworkUrl, artworkKey })
              }
              onCleared={() => patchDraft({ artworkUrl: null, artworkKey: null })}
              onRequireSignIn={() => setGate('upload')}
            />
          </aside>
        </div>
      </div>
    </DndContext>
  );
}

