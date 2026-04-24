'use client';

import { useRef, useState } from 'react';
import { PackMockup } from './PackMockup';

type Props = {
  artworkUrl?: string | null;
  isSignedIn: boolean;
  canUpload: boolean;
  onUploaded: (result: { artworkUrl: string; artworkKey: string }) => void;
  onCleared: () => void;
  onRequireSignIn: () => void;
  /** When null, build hasn't been persisted yet — upload needs buildId. */
  buildId: string | null;
  /** Called when build is unsaved — parent creates a DRAFT and returns the new id. */
  ensureBuildId: () => Promise<string | null>;
};

export function ArtworkUploader({
  artworkUrl,
  isSignedIn,
  canUpload,
  onUploaded,
  onCleared,
  onRequireSignIn,
  buildId,
  ensureBuildId,
}: Props) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = localPreview ?? artworkUrl ?? null;

  async function handleFile(file: File) {
    setError(null);
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setError('Upload a PNG or JPG.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Max 10 MB.');
      return;
    }

    // Local preview immediately.
    const reader = new FileReader();
    reader.onload = () => setLocalPreview(String(reader.result));
    reader.readAsDataURL(file);

    if (!isSignedIn) {
      onRequireSignIn();
      return;
    }
    if (!canUpload) {
      setError('Artwork storage is not available in this environment.');
      return;
    }

    setUploading(true);
    try {
      const id = buildId ?? (await ensureBuildId());
      if (!id) {
        setError('Could not start a build. Please try again.');
        setUploading(false);
        return;
      }
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`/api/build/${id}/artwork`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Upload failed' }));
        setError(data.error || 'Upload failed.');
        setUploading(false);
        return;
      }
      const data = (await res.json()) as { artworkUrl: string; artworkKey: string };
      onUploaded(data);
      setLocalPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleClear() {
    setError(null);
    setLocalPreview(null);
    if (!buildId) {
      onCleared();
      return;
    }
    try {
      await fetch(`/api/build/${buildId}/artwork`, { method: 'DELETE' });
      onCleared();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Pack artwork (optional)
        </h3>
        <p className="text-[11px] text-slate-500">PNG or JPG · 4×6 portrait · 10 MB max</p>
      </div>

      <PackMockup artworkUrl={preview} />

      <div className="mt-3 space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = '';
          }}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex-1 rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-sm font-semibold text-gold hover:bg-gold/20 disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : preview ? 'Replace artwork' : 'Upload artwork'}
          </button>
          {preview && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-red-500 hover:text-red-400"
            >
              Clear
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {!isSignedIn && (
          <p className="text-[11px] text-slate-500">
            Sign in to upload — we preview locally without saving.
          </p>
        )}
      </div>
    </div>
  );
}
