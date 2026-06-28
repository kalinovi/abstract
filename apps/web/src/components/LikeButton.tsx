'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { likeArtwork, unlikeArtwork } from '@abstract/shared';
import { createClient } from '@/lib/supabase/client';

export function LikeButton({
  artworkId,
  userId,
  initialLiked,
  initialCount,
}: {
  artworkId: string;
  userId: string | null;
  initialLiked: boolean;
  initialCount: number;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (!userId) {
      router.push('/login?next=' + encodeURIComponent(window.location.pathname));
      return;
    }
    const supabase = createClient();
    const next = !liked;
    // Optimistic update
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    setPending(true);
    try {
      if (next) await likeArtwork(supabase, artworkId, userId);
      else await unlikeArtwork(supabase, artworkId, userId);
    } catch {
      // Roll back on failure
      setLiked(!next);
      setCount((c) => c + (next ? -1 : 1));
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-pressed={liked}
      className={`btn ${liked ? 'bg-accent text-white' : 'border border-white/15 hover:bg-white/10'}`}
    >
      <span aria-hidden>{liked ? '♥' : '♡'}</span>
      {count} {count === 1 ? 'like' : 'likes'}
    </button>
  );
}
