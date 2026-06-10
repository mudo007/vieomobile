import type { FollowerFeedVideo } from '@/src/domain/follower';
import type { FollowerFeedPort, LoadFollowerFeedInput } from '@/src/use-cases/follower';

const demoFeedVideos: FollowerFeedVideo[] = [
  {
    id: 'feed-video-1',
    title: 'Launch demo',
    creatorName: 'Creator Studio',
    durationLabel: '00:42',
  },
  {
    id: 'feed-video-2',
    title: 'Behind the scenes',
    creatorName: 'Mobile Team',
    durationLabel: '01:18',
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
