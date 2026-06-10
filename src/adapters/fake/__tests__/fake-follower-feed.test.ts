import { createFakeFollowerFeed } from '@/src/adapters/fake';

describe('FakeFollowerFeed', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('loads demo follower feed videos', async () => {
    // Given
    const controller = new AbortController();
    const feedPort = createFakeFollowerFeed();

    // When
    const videos = await feedPort.loadFollowerFeed({
      reason: 'initial',
      signal: controller.signal,
    });

    // Then
    expect(videos).toEqual([
      expect.objectContaining({
        id: 'feed-video-1',
        title: 'Amazing Sunset Timelapse',
        creatorName: 'NatureFilms',
        durationLabel: '00:42',
      }),
      expect.objectContaining({
        id: 'feed-video-2',
        title: 'Quick Cooking Tutorial: Pasta Carbonara',
        creatorName: 'Kitchen Notes',
        durationLabel: '01:18',
      }),
    ]);
  });

  it('delays refresh loads for the configured duration', async () => {
    // Given
    const controller = new AbortController();
    const feedPort = createFakeFollowerFeed({ refreshDelayMs: 3000 });

    // When
    const loadPromise = feedPort.loadFollowerFeed({
      reason: 'refresh',
      signal: controller.signal,
    });
    await jest.advanceTimersByTimeAsync(2999);

    // Then
    await expect(Promise.race([loadPromise, Promise.resolve('pending')])).resolves.toBe('pending');

    // When
    await jest.advanceTimersByTimeAsync(1);

    // Then
    await expect(loadPromise).resolves.toHaveLength(2);
  });

  it('rejects when loading is aborted', async () => {
    // Given
    const controller = new AbortController();
    const feedPort = createFakeFollowerFeed();

    // When
    controller.abort();
    const loadPromise = feedPort.loadFollowerFeed({
      reason: 'initial',
      signal: controller.signal,
    });

    // Then
    await expect(loadPromise).rejects.toThrow('Feed load aborted.');
  });
});
