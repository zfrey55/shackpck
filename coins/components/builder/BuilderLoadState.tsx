'use client';

import Link from 'next/link';
import type { LoadState } from './useBuilderPersistence';

const COPY: Record<Exclude<LoadState, 'ready'>, { title: string; body: string }> = {
  loading: { title: 'Opening your build…', body: 'One moment.' },
  'signed-out': {
    title: 'Sign in to open this build',
    body: 'Saved builds live on your account, so we need you signed in to open this one.',
  },
  'not-found': {
    title: "We couldn't find that build",
    body: 'The link may be wrong, the build may have been deleted, or it may belong to a different account.',
  },
  error: {
    title: "Something went wrong opening that build",
    body: 'Your build is safe — this was a problem on our side. Try again in a moment.',
  },
};

/**
 * Shown INSTEAD of the builder when a ?id= load did not succeed. The builder is
 * never rendered as an editable blank draft in that case: saving from one used
 * to create a second, unrelated build.
 */
export function BuilderLoadState({
  state,
  signInHref,
  onStartNew,
  onRetry,
}: {
  state: Exclude<LoadState, 'ready'>;
  signInHref: string;
  onStartNew: () => void;
  onRetry: () => void;
}) {
  const copy = COPY[state];
  return (
    <div
      className="mx-auto max-w-xl rounded-lg border border-slate-700 bg-slate-900/60 p-6 text-center"
      role="status"
      data-load-state={state}
    >
      <h2 className="text-xl font-bold text-gold">{copy.title}</h2>
      <p className="mt-2 text-sm text-slate-300">{copy.body}</p>
      {state !== 'loading' && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {state === 'signed-out' && (
            <Link
              href={signInHref}
              className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
            >
              Sign in
            </Link>
          )}
          {state === 'error' && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
            >
              Try again
            </button>
          )}
          <button
            type="button"
            onClick={onStartNew}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-gold/60 hover:text-gold"
          >
            Start a new build
          </button>
          <Link
            href="/my-builds"
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-gold/60 hover:text-gold"
          >
            My builds
          </Link>
        </div>
      )}
    </div>
  );
}
