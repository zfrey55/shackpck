import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getBuilderUser } from '@/lib/builder/session';

export const runtime = 'nodejs';

/** POST /api/build/:id/archive — toggle archived state. */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getBuilderUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const build = await prisma.build.findUnique({ where: { id: params.id } });
  if (!build || build.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const nextStatus = build.status === 'ARCHIVED' ? 'SAVED' : 'ARCHIVED';
  const updated = await prisma.build.update({
    where: { id: build.id },
    data: {
      status: nextStatus,
      archivedAt: nextStatus === 'ARCHIVED' ? new Date() : null,
    },
  });

  return NextResponse.json(updated);
}
