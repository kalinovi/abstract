import { z } from 'zod';

/** Shared validation schemas — used by forms on web and mobile. */

export const usernameSchema = z
  .string()
  .min(3, 'At least 3 characters')
  .max(30, 'At most 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores');

export const signUpSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  username: usernameSchema,
});

export const signInSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const artworkSchema = z.object({
  title: z.string().min(1, 'A title is required').max(120, 'At most 120 characters'),
  description: z.string().max(2000, 'At most 2000 characters').optional().or(z.literal('')),
});

export const profileSchema = z.object({
  display_name: z.string().max(60).optional().or(z.literal('')),
  bio: z.string().max(280, 'At most 280 characters').optional().or(z.literal('')),
});

export const commentSchema = z.object({
  body: z.string().min(1, 'Write something').max(1000, 'At most 1000 characters'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ArtworkInput = z.infer<typeof artworkSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
