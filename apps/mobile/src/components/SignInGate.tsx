import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from './ui';
import { theme } from '@/lib/theme';

/** Shown on protected tabs when the user is not signed in. */
export function SignInGate({ message }: { message: string }) {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{message}</Text>
      <View style={styles.actions}>
        <Button label="Log in" onPress={() => router.push('/login')} />
        <Button label="Create account" variant="ghost" onPress={() => router.push('/signup')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 },
  text: { color: theme.colors.textMuted, textAlign: 'center', fontSize: 15 },
  actions: { gap: 12, width: '100%' },
});
