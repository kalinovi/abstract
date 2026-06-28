/**
 * Database types.
 *
 * Hand-written to mirror supabase/migrations. Once you have a Supabase
 * project running you can regenerate these from the live schema with:
 *
 *   npm run gen:types
 *
 * (which runs `supabase gen types typescript --local`).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          username?: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      artworks: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          description: string | null;
          image_path: string;
          width: number | null;
          height: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          description?: string | null;
          image_path: string;
          width?: number | null;
          height?: number | null;
        };
        Update: {
          title?: string;
          description?: string | null;
        };
        Relationships: [];
      };
      likes: {
        Row: { artwork_id: string; user_id: string; created_at: string };
        Insert: { artwork_id: string; user_id: string };
        Update: { artwork_id?: string; user_id?: string };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          artwork_id: string;
          author_id: string;
          body: string;
          created_at: string;
        };
        Insert: { artwork_id: string; author_id: string; body: string };
        Update: { body?: string };
        Relationships: [];
      };
    };
    Views: {
      artwork_feed: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          image_path: string;
          width: number | null;
          height: number | null;
          created_at: string;
          author_id: string;
          author_username: string;
          author_display_name: string | null;
          author_avatar_url: string | null;
          like_count: number;
          comment_count: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
