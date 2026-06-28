'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ARTWORKS_BUCKET,
  artworkSchema,
  createArtwork,
} from '@abstract/shared';
import { createClient } from '@/lib/supabase/client';

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB (animated GIFs run larger)

function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });
}

export function UploadForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    if (f && !f.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    if (f && f.size > MAX_BYTES) {
      setError('Image must be under 15 MB');
      return;
    }
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = artworkSchema.safeParse({ title, description });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    if (!file) {
      setError('Please choose an image');
      return;
    }

    setBusy(true);
    try {
      const { width, height } = await readDimensions(file);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(ARTWORKS_BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;

      const id = await createArtwork(supabase, {
        author_id: userId,
        title: parsed.data.title,
        description: parsed.data.description || null,
        image_path: path,
        width,
        height,
      });

      router.push(`/artwork/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold">Artwork image</label>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-ink-800 p-8 text-center hover:border-accent">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="max-h-80 rounded-lg object-contain" />
          ) : (
            <span className="text-sm text-zinc-400">
              Click to choose an image (PNG/JPG/WebP/GIF, max 15 MB)
            </span>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={onPick} />
        </label>
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-300" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className="field"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your piece a name"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-300" htmlFor="description">
          Description <span className="text-zinc-500">(optional)</span>
        </label>
        <textarea
          id="description"
          className="field min-h-[100px] resize-y"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell the story behind it"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? 'Publishing…' : 'Publish artwork'}
      </button>
    </form>
  );
}
