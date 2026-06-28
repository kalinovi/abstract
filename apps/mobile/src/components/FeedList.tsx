import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { artworkImageUrl, getFeed, type FeedArtwork } from '@abstract/shared';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';

export function FeedList({
  authorId,
  ListHeaderComponent,
}: {
  authorId?: string;
  ListHeaderComponent?: React.ReactElement;
}) {
  const [items, setItems] = useState<FeedArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setItems(await getFeed(supabase, { authorId }));
    } catch {
      setError('Could not load the gallery. Check your Supabase keys.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authorId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{ gap: 12, paddingHorizontal: 12 }}
      contentContainerStyle={{ gap: 12, paddingVertical: 12 }}
      ListHeaderComponent={ListHeaderComponent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          tintColor={theme.colors.accent}
        />
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.muted}>{error ?? 'No artwork yet.'}</Text>
        </View>
      }
      renderItem={({ item }) => <Card art={item} />}
    />
  );
}

function Card({ art }: { art: FeedArtwork }) {
  return (
    <Link href={`/artwork/${art.id}`} asChild>
      <Pressable style={styles.card}>
        <Image
          source={{ uri: artworkImageUrl(supabase, art.image_path) }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.cardBody}>
          <Text numberOfLines={1} style={styles.title}>
            {art.title}
          </Text>
          <Text numberOfLines={1} style={styles.author}>
            by {art.author_display_name ?? art.author_username}
          </Text>
          <Text style={styles.stats}>
            ♥ {art.like_count}   💬 {art.comment_count}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  center: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  muted: { color: theme.colors.textMuted, textAlign: 'center' },
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  image: { width: '100%', aspectRatio: 1, backgroundColor: theme.colors.surfaceAlt },
  cardBody: { padding: 10, gap: 2 },
  title: { color: theme.colors.text, fontWeight: '700', fontSize: 14 },
  author: { color: theme.colors.textMuted, fontSize: 12 },
  stats: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
});
