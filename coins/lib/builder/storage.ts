import { getStore } from '@netlify/blobs';

/**
 * Netlify Blobs wrapper for ShackPack Builder pack artwork uploads.
 *
 * On Netlify (production + deploy previews) this works with zero configuration.
 * For local `next dev`, set NETLIFY_BLOBS_SITE_ID and NETLIFY_BLOBS_TOKEN or run under
 * `netlify dev` which injects the context automatically. If neither is present we
 * no-op gracefully so the UI still works without an uploaded image.
 */

const STORE_NAME = 'shackpack-builder-artwork';
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export const ACCEPTED_ARTWORK_MIME = new Set(['image/png', 'image/jpeg', 'image/jpg']);

/** Returns null when Netlify Blobs isn't available in the current runtime. */
function tryGetStore(): ReturnType<typeof getStore> | null {
  try {
    // Netlify production / deploy previews auto-inject the site + token context.
    // In local dev we check for explicit env vars to avoid throwing from the SDK.
    const siteID = process.env.NETLIFY_BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN;
    if (siteID && token) {
      return getStore({ name: STORE_NAME, siteID, token });
    }
    // Auto-context path (Netlify runtime) — may throw if not on Netlify.
    return getStore({ name: STORE_NAME });
  } catch (err) {
    console.warn('[builder/storage] Netlify Blobs unavailable:', err);
    return null;
  }
}

export function isArtworkStorageAvailable(): boolean {
  return tryGetStore() !== null;
}

export type ArtworkUploadResult = {
  key: string;
  url: string;
};

/**
 * Store an uploaded artwork image for the given build. Returns the public URL
 * and opaque storage key (kept in DB for later deletion).
 */
export async function saveBuildArtwork(
  buildId: string,
  file: { arrayBuffer: ArrayBuffer; contentType: string; filename: string }
): Promise<ArtworkUploadResult> {
  if (!ACCEPTED_ARTWORK_MIME.has(file.contentType.toLowerCase())) {
    throw new Error('Unsupported file type. Upload a PNG or JPG.');
  }
  if (file.arrayBuffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error('File is too large. Max 10 MB.');
  }

  const store = tryGetStore();
  if (!store) {
    throw new Error('Artwork storage is not configured on this environment.');
  }

  // Key scheme: buildId/timestamp-safeName.ext — keeps multiple iterations addressable.
  const ext = file.filename.match(/\.(png|jpe?g)$/i)?.[0] ?? '.png';
  const safeBase = file.filename
    .replace(/\.(png|jpe?g)$/i, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .slice(0, 48);
  const key = `${buildId}/${Date.now()}-${safeBase || 'artwork'}${ext}`;

  await store.set(key, file.arrayBuffer, {
    metadata: {
      contentType: file.contentType,
      buildId,
      originalName: file.filename,
    },
  });

  // Public access is served via our own API proxy, which keeps storage private.
  const url = `/api/build/artwork/${encodeURIComponent(key)}`;
  return { key, url };
}

export async function deleteBuildArtwork(key: string): Promise<void> {
  const store = tryGetStore();
  if (!store) return;
  try {
    await store.delete(key);
  } catch (err) {
    console.warn('[builder/storage] artwork delete failed:', err);
  }
}

/** Returns the blob + metadata for serving via API. */
export async function readBuildArtwork(
  key: string
): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  const store = tryGetStore();
  if (!store) return null;
  const result = await store.getWithMetadata(key, { type: 'arrayBuffer' });
  if (!result) return null;
  const contentType =
    (result.metadata?.contentType as string | undefined) || 'application/octet-stream';
  return { data: result.data as ArrayBuffer, contentType };
}

export const BUILDER_MAX_UPLOAD_BYTES = MAX_UPLOAD_BYTES;
