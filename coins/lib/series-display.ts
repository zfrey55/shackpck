/**
 * Formats series titles from DB/inventory (often ALL CAPS, missing punctuation) for UI.
 * Mixed-case names from the database are left unchanged.
 */
export function formatSeriesDisplayName(raw: string): string {
  const t = raw.trim();
  if (!t) return t;

  const lettersOnly = t.replace(/[^a-zA-Z]/g, '');
  if (!lettersOnly) return t;

  const isAllCapsBlock = t === t.toUpperCase() && lettersOnly.length >= 4;
  if (!isAllCapsBlock) return t;

  let s = t.toLowerCase().replace(/\bshack pack\b/g, 'shackpack');
  const words = s.split(/\s+/).filter(Boolean);
  const small = new Set(['a', 'an', 'the', 'and', 'or', 'by', 'of', 'in', 'at']);

  const out = words.map((w, i) => {
    if (/^\d+(\.\d+)?$/.test(w)) return w;
    if (i > 0 && small.has(w)) return w;
    if (w === 'shackpack') return 'ShackPack';
    return w.charAt(0).toUpperCase() + w.slice(1);
  });

  return out.join(' ');
}
