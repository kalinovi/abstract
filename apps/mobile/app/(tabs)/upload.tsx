import { useState } from 'react';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ARTWORKS_BUCKET, artworkSchema, createArtwork } from '@abstract/shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Button, ErrorText, Field } from '@/components/ui';
import { SignInGate } from '@/components/SignInGate';
import { theme } from '@/lib/theme';

export default function UploadScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <View style={{ flex: 1, backgroundColor: theme.colors.bg }} />;
  if (!user) return <SignInGate message="Log in to share your art with the community." />;

  async function pick() {
    setError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      base64: true,
      exif: false,
    });
    if (!result.canceled) setAsset(result.assets[0]);
  }

  async function submit() {
    setError(null);
    const parsed = artworkSchema.safeParse({ title, description });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    if (!asset?.base64) {
      setError('Please choose an image');
      return;
    }

    setBusy(true);
    try {
      const ext = (asset.uri.split('.').pop() || 'jpg').toLowerCase().split('?')[0];
      const contentType = asset.mimeType ?? `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      const path = `${user!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(ARTWORKS_BUCKET)
        .upload(path, decode(asset.base64), { contentType, upsert: false });
      if (upErr) throw upErr;

      const id = await createArtwork(supabase, {
        author_id: user!.id,
        title: parsed.data.title,
        description: parsed.data.description || null,
        image_path: path,
        width: asset.width ?? null,
        height: asset.height ?? null,
      });

      setAsset(null);
      setTitle('');
      setDescription('');
      router.push(`/artwork/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={pick} style={styles.picker}>
        {asset ? (
          <Image source={{ uri: asset.uri }} style={styles.preview} contentFit="contain" />
        ) : (
          <Text style={styles.pickerText}>Tap to choose an image</Text>
        )}
      </Pressable>

      <Field label="Title" value={title} onChangeText={setTitle} placeholder="Name your piece" />
      <Field
        label="Description (optional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Tell the story behind it"
        multiline
        style={{ minHeight: 90, textAlignVertical: 'top' }}
      />
      <ErrorText>{error}</ErrorText>
      <Button label="Publish artwork" onPress={submit} loading={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16, backgroundColor: theme.colors.bg, flexGrow: 1 },
  picker: {
    height: 240,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pickerText: { color: theme.colors.textMuted },
  preview: { width: '100%', height: '100%' },
});
