import { View } from 'react-native';
import { FeedList } from '@/components/FeedList';
import { theme } from '@/lib/theme';

export default function GalleryScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <FeedList />
    </View>
  );
}
