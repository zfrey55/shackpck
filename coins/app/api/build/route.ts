import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getBuilderUser } from '@/lib/builder/session';
import { buildUpsertSchema } from '@/lib/builder/schema';

export const runtime = 'nodejs';

const createSchema = buildUpsertSchema.extend({
  status: z.enum(['DRAFT', 'SAVED']).default('SAVED'),
});

/** GET /api/build — list current user's non-archived builds. */
export async function GET(request: NextRequest) {
  const user = await getBuilderUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const includeArchived = searchParams.get('includeArchived') === '1';

  const builds = await prisma.build.findMany({
    where: {
      userId: user.id,
      ...(includeArchived ? {} : { status: { not: 'ARCHIVED' } }),
    },
    orderBy: [{ updatedAt: 'desc' }],
    include: { lines: { orderBy: { order: 'asc' } } },
  });

  return NextResponse.json(builds);
}

/** POST /api/build — create a new build (DRAFT or SAVED). */
export async function POST(request: NextRequest) {
  const user = await getBuilderUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const build = await prisma.build.create({
      data: {
        userId: user.id,
        name: data.name,
        packCount: data.packCount,
        status: data.status,
        artworkUrl: data.artworkUrl ?? null,
        artworkKey: data.artworkKey ?? null,
        notes: data.notes ?? null,
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

    return NextResponse.json(build, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid build data.', issues: error.issues },
        { status: 400 }
      );
    }
    console.error('[api/build POST]', error);
    return NextResponse.json({ error: 'Failed to save build.' }, { status: 500 });
  }
}
