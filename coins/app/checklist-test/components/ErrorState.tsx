import { memo } from "react";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState = memo(function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded border border-red-500/30 bg-red-900/20 p-6 text-center text-red-200">
      <p className="font-semibold">Unable to load checklist.</p>
      <p className="text-sm opacity-80">{error}</p>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  );
});

