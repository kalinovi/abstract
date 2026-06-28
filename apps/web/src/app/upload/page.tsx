import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UploadForm } from '@/components/UploadForm';

export default async function UploadPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt and suspenders — middleware already guards this route.
  if (!user) redirect('/login?next=/upload');

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="mb-2 text-3xl font-black">Share your art</h1>
      <p className="mb-8 text-sm text-zinc-400">
        Upload a piece to share it with the Abstract community.
      </p>
      <UploadForm userId={user.id} />
    </div>
  );
}
