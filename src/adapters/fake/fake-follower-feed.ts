import type { FollowerFeedVideo } from '@/src/domain/follower';
import type { FollowerFeedPort, LoadFollowerFeedInput } from '@/src/use-cases/follower';

const demoFeedVideos: FollowerFeedVideo[] = [
  {
    id: 'feed-video-1',
    title: 'Amazing Sunset Timelapse',
    creatorName: 'NatureFilms',
    durationLabel: '00:42',
    description:
      'Captured this beautiful sunset over the mountains. The colors were absolutely stunning!',
    imageUri:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    likeCount: 1234,
    commentCount: 89,
    publishedAgo: '2 hours ago',
  },
  {
    id: 'feed-video-2',
    title: 'Quick Cooking Tutorial: Pasta Carbonara',
    creatorName: 'Kitchen Notes',
    durationLabel: '01:18',
    description: 'A fast weeknight carbonara with crispy pancetta and a silky sauce.',
    imageUri:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80',
    likeCount: 842,
    commentCount: 37,
    publishedAgo: '5 hours ago',
  },
];

type FakeFollowerFeedOptions = {
  videos?: FollowerFeedVideo[];
  initialDelayMs?: number;
  refreshDelayMs?: number;
};

export class FakeFollowerFeed implements FollowerFeedPort {
  constructor(private readonly options: FakeFollowerFeedOptions = {}) {}

  async loadFollowerFeed(input: LoadFollowerFeedInput): Promise<FollowerFeedVideo[]> {
    if (input.signal.aborted) {
      throw createAbortError();
    }

    const delayMs =
      input.reason === 'refresh'
        ? (this.options.refreshDelayMs ?? 3000)
        : (this.options.initialDelayMs ?? 0);

    if (delayMs > 0) {
      await waitForDelay(delayMs, input.signal);
    }

    return this.options.videos ?? demoFeedVideos;
  }
}

export function createFakeFollowerFeed(options: FakeFollowerFeedOptions = {}): FakeFollowerFeed {
  return new FakeFollowerFeed(options);
}

function createAbortError(): Error {
  const error = new Error('Feed load aborted.');
  error.name = 'AbortError';

  return error;
}

function waitForDelay(delayMs: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, delayMs);

    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout);
        reject(createAbortError());
      },
      { once: true }
    );
  });
}
