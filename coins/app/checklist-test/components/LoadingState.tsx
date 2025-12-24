import { memo } from "react";

export const LoadingState = memo(function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/40 p-10">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gold" />
      <p className="text-sm text-slate-400">Loading ShackPack checklist…</p>
    </div>
  );
});

