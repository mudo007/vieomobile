import { Image, type ImageProps } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useReducer, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { describeMediaSource, logMediaDebug } from '@/src/diagnostics/media-debug-log';
import {
  initialFollowerFeedState,
  reduceFollowerFeed,
  type FollowerFeedEvent,
  type FollowerFeedState,
  type FollowerFeedVideo,
} from '@/src/domain/follower';
import { AppColors, AppRadii, AppShadow, AppSpacing } from '@/src/presentation/shared/app-design';
import type { FollowerFeedPort } from '@/src/use-cases/follower';
import { useFollowerFeed } from './use-follower-feed';

export type FollowerFeedScreenProps = {
  feedPort: FollowerFeedPort;
  initialState?: FollowerFeedState;
  closePlaybackSignal?: number;
  onExitFlow?: () => void;
};

export function FollowerFeedScreen({
  feedPort,
  initialState,
  closePlaybackSignal,
  onExitFlow,
}: FollowerFeedScreenProps) {
  const [state, dispatch] = useReducer(
    reduceFollowerFeed,
    initialState ?? initialFollowerFeedState
  );
  const previousClosePlaybackSignal = useRef(closePlaybackSignal);

  useFollowerFeed({
    state,
    feedPort,
    dispatch,
  });

  const handleDispatch = (event: FollowerFeedEvent) => {
    dispatch(event);
  };

  const handleExitFlow = () => {
    dispatch({ type: 'closeVideo' });
    onExitFlow?.();
  };

  useEffect(() => {
    if (previousClosePlaybackSignal.current === closePlaybackSignal) {
      return;
    }

    previousClosePlaybackSignal.current = closePlaybackSignal;
    dispatch({ type: 'closeVideo' });
  }, [closePlaybackSignal]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Text style={styles.brand}>VideoShare</Text>
          <View style={styles.headerActions}>
            <View style={[styles.navPill, styles.navPillActive]}>
              <Text style={styles.navPillActiveText}>▣ Feed</Text>
            </View>
            <View style={styles.navPill}>
              <Text style={styles.navPillText}>↥ Upload</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
      <View style={styles.content}>
        {onExitFlow ? (
          <Pressable accessibilityRole="button" onPress={handleExitFlow} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Back home</Text>
          </Pressable>
        ) : null}
        {renderFollowerFeedState(state, handleDispatch)}
      </View>
    </View>
  );
}

