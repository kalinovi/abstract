import Link from 'next/link';
import Image from 'next/image';
import { artworkImageUrl, getFeed } from '@abstract/shared';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { HeroVideo } from '@/components/HeroVideo';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createClient();
  let preview: Awaited<ReturnType<typeof getFeed>> = [];
  if (isSupabaseConfigured()) {
    try {
      preview = (await getFeed(supabase, { page: 0 })).slice(0, 6);
    } catch {
      // Backend unreachable — landing still renders.
    }
  }

  return (
    <>
      {/* Hero with background video — pulled up under the transparent fixed navbar */}
      <section className="relative isolate -mt-16 overflow-hidden">
        {/* Gradient stand-in; the video mounts after hydration (see HeroVideo). */}
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-ink-800 via-ink-950 to-black" />
        <HeroVideo />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950/10 via-ink-950/25 to-ink-950" />

        <div className="mx-auto max-w-4xl px-5 py-32 text-center sm:py-44">
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            Share your inspiration with the world.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-300">
            Abstract is an online art gallery & community. Discover pieces from creators all
            over the world, explore, and share your own art.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/gallery" className="btn-primary px-7 py-3 text-base">
              Explore the gallery
            </Link>
            <Link href="/signup" className="btn-ghost px-7 py-3 text-base">
              Join the community
            </Link>
          </div>
        </div>
      </section>

      {/* Recent artworks preview */}
      {preview.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold">Fresh from the community</h2>
            <Link href="/gallery" className="text-sm text-accent hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {preview.map((art) => (
              <Link
                key={art.id}
                href={`/artwork/${art.id}`}
                className="relative aspect-square overflow-hidden rounded-2xl border border-white/10"
              >
                <Image
                  src={artworkImageUrl(supabase, art.image_path)}
                  alt={art.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  unoptimized={art.image_path.toLowerCase().endsWith('.gif')}
                  className="object-cover transition duration-500 hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="border-t border-white/10 bg-ink-900/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:grid-cols-3">
          {[
            { t: 'Discover', d: 'Browse a living feed of artwork from creators worldwide.' },
            { t: 'Share', d: 'Upload your pieces in seconds and reach a real audience.' },
            { t: 'Connect', d: 'Like and comment to support the artists you love.' },
          ].map((f) => (
            <div key={f.t}>
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/20 text-accent">
                ◆
              </div>
              <h3 className="text-lg font-bold">{f.t}</h3>
              <p className="mt-1 text-sm text-zinc-400">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
