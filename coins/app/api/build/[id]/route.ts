import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getBuilderUser } from '@/lib/builder/session';
import { buildUpsertSchema } from '@/lib/builder/schema';
import { deleteBuildArtwork } from '@/lib/builder/storage';

export const runtime = 'nodejs';

async function loadOwned(userId: string, id: string) {
  const build = await prisma.build.findUnique({
    where: { id },
    include: { lines: { orderBy: { order: 'asc' } } },
  });
  if (!build || build.userId !== userId) return null;
  return build;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getBuilderUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const build = await loadOwned(user.id, params.id);
  if (!build) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(build);
}

/** PATCH — replace name, packCount, lines, artwork, notes. */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getBuilderUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await loadOwned(user.id, params.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (existing.status === 'SUBMITTED') {
    return NextResponse.json({ error: 'Submitted builds cannot be edited.' }, { status: 409 });
  }

  try {
    const body = await request.json();
    const data = buildUpsertSchema.parse(body);

    // If artwork changed, delete previous blob.
    if (existing.artworkKey && existing.artworkKey !== data.artworkKey) {
      await deleteBuildArtwork(existing.artworkKey);
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.buildLine.deleteMany({ where: { buildId: existing.id } });
      return tx.build.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          packCount: data.packCount,
          artworkUrl: data.artworkUrl ?? null,
          artworkKey: data.artworkKey ?? null,
          notes: data.notes ?? null,
          status: existing.status === 'DRAFT' ? 'SAVED' : existing.status,
          lines: {
            create: data.lines.map((line, i) => ({
              order: line.order ?? i,
              coinType: line.coinType,
              quantity: line.quantity,
              grader: line.grader,
              tier: line.tier,
              notes: line.notes ?? null,
            })),
          },
        },
        include: { lines: { orderBy: { order: 'asc' } } },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid build data.', issues: error.issues },
        { status: 400 }
      );
    }
    console.error('[api/build PATCH]', error);
    return NextResponse.json({ error: 'Failed to update build.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getBuilderUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await loadOwned(user.id, params.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (existing.artworkKey) {
    await deleteBuildArtwork(existing.artworkKey);
  }

  await prisma.build.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
