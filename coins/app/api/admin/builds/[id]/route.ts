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

/** GET /api/admin/builds/:id — full build with lines + customer info. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAdmin();
  if (gate.status !== 200) {
    return NextResponse.json(
      { error: gate.status === 401 ? 'Unauthorized' : 'Forbidden' },
      { status: gate.status }
    );
  }

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
