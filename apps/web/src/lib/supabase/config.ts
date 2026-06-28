/**
 * Whether real Supabase credentials are present. When the app is running with
 * the placeholder env values (no project connected yet), data pages skip the
 * network entirely and render their empty/notice state instantly instead of
 * hanging on a request that can't succeed.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    !!url &&
    !!key &&
    !url.includes('placeholder') &&
    !key.includes('placeholder')
  );
}
