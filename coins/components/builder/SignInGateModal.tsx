'use client';

import Link from 'next/link';

type Props = {
  open: boolean;
  onClose: () => void;
  reason: 'save' | 'submit' | 'upload';
};

const MESSAGES: Record<Props['reason'], { title: string; body: string }> = {
  save: {
    title: 'Sign in to save your build',
    body: 'Saving keeps your build available on any device and lets you return to finish it later.',
  },
  submit: {
    title: 'Sign in to send your build',
    body: 'We tie each inquiry to your account so we can follow up with pricing and confirmation.',
  },
  upload: {
    title: 'Sign in to upload artwork',
    body: 'We store your uploaded pack art on your account so we can print it exactly when you approve the build.',
  },
};

export function SignInGateModal({ open, onClose, reason }: Props) {
  if (!open) return null;
  const msg = MESSAGES[reason];
  const redirectTo = typeof window !== 'undefined' ? window.location.pathname : '/build';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-950 p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gold">{msg.title}</h2>
        <p className="mt-2 text-sm text-slate-300">{msg.body}</p>
        <p className="mt-3 text-xs text-slate-500">
          Your work-in-progress stays in the builder — signing in won't lose it.
        </p>
        <div className="mt-6 flex gap-2">
          <Link
            href={`/auth/signin?callbackUrl=${encodeURIComponent(redirectTo)}`}
            className="flex-1 rounded-md bg-gold px-4 py-2 text-center text-sm font-semibold text-black hover:opacity-90"
          >
            Sign in
          </Link>
          <Link
            href={`/auth/signin?callbackUrl=${encodeURIComponent(redirectTo)}`}
            className="flex-1 rounded-md border border-slate-700 px-4 py-2 text-center text-sm text-slate-300 hover:border-gold/60 hover:text-gold"
          >
            Create account
          </Link>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-md border border-slate-800 px-4 py-1.5 text-xs text-slate-500 hover:text-slate-300"
        >
          Keep building without signing in
        </button>
      </div>
    </div>
  );
}
