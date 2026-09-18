'use client';

import Link from 'next/link';

/** Build name, reference, unsaved-changes indicator and the save / submit buttons. */
export function BuilderHeader({
  name,
  shortCode,
  onNameChange,
  dirty,
  saving,
  submitting,
  submitted,
  canSubmit,
  isNew,
  onSave,
  onSubmit,
}: {
  name: string;
  shortCode?: string;
  onNameChange: (value: string) => void;
  dirty: boolean;
  saving: boolean;
  submitting: boolean;
  submitted: boolean;
  canSubmit: boolean;
  isNew: boolean;
  onSave: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex-1 min-w-[240px]">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400" htmlFor="build-name">
          Build name
        </label>
        <input
          id="build-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          maxLength={120}
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-base font-semibold text-slate-100 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {shortCode && <p className="text-[10px] font-mono text-slate-500">Ref {shortCode}</p>}
          {dirty && !submitted && (
            <span
              data-unsaved-indicator
              className="rounded-full border border-amber-600/60 bg-amber-900/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200"
            >
              Unsaved changes
            </span>
          )}
        </div>
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
          onClick={onSave}
          disabled={saving || submitted}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:border-gold/60 disabled:opacity-60"
        >
          {saving ? 'Saving…' : isNew ? 'Save build' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || submitted || !canSubmit}
          className="rounded-md bg-gold px-4 py-1.5 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Sending…' : submitted ? 'Submitted' : 'Send to ShackPack'}
        </button>
      </div>
    </div>
  );
}
