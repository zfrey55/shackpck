'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  COIN_CATEGORY_LABELS,
  COIN_CATEGORY_ORDER,
  GRADER_LABELS,
  TIER_DEFS,
  getCoinDef,
  type CoinCategory,
  type Grader,
  type Tier,
} from '@/lib/builder/catalog';

type AdminBuild = {
  id: string;
  shortCode: string;
  name: string;
  packCount: number;
  status: 'DRAFT' | 'SAVED' | 'SUBMITTED' | 'ARCHIVED';
  artworkUrl: string | null;
  artworkKey: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  archivedAt: string | null;
  user: { id: string; email: string; name: string | null };
  lines: Array<{
    id: string;
    order: number;
    coinType: string;
    quantity: number;
    grader: string;
    tier: string;
    notes: string | null;
  }>;
};

const STATUS_OPTIONS = ['SUBMITTED', 'SAVED', 'DRAFT', 'ARCHIVED', 'ALL'] as const;

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-slate-700 text-slate-200',
  SAVED: 'bg-slate-800 text-slate-200',
  SUBMITTED: 'bg-emerald-800 text-emerald-100',
  ARCHIVED: 'bg-amber-900/60 text-amber-200',
};

export function AdminBuildsClient() {
  const { data: session, status } = useSession();
  const params = useSearchParams();
  const initialId = params.get('id');

  // Email links use ?id=... so we open with ALL filter — easier to find any
  // status (submitted / saved / archived) that link refers to.
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_OPTIONS[number]>(
    initialId ? 'ALL' : 'SUBMITTED'
  );
  const [builds, setBuilds] = useState<AdminBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [digestSending, setDigestSending] = useState(false);
  const [digestResult, setDigestResult] = useState<string | null>(null);

  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = status === 'authenticated' && role === 'ADMIN';

  const sendDigest = useCallback(async () => {
    setDigestSending(true);
    setDigestResult(null);
    try {
      const res = await fetch('/api/admin/builds/email-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 45 }),
      });
      const data = await res.json().catch(() => ({}) as { count?: number; error?: string });
      if (!res.ok) {
        setDigestResult(
          `Error sending digest: ${(data as { error?: string }).error ?? `HTTP ${res.status}`}`
        );
      } else {
        const count = (data as { count?: number }).count ?? 0;
        setDigestResult(
          `Sent digest of ${count} ${count === 1 ? 'build' : 'builds'} to ADMIN_EMAIL. Check your inbox.`
        );
      }
    } catch (err) {
      setDigestResult(err instanceof Error ? err.message : 'Failed to send digest.');
    } finally {
      setDigestSending(false);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/builds?status=${statusFilter}`);
      if (!res.ok) {
        setError(res.status === 403 ? 'You need admin access.' : 'Failed to load builds.');
        return;
      }
      const data = (await res.json()) as AdminBuild[];
      setBuilds(data);
      // keep selection if still present
      if (selectedId && !data.find((b) => b.id === selectedId)) {
        setSelectedId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load builds.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, selectedId]);

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return builds;
    return builds.filter((b) => {
      const haystack = [
        b.name,
        b.shortCode,
        b.user.email,
        b.user.name ?? '',
        b.notes ?? '',
        ...b.lines.map((l) => getCoinDef(l.coinType)?.label ?? l.coinType),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [builds, search]);

  const selected = filtered.find((b) => b.id === selectedId) ?? null;

  if (status === 'loading') {
    return <p className="text-center text-slate-400">Loading…</p>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-6 text-sm text-slate-200">
        <p className="font-semibold text-gold">You need to sign in first.</p>
        <p className="mt-1 text-slate-300">
          The builder inquiries page is only visible to admins.
        </p>
        <Link
          href="/auth/signin?callbackUrl=/admin/builds"
          className="mt-4 inline-block rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-lg border border-amber-700/60 bg-amber-900/20 p-6 text-sm text-amber-100">
        <p className="font-semibold">
          Your account ({session?.user?.email}) isn't an admin yet.
        </p>
        <p className="mt-2">
          Promote it from your terminal with the production database URL:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs text-slate-200">
          <code>{`DATABASE_URL="postgresql://...prod url..." \\
  npx tsx scripts/promote-admin.ts ${session?.user?.email ?? 'you@example.com'}`}</code>
        </pre>
        <p className="mt-2 text-amber-200">
          After running it, <strong>sign out and sign back in</strong> so your session
          picks up the new role. Then reload this page.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof STATUS_OPTIONS[number])}
              className="mt-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-100 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="w-72">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Search
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="name, email, ref, coin…"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-100 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-200 hover:border-gold/60 disabled:opacity-60"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={() => void sendDigest()}
            disabled={digestSending}
            className="rounded-md border border-gold/50 bg-gold/10 px-3 py-1.5 font-semibold text-gold hover:bg-gold/20 disabled:opacity-60"
            title="Email a summary of the last 45 days of submissions to ADMIN_EMAIL"
          >
            {digestSending ? 'Sending…' : 'Email me last 45 days'}
          </button>
          <span className="text-xs text-slate-500">
            {filtered.length} {filtered.length === 1 ? 'build' : 'builds'}
          </span>
        </div>
      </div>

      {digestResult && (
        <div
          className={`mb-4 rounded-md border px-3 py-2 text-sm ${
            digestResult.startsWith('Sent')
              ? 'border-emerald-700 bg-emerald-900/30 text-emerald-100'
              : 'border-red-700 bg-red-900/30 text-red-200'
          }`}
        >
          {digestResult}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* List */}
        <div className="space-y-2">
          {loading && builds.length === 0 ? (
            <p className="text-slate-400">Loading builds…</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
              No builds match this filter.
            </div>
          ) : (
            filtered.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedId(b.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selectedId === b.id
                    ? 'border-gold/60 bg-slate-900'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      STATUS_BADGE[b.status] ?? 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {b.status}
                  </span>
                  <span className="truncate text-sm font-semibold text-slate-100">{b.name}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  {b.user.name || b.user.email}
                  {b.user.name && b.user.email ? ` · ${b.user.email}` : ''}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Ref {b.shortCode} · {b.packCount} packs ·{' '}
                  {b.lines.reduce((s, l) => s + l.quantity, 0)} coins listed
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {b.submittedAt
                    ? `Submitted ${new Date(b.submittedAt).toLocaleString()}`
                    : `Updated ${new Date(b.updatedAt).toLocaleString()}`}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Detail */}
        <div>
          {selected ? (
            <BuildDetail build={selected} />
          ) : (
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
              Select a build on the left to see the full configuration.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function BuildDetail({ build }: { build: AdminBuild }) {
  const totals = useMemo(() => {
    const out: Record<CoinCategory, number> = {
      gold: 0,
      platinum: 0,
      'silver-bullion': 0,
      'classic-silver': 0,
      denominational: 0,
      other: 0,
    };
    for (const line of build.lines) {
      const coin = getCoinDef(line.coinType);
      if (!coin) {
        out.other += line.quantity;
      } else {
        out[coin.category] += line.quantity;
      }
    }
    return out;
  }, [build.lines]);

  const coinsListed = build.lines.reduce((s, l) => s + l.quantity, 0);
  const unassigned = build.packCount - coinsListed;

  const exportText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`ShackPack Builder — ${build.name}`);
    lines.push(`Ref: ${build.shortCode}`);
    lines.push(`Status: ${build.status}`);
    lines.push(
      `From: ${build.user.name ?? build.user.email}${build.user.name ? ` <${build.user.email}>` : ''}`
    );
    lines.push(`Pack count: ${build.packCount}`);
    lines.push(`Coins listed: ${coinsListed}${unassigned !== 0 ? `  (Unassigned: ${unassigned})` : ''}`);
    lines.push('');
    for (const line of build.lines) {
      const coin = getCoinDef(line.coinType);
      const tier = TIER_DEFS[line.tier as Tier];
      const tierLabel = tier ? `${tier.label} (${tier.range})` : line.tier;
      const graderLabel = GRADER_LABELS[line.grader as Grader] ?? line.grader;
      lines.push(
        `  ${line.quantity}x  ${coin?.label ?? line.coinType}  —  ${graderLabel}  —  ${tierLabel}${line.notes ? `  —  ${line.notes}` : ''}`
      );
    }
    if (build.notes?.trim()) {
      lines.push('');
      lines.push('Customer notes:');
      lines.push(build.notes.trim());
    }
    if (build.artworkUrl) {
      lines.push('');
      lines.push(`Artwork: ${build.artworkUrl}`);
    }
    return lines.join('\n');
  }, [build, coinsListed, unassigned]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  STATUS_BADGE[build.status] ?? 'bg-slate-700 text-slate-200'
                }`}
              >
                {build.status}
              </span>
              <h2 className="truncate text-lg font-semibold text-slate-100">{build.name}</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Ref {build.shortCode} · {build.packCount} packs · {coinsListed} coins listed
              {unassigned > 0 ? ` · ${unassigned} unassigned` : unassigned < 0 ? ` · ${Math.abs(unassigned)} over` : ''}
            </p>
          </div>
          <div className="text-right text-xs">
            <p className="text-slate-300">{build.user.name || '—'}</p>
            <p>
              <a
                href={`mailto:${build.user.email}?subject=${encodeURIComponent(`Re: ${build.name} (Ref ${build.shortCode})`)}`}
                className="text-gold hover:underline"
              >
                {build.user.email}
              </a>
            </p>
            <p className="mt-1 text-slate-500">
              {build.submittedAt
                ? `Submitted ${new Date(build.submittedAt).toLocaleString()}`
                : `Updated ${new Date(build.updatedAt).toLocaleString()}`}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          {COIN_CATEGORY_ORDER.map((cat) => {
            const n = totals[cat];
            return (
              <div key={cat} className="flex justify-between rounded bg-slate-950/60 px-2 py-1">
                <span className="text-slate-400">{COIN_CATEGORY_LABELS[cat]}</span>
                <span className={`font-mono ${n > 0 ? 'text-gold' : 'text-slate-600'}`}>{n}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Coin lines
          </h3>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(exportText);
            }}
            className="rounded border border-slate-700 px-2 py-0.5 text-xs text-slate-300 hover:border-gold/60 hover:text-gold"
          >
            Copy as text
          </button>
        </div>
        {build.lines.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">No coin lines on this build.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-950/50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">Qty</th>
                <th className="px-3 py-2 text-left">Coin</th>
                <th className="px-3 py-2 text-left">Grader</th>
                <th className="px-3 py-2 text-left">Target tier</th>
                <th className="px-3 py-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {build.lines.map((line) => {
                const coin = getCoinDef(line.coinType);
                const tier = TIER_DEFS[line.tier as Tier];
                const graderLabel = GRADER_LABELS[line.grader as Grader] ?? line.grader;
                return (
                  <tr key={line.id} className="border-t border-slate-800">
                    <td className="px-3 py-2 font-mono text-gold">{line.quantity}×</td>
                    <td className="px-3 py-2 text-slate-100">
                      {coin?.label ?? line.coinType}
                      {coin?.hint && <p className="text-[11px] text-slate-500">{coin.hint}</p>}
                    </td>
                    <td className="px-3 py-2 text-slate-300">{graderLabel}</td>
                    <td className="px-3 py-2 text-slate-300">
                      {tier ? (
                        <>
                          <span>{tier.label}</span>{' '}
                          <span className="text-slate-500">({tier.range})</span>
                        </>
                      ) : (
                        line.tier
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-400">{line.notes || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {build.notes?.trim() && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Customer notes
          </h3>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-200">{build.notes.trim()}</p>
        </div>
      )}

      {build.artworkUrl && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Pack artwork
          </h3>
          <div className="mt-2 max-w-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={build.artworkUrl}
              alt="Customer pack artwork"
              className="w-full rounded-lg border border-slate-700"
            />
          </div>
          <p className="mt-2 text-[11px]">
            <Link href={build.artworkUrl} target="_blank" className="text-gold hover:underline">
              Open full image →
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
