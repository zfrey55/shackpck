import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getBuilderUser } from '@/lib/builder/session';
import {
  ACCEPTED_ARTWORK_MIME,
  BUILDER_MAX_UPLOAD_BYTES,
  deleteBuildArtwork,
  saveBuildArtwork,
} from '@/lib/builder/storage';

export const runtime = 'nodejs';

/** POST /api/build/:id/artwork — upload a PNG/JPG for the build. */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getBuilderUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const build = await prisma.build.findUnique({ where: { id: params.id } });
  if (!build || build.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }
  if (file.size > BUILDER_MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'File too large (max 10 MB).' }, { status: 413 });
  }
  const contentType = (file.type || '').toLowerCase();
  if (!ACCEPTED_ARTWORK_MIME.has(contentType)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Upload PNG or JPG.' },
      { status: 415 }
    );
  }

  const filename =
    (file as File).name?.toString?.().slice(0, 120) ||
    `artwork.${contentType.split('/')[1] ?? 'png'}`;
  const bytes = await file.arrayBuffer();

  try {
    if (build.artworkKey) {
      await deleteBuildArtwork(build.artworkKey);
    }
    const saved = await saveBuildArtwork(build.id, {
      arrayBuffer: bytes,
      contentType,
      filename,
    });
    const updated = await prisma.build.update({
      where: { id: build.id },
      data: { artworkKey: saved.key, artworkUrl: saved.url },
    });
    return NextResponse.json({ artworkKey: updated.artworkKey, artworkUrl: updated.artworkUrl });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Upload failed';
    const status =
      msg === 'Artwork storage is not configured on this environment.' ? 503 : 500;
    console.error('[api/build artwork POST]', error);
    return NextResponse.json({ error: msg }, { status });
  }
}

/** DELETE — remove current artwork from the build. */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getBuilderUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const build = await prisma.build.findUnique({ where: { id: params.id } });
  if (!build || build.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (build.artworkKey) {
    await deleteBuildArtwork(build.artworkKey);
  }
  await prisma.build.update({
    where: { id: build.id },
    data: { artworkKey: null, artworkUrl: null },
  });
  return NextResponse.json({ ok: true });
}
