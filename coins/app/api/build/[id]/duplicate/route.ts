import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getBuilderUser } from '@/lib/builder/session';

export const runtime = 'nodejs';

/** POST /api/build/:id/duplicate — copy into a new DRAFT build. */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getBuilderUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const source = await prisma.build.findUnique({
    where: { id: params.id },
    include: { lines: { orderBy: { order: 'asc' } } },
  });
  if (!source || source.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const copy = await prisma.build.create({
    data: {
      userId: user.id,
      name: `${source.name} (copy)`,
      packCount: source.packCount,
      status: 'SAVED',
      // Artwork key is NOT copied — each build owns its own uploaded blob.
      artworkUrl: null,
      artworkKey: null,
      notes: source.notes,
      lines: {
        create: source.lines.map((line, i) => ({
          order: i,
          coinType: line.coinType,
          quantity: line.quantity,
          grader: line.grader,
          tier: line.tier,
          notes: line.notes,
        })),
      },
    },
    include: { lines: { orderBy: { order: 'asc' } } },
  });

  return NextResponse.json(copy, { status: 201 });
}
