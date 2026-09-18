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
  /**
   * Called when the build is unsaved: the parent creates one and reports whether
   * THIS call created it, so a failed upload can undo it.
   */
  ensureBuildId: () => Promise<{ id: string; created: boolean } | null>;
  /** Failed upload. Receives the build id only when it was created for this upload. */
  onUploadFailed?: (createdBuildId: string | null) => void;
  /** A file is previewing locally and has not been uploaded yet. */
  onLocalPreviewChange?: (pending: boolean) => void;
  /** The previous pick was lost (e.g. signing in), so ask for it again. */
  needsReupload?: boolean;
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
  onUploadFailed,
  onLocalPreviewChange,
  needsReupload = false,
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

    // Local preview immediately. The bytes stay in this component: they are
    // never put in the draft or the sign-in stash.
    const reader = new FileReader();
    reader.onload = () => setLocalPreview(String(reader.result));
    reader.readAsDataURL(file);
    onLocalPreviewChange?.(true);

    if (!isSignedIn) {
      onRequireSignIn();
      return;
    }
    if (!canUpload) {
      setError('Artwork storage is not available in this environment. Everything else still saves.');
      return;
    }

    setUploading(true);
    // Tracked so a failed upload can undo a build that only existed for it.
    let createdBuildId: string | null = null;
    try {
      const ensured = buildId ? { id: buildId, created: false } : await ensureBuildId();
      if (!ensured) {
        setError('Could not start a build. Please try again.');
        return;
      }
      createdBuildId = ensured.created ? ensured.id : null;
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`/api/build/${ensured.id}/artwork`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Upload failed' }));
        setError(data.error || 'Upload failed.');
        onUploadFailed?.(createdBuildId);
        return;
      }
      const data = (await res.json()) as { artworkUrl: string; artworkKey: string };
      onUploaded(data);
      setLocalPreview(null);
      onLocalPreviewChange?.(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
      onUploadFailed?.(createdBuildId);
    } finally {
      setUploading(false);
    }
  }

  async function handleClear() {
    setError(null);
    setLocalPreview(null);
    onLocalPreviewChange?.(false);
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
        {needsReupload && (
          <p
            data-artwork-reupload
            className="rounded-md border border-amber-600/60 bg-amber-900/25 px-2 py-1.5 text-[11px] leading-relaxed text-amber-100"
          >
            Your artwork was not saved — pack art uploads need a saved build, so please upload it again.
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-semibold disabled:opacity-60 ${
              needsReupload
                ? 'border-amber-500 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30'
                : 'border-gold/40 bg-gold/10 text-gold hover:bg-gold/20'
            }`}
          >
            {uploading ? 'Uploading…' : needsReupload ? 'Upload artwork again' : preview ? 'Replace artwork' : 'Upload artwork'}
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
        {isSignedIn && !canUpload && (
          <p className="text-[11px] text-slate-500">
            Artwork uploads are unavailable in this environment — the rest of your build still saves.
          </p>
        )}
      </div>
    </div>
  );
}
