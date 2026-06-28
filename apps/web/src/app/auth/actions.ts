'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signInSchema, signUpSchema } from '@abstract/shared';
import { createClient } from '@/lib/supabase/server';

export type AuthState = { error: string | null };

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  // Only allow same-site, absolute-path redirects (avoid open redirects).
  const raw = (formData.get('next') as string) || '/gallery';
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/gallery';
  revalidatePath('/', 'layout');
  redirect(next);
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    username: formData.get('username'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { username: parsed.data.username, display_name: parsed.data.username } },
  });
  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  redirect('/gallery');
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
