import Image from 'next/image';
import Link from 'next/link';
import type { FeedArtwork } from '@abstract/shared';

export function ArtworkCard({ artwork, imageUrl }: { artwork: FeedArtwork; imageUrl: string }) {
  const ratio =
    artwork.width && artwork.height ? artwork.width / artwork.height : 1;

  return (
    <Link
      href={`/artwork/${artwork.id}`}
      className="group block break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-ink-900"
    >
      <div className="relative w-full" style={{ aspectRatio: ratio }}>
        <Image
          src={imageUrl}
          alt={artwork.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          // Animated GIFs must bypass Next's optimizer or they freeze on frame 1.
          unoptimized={artwork.image_path.toLowerCase().endsWith('.gif')}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex items-center justify-between p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{artwork.title}</p>
          <p className="truncate text-xs text-zinc-400">
            by {artwork.author_display_name ?? artwork.author_username}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span>♥ {artwork.like_count}</span>
          <span>💬 {artwork.comment_count}</span>
        </div>
      </div>
    </Link>
  );
}
