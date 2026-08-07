import type { CaseData } from "./types";

/**
 * Stable order so Series #1 / #2 / … stay consistent across reloads.
 * Primary key is the API's `seriesNumber`; `caseId` only breaks ties, so a
 * case whose id sorts out of step with its label still lands in the right slot.
 * `seriesNumber` is optional, so unnumbered cases fall to the end and order
 * among themselves by `caseId` rather than comparing against NaN.
 *
 * Moved here verbatim from app/checklist/page.tsx so the per-customer route
 * shares one comparator instead of keeping a second copy. Ordering semantics
 * are unchanged.
 */
export function sortCasesForDisplay(cases: CaseData[]): CaseData[] {
  const seriesRank = (n: number | undefined) =>
    typeof n === 'number' && Number.isFinite(n) ? n : null;
  return [...cases].sort((a, b) => {
    const aNum = seriesRank(a.seriesNumber);
    const bNum = seriesRank(b.seriesNumber);
    if (aNum !== null && bNum !== null) {
      if (aNum !== bNum) return aNum - bNum;
    } else if (aNum !== null) {
      return -1;
    } else if (bNum !== null) {
      return 1;
    }
    return a.caseId.localeCompare(b.caseId);
  });
}
