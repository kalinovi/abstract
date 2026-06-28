// Seeds a couple of fake users with artworks, likes and comments.
//
// Requires admin (service_role) access because it creates auth users and
// uploads files on their behalf. NEVER commit your service_role key.
//
// Usage (from the repo root):
//   SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...  node supabase/seed-fake.mjs
//
// On Windows PowerShell:
//   $env:SUPABASE_URL="https://xxxx.supabase.co"
//   $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
//   node supabase/seed-fake.mjs
//
// Get both values from: Supabase Dashboard -> Project Settings -> API
// (use the "service_role" secret key, not the anon key).

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error(
    '\n  Missing env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.\n' +
      '  See the comment at the top of this file.\n',
  );
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(here, '..', 'images');

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Shared password so you can log into the fake accounts to test.
const PASSWORD = 'demo1234';

/** Fake artists and the artworks they "uploaded" (8 pieces across 3 artists). */
const SEED = [
  {
    email: 'lena@example.com',
    username: 'lena_ink',
    display_name: 'Lena Ink',
    bio: 'Abstract painter chasing accidents on canvas.',
    artworks: [
      { file: 'firstpiece.jpg', title: 'First Light', description: 'Where it all began.' },
      { file: 'forthpiece.jpg', title: 'Crimson Drift', description: 'Letting the red lead.' },
      { file: 'seventhpiece.jpg', title: 'Gold Veins', description: 'Cracks worth keeping.' },
    ],
  },
  {
    email: 'marco@example.com',
    username: 'marco_vee',
    display_name: 'Marco V.',
    bio: 'Mixed-media experiments and bold color.',
    artworks: [
      { file: 'secondpiece.jpg', title: 'Undertow', description: 'A pull you can feel.' },
      { file: 'fifthpiece.jpg', title: 'Cobalt Bloom', description: 'Blue, but alive.' },
      { file: 'eightpiece.jpg', title: 'Soft Collapse', description: 'Falling, gently.' },
    ],
  },
  {
    email: 'sara@example.com',
    username: 'sara_lume',
    display_name: 'Sara Lume',
    bio: 'Light, texture and quiet moments.',
    artworks: [
      { file: 'thirdpiece.jpg', title: 'Quiet Static', description: 'Noise, but make it calm.' },
      { file: 'sixthpiece.jpg', title: 'Paper Moon', description: 'A small light, far away.' },
      { file: 'lastpiece.gif', title: 'Living Ink', description: 'Motion, frozen and freed.' },
    ],
  },
];

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

async function getOrCreateUser(spec) {
  // Try to create; if the email already exists, look it up instead.
  const { data, error } = await admin.auth.admin.createUser({
    email: spec.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { username: spec.username, display_name: spec.display_name },
  });

  if (!error) return data.user;

  if (/already.*registered|exists/i.test(error.message)) {
    // Page through existing users to find the matching email.
    const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
    const found = list.users.find((u) => u.email === spec.email);
    if (found) return found;
  }
  throw error;
}

async function seedUser(spec) {
  console.log(`\n• ${spec.display_name} (@${spec.username})`);
  const user = await getOrCreateUser(spec);

  // The handle_new_user trigger created the profile; fill in the bio.
  await admin.from('profiles').update({ bio: spec.bio }).eq('id', user.id);

  // Idempotent: wipe this user's existing artworks (cascades likes/comments)
  // so re-running the seed doesn't pile up duplicates.
  await admin.from('artworks').delete().eq('author_id', user.id);

  const ids = [];
  for (const art of spec.artworks) {
    const ext = path.extname(art.file).toLowerCase();
    const buffer = await readFile(path.join(imagesDir, art.file));
    const storagePath = `${user.id}/${art.file}`;

    const { error: upErr } = await admin.storage
      .from('artworks')
      .upload(storagePath, buffer, { contentType: MIME[ext] ?? 'image/jpeg', upsert: true });
    if (upErr) throw upErr;

    const { data: row, error: insErr } = await admin
      .from('artworks')
      .insert({
        author_id: user.id,
        title: art.title,
        description: art.description,
        image_path: storagePath,
      })
      .select('id')
      .single();
    if (insErr) throw insErr;

    ids.push(row.id);
    console.log(`    ↳ "${art.title}" uploaded`);
  }
  return { user, artworkIds: ids };
}

async function main() {
  console.log('Seeding fake users and artworks…');
  const results = [];
  for (const spec of SEED) results.push(await seedUser(spec));

  // A little cross-engagement: each user likes + comments on the other's work.
  const [a, b] = results;
  if (a && b) {
    await admin.from('likes').upsert(
      [
        { artwork_id: b.artworkIds[0], user_id: a.user.id },
        { artwork_id: a.artworkIds[0], user_id: b.user.id },
      ],
      { onConflict: 'artwork_id,user_id', ignoreDuplicates: true },
    );
    await admin.from('comments').insert([
      { artwork_id: b.artworkIds[0], author_id: a.user.id, body: 'Love the movement here!' },
      { artwork_id: a.artworkIds[0], author_id: b.user.id, body: 'This palette is gorgeous.' },
    ]);
    console.log('\n• Added cross likes + comments');
  }

  console.log(
    `\nDone. ${results.length} users seeded. Log in with any of:\n` +
      SEED.map((s) => `   ${s.email}  /  ${PASSWORD}`).join('\n') +
      '\n',
  );
}

main().catch((e) => {
  console.error('\nSeed failed:', e.message ?? e);
  process.exit(1);
});
