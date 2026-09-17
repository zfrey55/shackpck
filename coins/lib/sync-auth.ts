import { createHash, timingSafeEqual } from 'crypto';
import type { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';

/**
 * Gate for the series sync endpoints (/api/sync/series, /api/series/sync-from-inventory).
 *
 * Allowed when EITHER:
 *   - the `x-sync-secret` header matches env SYNC_SERIES_SECRET (constant-time
 *     compare of SHA-256 digests, so neither content nor length leaks), or
 *   - the request comes from an admin session (lib/require-admin, database role).
 * With SYNC_SERIES_SECRET unset, only admins can call them.
 */
export async function authorizeSync(
  request: Request
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const expected = process.env.SYNC_SERIES_SECRET?.trim();
  const provided = request.headers.get('x-sync-secret');
  if (expected && provided && secretsMatch(provided, expected)) return { ok: true };

  const gate = await requireAdmin();
  return gate.ok ? { ok: true } : { ok: false, response: gate.response };
}

function secretsMatch(provided: string, expected: string): boolean {
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}
