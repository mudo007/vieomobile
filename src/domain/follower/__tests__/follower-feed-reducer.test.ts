import {
  initialFollowerFeedState,
  reduceFollowerFeed,
  type FollowerFeedState,
  type FollowerFeedVideo,
} from '@/src/domain/follower';

const feedVideos: FollowerFeedVideo[] = [
  {
    id: 'video-1',
    title: 'Launch demo',
    creatorName: 'Diogo',
    durationLabel: '00:42',
  },
];

describe('follower feed reducer', () => {
  it('starts loading the feed', () => {
    // Given / When / Then
    expect(initialFollowerFeedState).toEqual({ status: 'loading' });
  });

  it('moves to ready when videos are loaded', () => {
    // Given
    const state: FollowerFeedState = { status: 'loading' };

    // When
    const nextState = reduceFollowerFeed(state, {
      type: 'feedLoaded',
      videos: feedVideos,
    });

    // Then
    expect(nextState).toEqual({
      status: 'ready',
      videos: feedVideos,
    });
  });

  it('moves to empty when the loaded feed has no videos', () => {
    // Given
    const state: FollowerFeedState = { status: 'loading' };

    // When
    const nextState = reduceFollowerFeed(state, {
      type: 'feedLoaded',
      videos: [],
    });

    // Then
    expect(nextState).toEqual({ status: 'empty' });
  });

  it('moves to failed when loading fails', () => {
    // Given
    const state: FollowerFeedState = { status: 'loading' };

    // When
    const nextState = reduceFollowerFeed(state, {
      type: 'feedLoadFailed',
      message: 'Feed service unavailable.',
    });

    // Then
    expect(nextState).toEqual({
      status: 'failed',
      message: 'Feed service unavailable.',
    });
  });

  it('moves to refreshing and keeps videos when the follower refreshes from ready', () => {
    // Given
    const state: FollowerFeedState = {
      status: 'ready',
      videos: feedVideos,
    };

    // When
    const nextState = reduceFollowerFeed(state, { type: 'refreshFeed' });

    // Then
    expect(nextState).toEqual({
      status: 'refreshing',
      videos: feedVideos,
    });
  });

  it('moves to ready when refreshed videos are loaded', () => {
    // Given
    const state: FollowerFeedState = {
      status: 'refreshing',
      videos: feedVideos,
    };

    // When
    const nextState = reduceFollowerFeed(state, {
      type: 'feedLoaded',
      videos: feedVideos,
    });

    // Then
    expect(nextState).toEqual({
      status: 'ready',
      videos: feedVideos,
    });
  });

  it('opens the selected video from the ready feed', () => {
    // Given
    const state: FollowerFeedState = {
      status: 'ready',
      videos: feedVideos,
    };

    // When
    const nextState = reduceFollowerFeed(state, {
      type: 'videoSelected',
      video: feedVideos[0],
    });

    // Then
    expect(nextState).toEqual({
      status: 'playing',
      video: feedVideos[0],
      videos: feedVideos,
    });
  });

  it('closes the selected video and returns to the feed', () => {
    // Given
    const state: FollowerFeedState = {
      status: 'playing',
      video: feedVideos[0],
      videos: feedVideos,
    };

    // When
    const nextState = reduceFollowerFeed(state, { type: 'closeVideo' });

    // Then
    expect(nextState).toEqual({
      status: 'ready',
      videos: feedVideos,
    });
  });

  it('returns to loading when the follower refreshes from an empty feed', () => {
    // Given
    const state: FollowerFeedState = { status: 'empty' };

    // When
    const nextState = reduceFollowerFeed(state, { type: 'refreshFeed' });

    // Then
    expect(nextState).toEqual({ status: 'loading' });
  });

  it('ignores loaded events when the feed is not loading', () => {
    // Given
    const state: FollowerFeedState = {
      status: 'ready',
      videos: feedVideos,
    };

    // When
    const nextState = reduceFollowerFeed(state, {
      type: 'feedLoaded',
      videos: [],
    });

    // Then
    expect(nextState).toEqual(state);
  });
});
