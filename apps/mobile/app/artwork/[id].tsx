import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  addComment,
  artworkImageUrl,
  commentSchema,
  getArtwork,
  getComments,
  getLikedSet,
  likeArtwork,
  unlikeArtwork,
  type CommentWithAuthor,
  type FeedArtwork,
} from '@abstract/shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Button, ErrorText, Field } from '@/components/ui';
import { theme } from '@/lib/theme';

export default function ArtworkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [artwork, setArtwork] = useState<FeedArtwork | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const art = await getArtwork(supabase, id);
        setArtwork(art);
        setLikeCount(art?.like_count ?? 0);
        setComments(await getComments(supabase, id));
        if (art && user) {
          const set = await getLikedSet(supabase, user.id, [art.id]);
          setLiked(set.has(art.id));
        }
      } catch {
        setError('Could not load this artwork.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  async function toggleLike() {
    if (!user) return router.push('/login');
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      if (next) await likeArtwork(supabase, artwork!.id, user.id);
      else await unlikeArtwork(supabase, artwork!.id, user.id);
    } catch {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    }
  }

  async function postComment() {
    setError(null);
    if (!user) return router.push('/login');
    const parsed = commentSchema.safeParse({ body });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid comment');
      return;
    }
    setPosting(true);
    try {
      await addComment(supabase, artwork!.id, user.id, parsed.data.body);
      setBody('');
      setComments(await getComments(supabase, artwork!.id));
    } catch {
      setError('Could not post your comment.');
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }
  if (!artwork) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{error ?? 'Artwork not found.'}</Text>
      </View>
    );
  }

  const ratio = artwork.width && artwork.height ? artwork.width / artwork.height : 1;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={{ uri: artworkImageUrl(supabase, artwork.image_path) }}
          style={[styles.image, { aspectRatio: ratio }]}
          contentFit="contain"
          transition={200}
        />

        <Text style={styles.title}>{artwork.title}</Text>
        <Text style={styles.author}>
          by {artwork.author_display_name ?? artwork.author_username}
        </Text>

        <View style={{ marginTop: 12 }}>
          <Button
            label={`${liked ? '♥' : '♡'}  ${likeCount} ${likeCount === 1 ? 'like' : 'likes'}`}
            variant={liked ? 'primary' : 'ghost'}
            onPress={toggleLike}
          />
        </View>

        {artwork.description ? (
          <Text style={styles.description}>{artwork.description}</Text>
        ) : null}

        <Text style={styles.section}>Comments ({comments.length})</Text>

        <Field
          value={body}
          onChangeText={setBody}
          placeholder={user ? 'Add a comment…' : 'Log in to comment'}
          multiline
          style={{ minHeight: 70, textAlignVertical: 'top' }}
        />
        <ErrorText>{error}</ErrorText>
        <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
          <View style={{ width: 120 }}>
            <Button label="Post" onPress={postComment} loading={posting} />
          </View>
        </View>

        {comments.map((c) => (
          <View key={c.id} style={styles.comment}>
            <Text style={styles.commentAuthor}>
              {c.author?.display_name ?? c.author?.username ?? 'user'}
            </Text>
            <Text style={styles.commentBody}>{c.body}</Text>
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg },
  muted: { color: theme.colors.textMuted },
  container: { padding: 16, gap: 6, paddingBottom: 48 },
  image: {
    width: '100%',
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '900', marginTop: 14 },
  author: { color: theme.colors.textMuted, fontSize: 14 },
  description: { color: theme.colors.text, fontSize: 15, marginTop: 12, lineHeight: 21 },
  section: { color: theme.colors.text, fontSize: 17, fontWeight: '800', marginTop: 24, marginBottom: 8 },
  comment: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: 12,
    marginTop: 10,
  },
  commentAuthor: { color: theme.colors.text, fontWeight: '700', fontSize: 14 },
  commentBody: { color: theme.colors.text, marginTop: 4, fontSize: 14 },
});
