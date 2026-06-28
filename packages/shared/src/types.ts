import type { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Artwork = Database['public']['Tables']['artworks']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];

/** A row from the artwork_feed view (artwork + author + counts). */
export type FeedArtwork = Database['public']['Views']['artwork_feed']['Row'];

/** A comment joined with its author's public profile. */
export type CommentWithAuthor = Comment & {
  author: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>;
};
