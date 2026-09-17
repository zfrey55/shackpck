import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/require-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/admin/builds/:id — full build with lines + customer info. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const build = await prisma.build.findUnique({
    where: { id: params.id },
    include: {
      lines: { orderBy: { order: 'asc' } },
      user: { select: { id: true, email: true, name: true } },
    },
  });
  if (!build) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(build);
}
