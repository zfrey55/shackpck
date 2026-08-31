'use client';

export type BucketTab = {
  id: string;
  label: string;
  /** Optional trailing count, dimmed. */
  badge?: string | number;
};

type BucketedTabsProps = {
  ariaLabel: string;
  /** The always-visible top row. */
  primary: BucketTab[];
  activePrimary: string;
  onPrimary: (id: string) => void;
  /**
   * The id in `primary` that acts as the expandable bucket. When it is the
   * active primary, `secondary` renders as a second row underneath.
   */
  bucketId?: string;
  secondary?: BucketTab[];
  activeSecondary?: string | null;
  onSecondary?: (id: string) => void;
  /** Shown in the second row when `secondary` is empty. */
  emptyLabel?: string;
  /** Shown instead of `emptyLabel` while content is still loading. */
  loading?: boolean;
  loadingLabel?: string;
};

/**
 * TIER 2: a tab row whose last entry is a BUCKET that expands into a second row.
 *
 * This is the pattern /checklist's CustomerNav has always used — ShackPack /
 * Bullion Bureau / Other, with "Other" revealing the remaining customers —
 * lifted out so /repacks can present its coin brands the same way instead of
 * growing a second, subtly different implementation. Both pages now render the
 * same markup, so the two navs stay in step by construction.
 *
 * Purely presentational: it holds no state and knows nothing about customers,
 * brands or lines. Callers decide what a bucket means and supply both rows.
 */
export function BucketedTabs({
  ariaLabel,
  primary,
  activePrimary,
  onPrimary,
  bucketId,
  secondary = [],
  activeSecondary = null,
  onSecondary,
  emptyLabel = 'Nothing here yet.',
  loading = false,
  loadingLabel = 'Loading…',
}: BucketedTabsProps) {
  const bucketOpen = bucketId !== undefined && activePrimary === bucketId;

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex flex-wrap items-center justify-center gap-2"
      >
        {primary.map((tab) => {
          const active = tab.id === activePrimary;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onPrimary(tab.id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-gold text-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span className="ml-2 opacity-60">{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {bucketOpen && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {secondary.length === 0 ? (
            <p className="text-sm text-slate-400">
              {loading ? loadingLabel : emptyLabel}
            </p>
          ) : (
            secondary.map((tab) => {
              const active = tab.id === activeSecondary;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSecondary?.(tab.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-gold/90 text-black'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className="ml-2 opacity-60">{tab.badge}</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
