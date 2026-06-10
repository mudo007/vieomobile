import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/src/presentation/shared/themed-text';

export default function FollowerRoute() {
  return (
    <View style={styles.container}>
      <ThemedText type="title">Follower</ThemedText>
      <ThemedText style={styles.description}>
        Feed browsing is intentionally parked while the walking skeleton focuses on the Creator
        upload flow.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  description: {
    maxWidth: 320,
  },
});
