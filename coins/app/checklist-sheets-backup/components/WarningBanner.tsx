import { memo } from "react";

interface WarningBannerProps {
  warning: string;
}

export const WarningBanner = memo(function WarningBanner({ warning }: WarningBannerProps) {
  return (
    <div className="rounded border border-yellow-500/30 bg-yellow-900/20 p-4 text-sm text-yellow-100">
      <strong>Warning:</strong> {warning}
    </div>
  );
});

