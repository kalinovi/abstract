import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { artworkImageUrl, getArtwork, getLikedSet } from '@abstract/shared';
import { createClient } from '@/lib/supabase/server';
import { LikeButton } from '@/components/LikeButton';
import { CommentSection } from '@/components/CommentSection';
import { deleteArtwork } from '@/app/artwork/actions';

export default async function ArtworkPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const artwork = await getArtwork(supabase, params.id).catch(() => null);
  if (!artwork) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let liked = false;
  if (user) {
    const set = await getLikedSet(supabase, user.id, [artwork.id]);
    liked = set.has(artwork.id);
  }

  const isOwner = user?.id === artwork.author_id;
  const ratio = artwork.width && artwork.height ? artwork.width / artwork.height : undefined;

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
        <div className="relative w-full" style={ratio ? { aspectRatio: ratio } : undefined}>
          <Image
            src={artworkImageUrl(supabase, artwork.image_path)}
            alt={artwork.title}
            fill={!!ratio}
            width={ratio ? undefined : 1200}
            height={ratio ? undefined : 800}
            sizes="(max-width: 1024px) 100vw, 896px"
            unoptimized={artwork.image_path.toLowerCase().endsWith('.gif')}
            className="w-full object-contain"
            priority
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">{artwork.title}</h1>
          <Link
            href={`/u/${artwork.author_username}`}
            className="mt-1 inline-block text-sm text-zinc-400 hover:text-white"
          >
            by {artwork.author_display_name ?? artwork.author_username}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <LikeButton
            artworkId={artwork.id}
            userId={user?.id ?? null}
            initialLiked={liked}
            initialCount={artwork.like_count}
          />
          {isOwner && (
            <form action={deleteArtwork}>
              <input type="hidden" name="id" value={artwork.id} />
              <input type="hidden" name="image_path" value={artwork.image_path} />
              <button type="submit" className="btn-ghost text-red-300 hover:bg-red-500/10">
                Delete
              </button>
            </form>
          )}
        </div>
      </div>

      {artwork.description && (
        <p className="mt-4 whitespace-pre-wrap text-zinc-300">{artwork.description}</p>
      )}

      <CommentSection artworkId={artwork.id} userId={user?.id ?? null} />
    </div>
  );
}
