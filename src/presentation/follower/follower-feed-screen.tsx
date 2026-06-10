import { useReducer } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  initialFollowerFeedState,
  reduceFollowerFeed,
  type FollowerFeedEvent,
  type FollowerFeedState,
  type FollowerFeedVideo,
} from '@/src/domain/follower';
import type { FollowerFeedPort } from '@/src/use-cases/follower';
import { useFollowerFeed } from './use-follower-feed';

export type FollowerFeedScreenProps = {
  feedPort: FollowerFeedPort;
  initialState?: FollowerFeedState;
  onExitFlow?: () => void;
};

export function FollowerFeedScreen({
  feedPort,
  initialState,
  onExitFlow,
}: FollowerFeedScreenProps) {
  const [state, dispatch] = useReducer(
    reduceFollowerFeed,
    initialState ?? initialFollowerFeedState
  );

  useFollowerFeed({
    state,
    feedPort,
    dispatch,
  });

  const handleDispatch = (event: FollowerFeedEvent) => {
    dispatch(event);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Follower</Text>
        {onExitFlow ? (
          <Pressable accessibilityRole="button" onPress={onExitFlow} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Back home</Text>
          </Pressable>
        ) : null}
      </View>
      {renderFollowerFeedState(state, handleDispatch)}
    </View>
  );
}

function renderFollowerFeedState(
  state: FollowerFeedState,
  dispatch: (event: FollowerFeedEvent) => void
) {
  switch (state.status) {
    case 'loading':
      return <Text style={styles.text}>Loading feed...</Text>;

    case 'empty':
      return (
        <View style={styles.section}>
          <Text style={styles.text}>No videos yet.</Text>
          <RefreshButton dispatch={dispatch} />
        </View>
      );

    case 'failed':
      return (
        <View style={styles.section}>
          <Text style={styles.errorText}>{state.message}</Text>
          <RefreshButton dispatch={dispatch} />
        </View>
      );

    case 'playing':
      return (
        <View style={styles.player}>
          <Text style={styles.playerTitle}>{state.video.title}</Text>
          <View style={styles.fakeFrame}>
            <Text style={styles.fakeFrameText}>Video plays here</Text>
          </View>
          <Text style={styles.text}>{state.video.creatorName}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => dispatch({ type: 'closeVideo' })}
            style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Close video</Text>
          </Pressable>
        </View>
      );

    case 'ready':
    case 'refreshing':
      return (
        <View style={styles.feedContainer}>
          {state.status === 'refreshing' ? (
            <ActivityIndicator
              accessibilityLabel="Refreshing feed"
              color="#0a7ea4"
              size="small"
            />
          ) : null}
          <ScrollView
            testID="follower-feed-scroll"
            contentContainerStyle={styles.feed}
            refreshControl={
              <RefreshControl
                refreshing={state.status === 'refreshing'}
                onRefresh={() => dispatch({ type: 'refreshFeed' })}
                tintColor="#0a7ea4"
              />
            }>
          {state.videos.map((video) => (
            <FollowerVideoCard key={video.id} video={video} dispatch={dispatch} />
          ))}
          </ScrollView>
        </View>
      );
  }
}

function FollowerVideoCard({
  video,
  dispatch,
}: {
  video: FollowerFeedVideo;
  dispatch: (event: FollowerFeedEvent) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => dispatch({ type: 'videoSelected', video })}
      style={styles.card}>
      <Text style={styles.cardTitle}>{video.title}</Text>
      <Text style={styles.text}>{video.creatorName}</Text>
      <Text style={styles.duration}>{video.durationLabel}</Text>
    </Pressable>
  );
}

function RefreshButton({ dispatch }: { dispatch: (event: FollowerFeedEvent) => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => dispatch({ type: 'refreshFeed' })}
      style={styles.primaryButton}>
      <Text style={styles.primaryButtonText}>Refresh</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    gap: 24,
    padding: 24,
    paddingTop: 64,
  },
  header: {
    gap: 12,
  },
  title: {
    color: '#000',
    fontSize: 32,
    fontWeight: '700',
  },
  section: {
    gap: 12,
  },
  feedContainer: {
    flex: 1,
    gap: 12,
  },
  feed: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    gap: 8,
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: '700',
  },
  text: {
    color: '#000',
  },
  duration: {
    color: '#444',
    fontWeight: '700',
  },
  player: {
    flex: 1,
    gap: 16,
  },
  playerTitle: {
    color: '#000',
    fontSize: 24,
    fontWeight: '700',
  },
  fakeFrame: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#111',
    padding: 24,
  },
  fakeFrameText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  errorText: {
    color: '#b42318',
  },
  primaryButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d7de',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#000',
  },
});
