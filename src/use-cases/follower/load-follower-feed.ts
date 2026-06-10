import type { FollowerFeedEvent, FollowerFeedState } from '@/src/domain/follower';
import type { FollowerFeedPort } from './follower-feed-port';

type LoadFollowerFeedPorts = {
  feedPort: FollowerFeedPort;
};

export async function loadFollowerFeed(
  state: FollowerFeedState,
  ports: LoadFollowerFeedPorts,
  signal: AbortSignal
): Promise<FollowerFeedEvent | null> {
  if (state.status !== 'loading' && state.status !== 'refreshing') {
    return null;
  }

  try {
    const videos = await ports.feedPort.loadFollowerFeed({
      reason: state.status === 'refreshing' ? 'refresh' : 'initial',
      signal,
    });

    if (signal.aborted) {
      return null;
    }

    return {
      type: 'feedLoaded',
      videos,
    };
  } catch (error) {
    if (signal.aborted || isAbortError(error)) {
      return null;
    }

    return {
      type: 'feedLoadFailed',
      message: getFeedFailureMessage(error),
    };
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function getFeedFailureMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return 'Unexpected follower feed failure.';
}
