import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { signOut } from '@/app/auth/actions';
import { NavbarShell } from '@/components/NavbarShell';

export async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = isSupabaseConfigured()
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  let username: string | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle();
    username = data?.username ?? null;
  }

  return (
    <NavbarShell>
      <Link href="/" className="text-lg font-black tracking-tight">
        Abstract<span className="text-accent">.</span>
      </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/gallery" className="text-sm text-zinc-300 hover:text-white">
            Gallery
          </Link>

          {user ? (
            <>
              <Link href="/upload" className="btn-ghost py-2 text-sm">
                Share art
              </Link>
              {username && (
                <Link
                  href={`/u/${username}`}
                  className="text-sm text-zinc-300 hover:text-white"
                >
                  @{username}
                </Link>
              )}
              <form action={signOut}>
                <button type="submit" className="text-sm text-zinc-400 hover:text-white">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-zinc-300 hover:text-white">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary py-2 text-sm">
                Join
              </Link>
            </>
          )}
        </div>
    </NavbarShell>
  );
}
