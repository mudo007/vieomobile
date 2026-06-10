import type { FollowerFeedEvent, FollowerFeedState } from './follower-feed-types';

export const initialFollowerFeedState: FollowerFeedState = {
  status: 'loading',
};

export function reduceFollowerFeed(
  state: FollowerFeedState,
  event: FollowerFeedEvent
): FollowerFeedState {
  if (event.type === 'refreshFeed') {
    if (state.status === 'ready' || state.status === 'refreshing') {
      return {
        status: 'refreshing',
        videos: state.videos,
      };
    }

    return { status: 'loading' };
  }

  if (event.type === 'videoSelected') {
    if (state.status !== 'ready' && state.status !== 'refreshing') {
      return state;
    }

    return {
      status: 'playing',
      video: event.video,
      videos: state.videos,
    };
  }

  if (event.type === 'closeVideo') {
    if (state.status !== 'playing') {
      return state;
    }

    return {
      status: 'ready',
      videos: state.videos,
    };
  }

  if (state.status !== 'loading' && state.status !== 'refreshing') {
    return state;
  }

  if (event.type === 'feedLoaded') {
    if (event.videos.length === 0) {
      return { status: 'empty' };
    }

    return {
      status: 'ready',
      videos: event.videos,
    };
  }

  if (event.type === 'feedLoadFailed') {
    return {
      status: 'failed',
      message: event.message,
    };
  }

  return state;
}
