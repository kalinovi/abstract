import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getProfileById, type Profile } from '@abstract/shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { FeedList } from '@/components/FeedList';
import { SignInGate } from '@/components/SignInGate';
import { Button } from '@/components/ui';
import { theme } from '@/lib/theme';

export default function ProfileScreen() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) getProfileById(supabase, user.id).then(setProfile).catch(() => {});
  }, [user]);

  if (loading) return <View style={{ flex: 1, backgroundColor: theme.colors.bg }} />;
  if (!user) return <SignInGate message="Log in to see your profile and artworks." />;

  const header = (
    <View style={styles.header}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(profile?.display_name ?? profile?.username ?? '?').charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.name}>{profile?.display_name ?? profile?.username ?? 'You'}</Text>
      {profile?.username && <Text style={styles.handle}>@{profile.username}</Text>}
      {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
      <View style={{ marginTop: 16, width: '100%' }}>
        <Button label="Sign out" variant="ghost" onPress={() => supabase.auth.signOut()} />
      </View>
      <Text style={styles.section}>Your artworks</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <FeedList authorId={user.id} ListHeaderComponent={header} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingHorizontal: 16, paddingTop: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  name: { color: theme.colors.text, fontSize: 20, fontWeight: '800', marginTop: 12 },
  handle: { color: theme.colors.textMuted, fontSize: 14, marginTop: 2 },
  bio: { color: theme.colors.text, textAlign: 'center', marginTop: 8 },
  section: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 16,
    alignSelf: 'flex-start',
    marginTop: 24,
  },
});
