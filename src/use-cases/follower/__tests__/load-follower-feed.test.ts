import type { FollowerFeedState, FollowerFeedVideo } from '@/src/domain/follower';
import { loadFollowerFeed, type FollowerFeedPort } from '@/src/use-cases/follower';

const feedVideos: FollowerFeedVideo[] = [
  {
    id: 'video-1',
    title: 'Launch demo',
    creatorName: 'Diogo',
    durationLabel: '00:42',
  },
];

function createFeedPort(videos: FollowerFeedVideo[]): FollowerFeedPort {
  return {
    loadFollowerFeed: jest.fn().mockResolvedValue(videos),
  };
}

function createThrowingFeedPort(error: unknown): FollowerFeedPort {
  return {
    loadFollowerFeed: jest.fn().mockRejectedValue(error),
  };
}

describe('loadFollowerFeed', () => {
  it('does not call the feed port when the feed is not loading', async () => {
    // Given
    const state: FollowerFeedState = {
      status: 'ready',
      videos: feedVideos,
    };
    const controller = new AbortController();
    const feedPort = createFeedPort(feedVideos);

    // When
    const event = await loadFollowerFeed(state, { feedPort }, controller.signal);

    // Then
    expect(event).toBeNull();
    expect(feedPort.loadFollowerFeed).not.toHaveBeenCalled();
  });

  it('maps loaded videos into a feed loaded event', async () => {
    // Given
    const state: FollowerFeedState = { status: 'loading' };
    const controller = new AbortController();
    const feedPort = createFeedPort(feedVideos);

    // When
    const event = await loadFollowerFeed(state, { feedPort }, controller.signal);

    // Then
    expect(event).toEqual({
      type: 'feedLoaded',
      videos: feedVideos,
    });
    expect(feedPort.loadFollowerFeed).toHaveBeenCalledWith({
      reason: 'initial',
      signal: controller.signal,
    });
  });

  it('loads the feed with refresh reason when the feed is refreshing', async () => {
    // Given
    const state: FollowerFeedState = {
      status: 'refreshing',
      videos: feedVideos,
    };
    const controller = new AbortController();
    const feedPort = createFeedPort(feedVideos);

    // When
    const event = await loadFollowerFeed(state, { feedPort }, controller.signal);

    // Then
    expect(event).toEqual({
      type: 'feedLoaded',
      videos: feedVideos,
    });
    expect(feedPort.loadFollowerFeed).toHaveBeenCalledWith({
      reason: 'refresh',
      signal: controller.signal,
    });
  });

  it('maps feed failures into feed failed events', async () => {
    // Given
    const state: FollowerFeedState = { status: 'loading' };
    const controller = new AbortController();
    const feedPort = createThrowingFeedPort(new Error('Feed service unavailable.'));

    // When
    const event = await loadFollowerFeed(state, { feedPort }, controller.signal);

    // Then
    expect(event).toEqual({
      type: 'feedLoadFailed',
      message: 'Feed service unavailable.',
    });
  });

  it('ignores aborted feed loads', async () => {
    // Given
    const state: FollowerFeedState = { status: 'loading' };
    const controller = new AbortController();
    const feedPort = createThrowingFeedPort(createAbortError());

    // When
    controller.abort();
    const event = await loadFollowerFeed(state, { feedPort }, controller.signal);

    // Then
    expect(event).toBeNull();
  });
});

function createAbortError(): Error {
  const error = new Error('Feed load aborted.');
  error.name = 'AbortError';

  return error;
}