function renderFollowerFeedState(
  state: FollowerFeedState,
  dispatch: (event: FollowerFeedEvent) => void
) {
  switch (state.status) {
    case 'loading':
      return (
        <View style={styles.stateCard}>
          <ActivityIndicator color={AppColors.primary} />
          <Text style={styles.text}>Loading feed...</Text>
        </View>
      );

    case 'empty':
      return (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>No videos yet.</Text>
          <Text style={styles.mutedText}>Pull down or tap refresh to check again.</Text>
          <RefreshButton dispatch={dispatch} />
        </View>
      );

    case 'failed':
      return (
        <View style={styles.stateCard}>
          <Text style={styles.errorText}>{state.message}</Text>
          <RefreshButton dispatch={dispatch} />
        </View>
      );

    case 'ready':
    case 'refreshing':
    case 'playing':
      return (
        <View style={styles.feedContainer}>
          <Text style={styles.pageTitle}>Your Feed. Drag down and hold to refresh.</Text>
          {state.status === 'refreshing' ? (
            <ActivityIndicator
              accessibilityLabel="Refreshing feed"
              color={AppColors.primary}
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
                tintColor={AppColors.primary}
              />
            }>
          {state.videos.map((video) => (
            <FollowerVideoCard
              key={video.id}
              video={video}
              isPlaying={state.status === 'playing' && state.video.id === video.id}
              dispatch={dispatch}
            />
          ))}
          </ScrollView>
        </View>
      );
  }
}

function FollowerVideoCard({
  video,
  isPlaying,
  dispatch,
}: {
  video: FollowerFeedVideo;
  isPlaying: boolean;
  dispatch: (event: FollowerFeedEvent) => void;
}) {
  const imageSource = getThumbnailImageSource(video);

  logMediaDebug('follower card rendered', {
    id: video.id,
    title: video.title,
    imageUri: video.imageUri,
    imageSource: describeMediaSource(imageSource),
  });

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => dispatch({ type: 'videoSelected', video })}
      style={styles.card}>
      {isPlaying && video.sourceUri ? (
        <InlineFollowerVideoPlayer sourceUri={video.sourceUri} title={video.title} />
      ) : imageSource ? (
        <Image
          accessibilityLabel={`Thumbnail for ${video.title}`}
          source={imageSource}
          style={styles.cardImage}
        />
      ) : (
        <View style={styles.cardImageFallback}>
          <Text style={styles.cardImageFallbackText}>Video</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>♡</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{video.title}</Text>
          <Text style={styles.creatorName}>{video.creatorName}</Text>
          {video.description ? <Text style={styles.description}>{video.description}</Text> : null}
          <View style={styles.cardMeta}>
            <Text style={styles.metaText}>♡ {video.likeCount ?? 0}</Text>
            <Text style={styles.metaText}>◌ {video.commentCount ?? 0}</Text>
            <Text style={styles.metaText}>⌯</Text>
            <Text style={[styles.metaText, styles.metaTime]}>{video.publishedAgo ?? video.durationLabel}</Text>
          </View>
          {isPlaying ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => dispatch({ type: 'closeVideo' })}
              style={styles.inlineCloseButton}>
              <Text style={styles.inlineCloseButtonText}>Close video</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function InlineFollowerVideoPlayer({ sourceUri, title }: { sourceUri: string; title: string }) {
  const player = useVideoPlayer({ uri: sourceUri }, (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.play();
  });

  return (
    <View style={styles.videoFrame}>
      <VideoView
        accessibilityLabel={`Inline player for ${title}`}
        allowsPictureInPicture={false}
        contentFit="contain"
        fullscreenOptions={{
          enable: true,
          orientation: 'default',
        }}
        nativeControls
        player={player}
        style={styles.videoPlayer}
      />
    </View>
  );
}

function getThumbnailImageSource(video: FollowerFeedVideo): ImageProps['source'] | null {
  if (video.imageSource) {
    return video.imageSource as ImageProps['source'];
  }

  if (video.imageUri) {
    return { uri: video.imageUri };
  }

  return null;
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
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: AppSpacing.md,
    paddingBottom: AppSpacing.sm,
    paddingTop: AppSpacing.sm,
  },
  headerSafeArea: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.softBorder,
    backgroundColor: AppColors.surface,
  },
  brand: {
    color: AppColors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: AppSpacing.xs,
  },
  navPill: {
    borderRadius: AppRadii.sm,
    backgroundColor: AppColors.mutedSurface,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  navPillActive: {
    backgroundColor: AppColors.primary,
  },
  navPillText: {
    color: '#344054',
    fontSize: 13,
    fontWeight: '600',
  },
  navPillActiveText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: AppSpacing.md,
    padding: AppSpacing.md,
  },
  pageTitle: {
    color: AppColors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: AppSpacing.sm,
  },
  feedContainer: {
    flex: 1,
    gap: AppSpacing.sm,
  },
  feed: {
    gap: AppSpacing.lg,
    paddingBottom: AppSpacing.xl,
  },
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.softBorder,
    borderRadius: AppRadii.md,
    backgroundColor: AppColors.surface,
    ...AppShadow,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: AppColors.mutedSurface,
  },
  videoFrame: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#111827',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#111827',
  },
  cardImageFallback: {
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.mutedSurface,
  },
  cardImageFallbackText: {
    color: AppColors.mutedText,
    fontWeight: '700',
  },
  cardBody: {
    flexDirection: 'row',
    gap: AppSpacing.sm,
    padding: AppSpacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: AppColors.purple,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  cardContent: {
    flex: 1,
    gap: AppSpacing.xs,
  },
  cardTitle: {
    color: AppColors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  creatorName: {
    color: AppColors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  text: {
    color: AppColors.text,
  },
  mutedText: {
    color: AppColors.mutedText,
  },
  description: {
    color: AppColors.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.md,
    borderTopWidth: 1,
    borderTopColor: AppColors.softBorder,
    marginTop: AppSpacing.xs,
    paddingTop: AppSpacing.sm,
  },
  metaText: {
    color: '#344054',
    fontSize: 12,
    fontWeight: '700',
  },
  metaTime: {
    marginLeft: 'auto',
    color: '#98a2b3',
    fontWeight: '600',
  },
  stateCard: {
    gap: AppSpacing.md,
    borderWidth: 1,
    borderColor: AppColors.softBorder,
    borderRadius: AppRadii.md,
    backgroundColor: AppColors.surface,
    padding: AppSpacing.lg,
    ...AppShadow,
  },
  stateTitle: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    color: AppColors.danger,
    fontWeight: '700',
  },
  primaryButton: {
    alignSelf: 'flex-start',
    borderRadius: AppRadii.sm,
    backgroundColor: AppColors.primary,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    borderRadius: AppRadii.sm,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surface,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: AppColors.text,
    fontWeight: '700',
  },
  inlineCloseButton: {
    alignSelf: 'flex-start',
    borderRadius: AppRadii.sm,
    backgroundColor: AppColors.mutedSurface,
    marginTop: AppSpacing.xs,
    paddingHorizontal: AppSpacing.sm,
    paddingVertical: 8,
  },
  inlineCloseButtonText: {
    color: AppColors.text,
    fontWeight: '700',
  },
});
