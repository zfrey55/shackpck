import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getBuilderUser } from '@/lib/builder/session';
import { isAdminUserId } from '@/lib/require-admin';
import { readBuildArtwork } from '@/lib/builder/storage';

export const runtime = 'nodejs';

/**
 * GET /api/build/artwork/:key — proxy blob content.
 *
 * Access rules:
 *   - Owner (signed-in user whose build this belongs to): always allowed.
 *   - Admin: a signed-in user whose DB role is ADMIN, looked up by session user id
 *     on every request, so a demotion takes effect immediately. This is what makes
 *     the link in the admin notification email work: the reader signs in with an
 *     admin account. Matching the ADMIN_EMAIL inbox address is deliberately NOT
 *     an access rule — that address is a notification destination, not an identity.
 *   - Everyone else: 404.
 *
 * This keeps uploads out of public object storage while still letting us link them
 * from the admin email.
 */
export async function GET(_req: NextRequest, { params }: { params: { key: string[] } }) {
  const key = params.key.map(decodeURIComponent).join('/');
  if (!key || key.includes('..')) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  }

  const buildId = key.split('/')[0];
  if (!buildId) return NextResponse.json({ error: 'Invalid key' }, { status: 400 });

  const build = await prisma.build.findUnique({
    where: { id: buildId },
    include: { user: { select: { email: true } } },
  });
  if (!build || build.artworkKey !== key) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const viewer = await getBuilderUser();
  if (!viewer) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Not the owner and not an admin: 404, so the build's existence is not revealed.
  if (viewer.id !== build.userId && !(await isAdminUserId(viewer.id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const blob = await readBuildArtwork(key);
  if (!blob) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return new NextResponse(blob.data as ArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': blob.contentType,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
