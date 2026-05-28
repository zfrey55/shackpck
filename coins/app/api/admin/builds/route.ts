import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return { status: 401 as const };
  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (user?.role !== 'ADMIN') return { status: 403 as const };
  return { status: 200 as const };
}

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
  if (gate.status !== 200) {
    return NextResponse.json(
      { error: gate.status === 401 ? 'Unauthorized' : 'Forbidden' },
      { status: gate.status }
    );
  }

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
