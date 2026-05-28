import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getBuilderUser } from '@/lib/builder/session';
import { buildSubmitSchema } from '@/lib/builder/schema';
import { sendBuildInquiryEmail } from '@/lib/builder/email';

export const runtime = 'nodejs';

/** POST /api/build/:id/submit — mark SUBMITTED and email admin inbox. */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getBuilderUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const build = await prisma.build.findUnique({
    where: { id: params.id },
    include: { lines: { orderBy: { order: 'asc' } }, user: true },
  });
  if (!build || build.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (build.status === 'SUBMITTED') {
    return NextResponse.json({ error: 'Build has already been submitted.' }, { status: 409 });
  }
  if (build.lines.length === 0) {
    return NextResponse.json(
      { error: 'Add at least one coin to your build before submitting.' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const input = buildSubmitSchema.parse(body ?? {});

    // Build absolute URLs for the email links.
    const base =
      process.env.NEXTAUTH_URL ||
      (process.env.URL ? process.env.URL : '') ||
      'https://shackpck.com';
    const baseTrimmed = base.replace(/\/$/, '');
    const artworkUrl = build.artworkUrl
      ? build.artworkUrl.startsWith('http')
        ? build.artworkUrl
        : `${baseTrimmed}${build.artworkUrl}`
      : null;
    const adminUrl = `${baseTrimmed}/admin/builds?id=${build.id}`;

    await sendBuildInquiryEmail({
      buildId: build.id,
      shortCode: build.shortCode,
      name: build.name,
      packCount: build.packCount,
      customerName: build.user.name ?? build.user.email,
      customerEmail: build.user.email,
      customerPhone: input.phone ?? null,
      additionalNotes: input.additionalNotes ?? build.notes ?? null,
      artworkUrl,
      adminUrl,
      lines: build.lines.map((l) => ({
        coinType: l.coinType,
        quantity: l.quantity,
        grader: l.grader,
        tier: l.tier,
        notes: l.notes,
      })),
    });

    const updated = await prisma.build.update({
      where: { id: build.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        notes: input.additionalNotes ?? build.notes,
      },
      include: { lines: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json({ ok: true, build: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid submit data.', issues: error.issues },
        { status: 400 }
      );
    }
    const msg = error instanceof Error ? error.message : 'Submit failed';
    if (
      msg === 'ADMIN_EMAIL is not configured' ||
      msg === 'SENDGRID_API_KEY is not configured' ||
      msg === 'FROM_EMAIL is not configured'
    ) {
      return NextResponse.json(
        { error: 'Builder email is temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }
    console.error('[api/build submit]', error);
    return NextResponse.json(
      { error: 'Failed to submit build. Please try again.' },
      { status: 500 }
    );
  }
}
