import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { signInSchema } from '@abstract/shared';
import { supabase } from '@/lib/supabase';
import { Button, ErrorText, Field } from '@/components/ui';
import { theme } from '@/lib/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Welcome back</Text>
      <Text style={styles.sub}>Log in to like, comment and share your art.</Text>

      <View style={styles.form}>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />
        <ErrorText>{error}</ErrorText>
        <Button label="Log in" onPress={submit} loading={busy} />
      </View>

      <Link href="/signup" replace style={styles.link}>
        New here? Create an account
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 8, backgroundColor: theme.colors.bg, flexGrow: 1 },
  heading: { color: theme.colors.text, fontSize: 26, fontWeight: '900', marginTop: 12 },
  sub: { color: theme.colors.textMuted, fontSize: 14 },
  form: { gap: 14, marginTop: 20 },
  link: { color: theme.colors.accent, textAlign: 'center', marginTop: 20, fontSize: 14 },
});
