import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/require-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/builds
 *   ?status=SUBMITTED|SAVED|DRAFT|ARCHIVED|ALL  (default SUBMITTED)
 *   ?take=NN  (default 200, max 1000)
 *
 * Returns full builds with lines and customer info — the authoritative copy of
 * the data, in case the email rendering was wrong.
 */
export async function GET(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status')?.toUpperCase();
  const takeParam = parseInt(searchParams.get('take') ?? '200', 10);
  const take = Math.min(1000, Math.max(1, Number.isFinite(takeParam) ? takeParam : 200));

  const allowed = new Set(['SUBMITTED', 'SAVED', 'DRAFT', 'ARCHIVED']);
  const where =
    statusParam === 'ALL' || statusParam === undefined || statusParam === null
      ? { status: 'SUBMITTED' as const }
      : allowed.has(statusParam)
        ? { status: statusParam as 'SUBMITTED' | 'SAVED' | 'DRAFT' | 'ARCHIVED' }
        : { status: 'SUBMITTED' as const };

  // If the caller explicitly asked for ALL, drop the filter.
  const finalWhere = statusParam === 'ALL' ? {} : where;

  const builds = await prisma.build.findMany({
    where: finalWhere,
    orderBy: [{ submittedAt: 'desc' }, { updatedAt: 'desc' }],
    take,
    include: {
      lines: { orderBy: { order: 'asc' } },
      user: { select: { id: true, email: true, name: true } },
    },
  });

  return NextResponse.json(builds);
}
