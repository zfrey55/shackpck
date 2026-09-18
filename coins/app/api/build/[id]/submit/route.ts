import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getBuilderUser } from '@/lib/builder/session';
import { buildSubmitSchema } from '@/lib/builder/schema';
import { sendBuildInquiryEmail } from '@/lib/builder/email';
import { rateLimit, tooManyRequests, userIdentifier } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * POST /api/build/:id/submit — mark SUBMITTED and email the admin inbox.
 *
 * The status is CLAIMED atomically before the email is sent: two concurrent
 * submits both used to pass the status check and both sent the team an email.
 * A send failure reverts the claim so a genuine retry still works.
 *
 * Rate limited per user id (5/hour): submitting notifies people.
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getBuilderUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limited = await rateLimit('build-submit', userIdentifier(user.id));
  if (!limited.ok) {
    return tooManyRequests(
      { error: 'You have sent several builds recently. Please try again later or reply to our email.' },
      limited.retryAfterSec
    );
  }

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

    // Claim the submit first: whoever flips SUBMITTED sends the one email.
    const claimed = await prisma.build.updateMany({
      where: { id: build.id, status: { not: 'SUBMITTED' } },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        notes: input.additionalNotes ?? build.notes,
      },
    });
    if (claimed.count === 0) {
      return NextResponse.json({ error: 'Build has already been submitted.' }, { status: 409 });
    }

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

    try {
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
    } catch (sendError) {
      // Release the claim so the customer can retry.
      await prisma.build.update({
        where: { id: build.id },
        data: { status: build.status, submittedAt: build.submittedAt },
      });
      throw sendError;
    }

    const updated = await prisma.build.findUnique({
      where: { id: build.id },
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
