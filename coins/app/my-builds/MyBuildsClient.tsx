'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { PersistedBuild } from '@/lib/builder/types';
import { CompareDrawer } from '@/components/builder/CompareDrawer';
import { totalCoins } from '@/lib/builder/types';

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-slate-700 text-slate-200' },
  SAVED: { label: 'Saved', className: 'bg-slate-800 text-slate-200' },
  SUBMITTED: { label: 'Submitted', className: 'bg-emerald-800 text-emerald-100' },
  ARCHIVED: { label: 'Archived', className: 'bg-amber-900/60 text-amber-200' },
};

export function MyBuildsClient() {
  const { status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const [builds, setBuilds] = useState<PersistedBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const justSubmitted = params.get('submitted');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/my-builds');
    }
  }, [status, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/build${showArchived ? '?includeArchived=1' : ''}`);
      if (!res.ok) {
        setError('Failed to load builds.');
        return;
      }
      setBuilds(await res.json());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load builds.');
    } finally {
      setLoading(false);
    }
  }, [showArchived]);

  useEffect(() => {
    if (status === 'authenticated') void load();
  }, [status, load]);

  async function rename(build: PersistedBuild) {
    const next = window.prompt('New name:', build.name);
    if (!next || next.trim() === build.name) return;
    const res = await fetch(`/api/build/${build.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: next.trim(),
        packCount: build.packCount,
        artworkUrl: build.artworkUrl ?? null,
        artworkKey: build.artworkKey ?? null,
        notes: build.notes ?? null,
        lines: build.lines.map((l, i) => ({
          order: i,
          coinType: l.coinType,
          quantity: l.quantity,
          grader: l.grader,
          tier: l.tier,
          notes: l.notes ?? null,
        })),
      }),
    });
    if (!res.ok) {
      setToast('Rename failed.');
      return;
    }
    setToast('Renamed.');
    void load();
  }

  async function duplicate(build: PersistedBuild) {
    const res = await fetch(`/api/build/${build.id}/duplicate`, { method: 'POST' });
    if (!res.ok) {
      setToast('Duplicate failed.');
      return;
    }
    setToast('Duplicated.');
    void load();
  }

  async function toggleArchive(build: PersistedBuild) {
    const res = await fetch(`/api/build/${build.id}/archive`, { method: 'POST' });
    if (!res.ok) {
      setToast('Archive failed.');
      return;
    }
    setToast(build.status === 'ARCHIVED' ? 'Unarchived.' : 'Archived.');
    void load();
  }

  async function remove(build: PersistedBuild) {
    if (!window.confirm(`Delete "${build.name}" permanently? This cannot be undone.`)) return;
    const res = await fetch(`/api/build/${build.id}`, { method: 'DELETE' });
    if (!res.ok) {
      setToast('Delete failed.');
      return;
    }
    setToast('Deleted.');
    void load();
  }

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(t);
  }, [toast]);

  if (status === 'loading' || loading) {
    return (
      <div className="py-16 text-center text-slate-400">
        <p>Loading your builds…</p>
      </div>
    );
  }
  if (status !== 'authenticated') return null;

  return (
    <>
      {toast && (
        <div className="fixed inset-x-0 top-20 z-40 mx-auto max-w-sm rounded-md border border-gold/50 bg-slate-900 px-4 py-2 text-center text-sm text-slate-100 shadow-lg">
          {toast}
        </div>
      )}

      {compareOpen && (
        <CompareDrawer
          builds={builds.filter((b) => b.status !== 'ARCHIVED')}
          onClose={() => setCompareOpen(false)}
        />
      )}

      {justSubmitted && (
        <div className="mb-5 rounded-lg border border-emerald-700/60 bg-emerald-900/25 p-4 text-sm text-emerald-100">
          <p className="font-semibold">Your build is on its way to the team.</p>
          <p className="mt-1">
            We'll review, confirm availability, and follow up with pricing before production.
          </p>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2 text-slate-300">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="h-4 w-4 accent-gold"
            />
            Show archived
          </label>
          <button
            type="button"
            onClick={() => setCompareOpen(true)}
            disabled={builds.filter((b) => b.status !== 'ARCHIVED').length < 2}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:border-gold/60 disabled:opacity-50"
          >
            Compare builds
          </button>
        </div>
        <Link
          href="/build"
          className="rounded-md bg-gold px-4 py-1.5 text-sm font-semibold text-black hover:opacity-90"
        >
          New build
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {builds.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-8 text-center">
          <p className="text-slate-300">You haven't saved a build yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Design a custom case and save it to iterate or duplicate later.
          </p>
          <Link
            href="/build"
            className="mt-4 inline-block rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
          >
            Start a build
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {builds.map((build) => {
            const badge = STATUS_BADGES[build.status] ?? STATUS_BADGES.DRAFT;
            const coins = totalCoins(build);
            const unassigned = build.packCount - coins;
            return (
              <div
                key={build.id}
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <h3 className="text-lg font-semibold text-slate-100">{build.name}</h3>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Ref {build.shortCode} · {build.packCount} packs · {coins} coins listed
                      {unassigned > 0 && build.status !== 'SUBMITTED' ? ` · ${unassigned} unassigned` : ''}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Updated {new Date(build.updatedAt).toLocaleString()}
                      {build.submittedAt
                        ? ` · Submitted ${new Date(build.submittedAt).toLocaleString()}`
                        : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {build.status !== 'SUBMITTED' && build.status !== 'ARCHIVED' && (
                      <Link
                        href={`/build?id=${build.id}`}
                        className="rounded-md border border-gold/50 bg-gold/10 px-3 py-1.5 text-gold hover:bg-gold/20"
                      >
                        Edit
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => rename(build)}
                      disabled={build.status === 'SUBMITTED'}
                      className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-200 hover:border-gold/60 disabled:opacity-50"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicate(build)}
                      className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-200 hover:border-gold/60"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleArchive(build)}
                      className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-200 hover:border-amber-500/60"
                    >
                      {build.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(build)}
                      className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-400 hover:border-red-500 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
