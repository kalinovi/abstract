'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  ARTWORKS_BUCKET,
  deleteArtwork as deleteArtworkRow,
} from '@abstract/shared';
import { createClient } from '@/lib/supabase/server';

/** Deletes an artwork (row + stored image). RLS guarantees author-only. */
export async function deleteArtwork(formData: FormData) {
  const id = String(formData.get('id'));
  const imagePath = String(formData.get('image_path'));

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  await deleteArtworkRow(supabase, id);
  if (imagePath) {
    await supabase.storage.from(ARTWORKS_BUCKET).remove([imagePath]);
  }

  revalidatePath('/gallery');
  redirect('/gallery');
}
