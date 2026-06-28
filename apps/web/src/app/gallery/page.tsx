import Link from 'next/link';
import { artworkImageUrl, getFeed } from '@abstract/shared';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { ArtworkCard } from '@/components/ArtworkCard';

export const revalidate = 30;

export default async function GalleryPage() {
  const supabase = createClient();

  let feed: Awaited<ReturnType<typeof getFeed>> = [];
  let failed = false;
  if (isSupabaseConfigured()) {
    try {
      feed = await getFeed(supabase, { page: 0 });
    } catch {
      failed = true;
    }
  } else {
    failed = true;
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black">Gallery</h1>
          <p className="mt-1 text-sm text-zinc-400">Discover art from the community.</p>
        </div>
        <Link href="/upload" className="btn-primary">
          Share art
        </Link>
      </div>

      {failed ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          Could not load the gallery. Make sure your Supabase environment variables are set.
        </p>
      ) : feed.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-ink-900 p-12 text-center">
          <p className="text-zinc-300">No artwork yet.</p>
          <Link href="/upload" className="btn-primary mt-4">
            Be the first to share
          </Link>
        </div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {feed.map((art) => (
            <ArtworkCard
              key={art.id}
              artwork={art}
              imageUrl={artworkImageUrl(supabase, art.image_path)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
