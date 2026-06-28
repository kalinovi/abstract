import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { CommentWithAuthor, FeedArtwork, Profile } from './types';

/**
 * Platform-agnostic data access. Every function takes a typed Supabase
 * client so both the Next.js and Expo apps share exactly the same logic.
 */
export type DB = SupabaseClient<Database>;

export const ARTWORKS_BUCKET = 'artworks';
export const AVATARS_BUCKET = 'avatars';

const PAGE_SIZE = 24;

/** Public URL for a file stored in the artworks bucket. */
export function artworkImageUrl(supabase: DB, imagePath: string): string {
  return supabase.storage.from(ARTWORKS_BUCKET).getPublicUrl(imagePath).data.publicUrl;
}

export function avatarUrl(supabase: DB, path: string | null): string | null {
  if (!path) return null;
  // OAuth providers (Google, GitHub…) store a full external URL — use as-is.
  if (/^https?:\/\//.test(path)) return path;
  return supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** The gallery feed, newest first. Optionally scoped to one author. */
export async function getFeed(
  supabase: DB,
  opts: { page?: number; authorId?: string } = {},
): Promise<FeedArtwork[]> {
  const page = opts.page ?? 0;
  let query = supabase
    .from('artwork_feed')
    .select('*')
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  if (opts.authorId) query = query.eq('author_id', opts.authorId);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getArtwork(supabase: DB, id: string): Promise<FeedArtwork | null> {
  const { data, error } = await supabase
    .from('artwork_feed')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Which of the given artworks the current user has liked. */
export async function getLikedSet(
  supabase: DB,
  userId: string,
  artworkIds: string[],
): Promise<Set<string>> {
  if (artworkIds.length === 0) return new Set();
  const { data, error } = await supabase
    .from('likes')
    .select('artwork_id')
    .eq('user_id', userId)
    .in('artwork_id', artworkIds);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.artwork_id));
}

export async function likeArtwork(supabase: DB, artworkId: string, userId: string) {
  const { error } = await supabase
    .from('likes')
    .insert({ artwork_id: artworkId, user_id: userId });
  if (error && error.code !== '23505') throw error; // ignore "already liked"
}

export async function unlikeArtwork(supabase: DB, artworkId: string, userId: string) {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('artwork_id', artworkId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function getComments(
  supabase: DB,
  artworkId: string,
): Promise<CommentWithAuthor[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*, author:profiles!comments_author_id_fkey(username, display_name, avatar_url)')
    .eq('artwork_id', artworkId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as CommentWithAuthor[];
}

export async function addComment(
  supabase: DB,
  artworkId: string,
  authorId: string,
  body: string,
) {
  const { error } = await supabase
    .from('comments')
    .insert({ artwork_id: artworkId, author_id: authorId, body });
  if (error) throw error;
}

export async function createArtwork(
  supabase: DB,
  input: {
    author_id: string;
    title: string;
    description?: string | null;
    image_path: string;
    width?: number | null;
    height?: number | null;
  },
) {
  const { data, error } = await supabase
    .from('artworks')
    .insert(input)
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function deleteArtwork(supabase: DB, id: string) {
  const { error } = await supabase.from('artworks').delete().eq('id', id);
  if (error) throw error;
}

export async function getProfileByUsername(
  supabase: DB,
  username: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProfileById(supabase: DB, id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(
  supabase: DB,
  id: string,
  patch: Partial<Pick<Profile, 'display_name' | 'bio' | 'avatar_url'>>,
) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', id);
  if (error) throw error;
}
