import { Suspense } from "react";
import { ChecklistClient } from "./ChecklistClient";
import { LoadingState } from "./components";

/**
 * Checklist route. Server component; the interactive body is ChecklistClient,
 * which is split out both to keep this file small and because it reads
 * useSearchParams and therefore must be Suspense-wrapped.
 */
export default function ChecklistPage() {
  return (
    <Suspense
      fallback={
        <main className="container py-10">
          <div className="max-w-6xl mx-auto px-4">
            <LoadingState />
          </div>
        </main>
      }
    >
      <ChecklistClient />
    </Suspense>
  );
}
