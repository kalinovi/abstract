'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addComment,
  getComments,
  commentSchema,
  type CommentWithAuthor,
} from '@abstract/shared';
import { createClient } from '@/lib/supabase/client';

export function CommentSection({
  artworkId,
  userId,
}: {
  artworkId: string;
  userId: string | null;
}) {
  const router = useRouter();
  const supabase = useRef(createClient()).current;
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getComments(supabase, artworkId)
      .then(setComments)
      .catch(() => setError('Could not load comments'))
      .finally(() => setLoading(false));
  }, [supabase, artworkId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!userId) {
      router.push('/login?next=' + encodeURIComponent(window.location.pathname));
      return;
    }
    const parsed = commentSchema.safeParse({ body });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid comment');
      return;
    }
    setSubmitting(true);
    try {
      await addComment(supabase, artworkId, userId, parsed.data.body);
      setBody('');
      setComments(await getComments(supabase, artworkId));
    } catch {
      setError('Could not post your comment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-bold">
        Comments {!loading && <span className="text-zinc-500">({comments.length})</span>}
      </h2>

      <form onSubmit={submit} className="mb-6">
        <textarea
          className="field min-h-[80px] resize-y"
          placeholder={userId ? 'Add a comment…' : 'Log in to join the conversation'}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
        <div className="mt-2 flex justify-end">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-zinc-500">No comments yet. Be the first.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="card p-4">
              <p className="text-sm font-semibold">
                {c.author?.display_name ?? c.author?.username ?? 'user'}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-300">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
