import { notFound } from 'next/navigation';
import {
  artworkImageUrl,
  avatarUrl,
  getFeed,
  getProfileByUsername,
} from '@abstract/shared';
import { createClient } from '@/lib/supabase/server';
import { ArtworkCard } from '@/components/ArtworkCard';

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient();
  const profile = await getProfileByUsername(supabase, params.username).catch(() => null);
  if (!profile) notFound();

  const works = await getFeed(supabase, { authorId: profile.id }).catch(() => []);
  const avatar = avatarUrl(supabase, profile.avatar_url);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <header className="mb-10 flex items-center gap-5">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-ink-700">
          {avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={profile.username} className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-black">
            {profile.display_name ?? profile.username}
          </h1>
          <p className="text-sm text-zinc-400">@{profile.username}</p>
          {profile.bio && <p className="mt-2 max-w-prose text-sm text-zinc-300">{profile.bio}</p>}
          <p className="mt-2 text-xs text-zinc-500">
            {works.length} {works.length === 1 ? 'artwork' : 'artworks'}
          </p>
        </div>
      </header>

      {works.length === 0 ? (
        <p className="text-sm text-zinc-500">No artworks yet.</p>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {works.map((art) => (
            <ArtworkCard
              key={art.id}
              artwork={art}
              imageUrl={artworkImageUrl(supabase, art.image_path)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
