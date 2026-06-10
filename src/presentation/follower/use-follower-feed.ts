import { useEffect } from 'react';

import type { FollowerFeedEvent, FollowerFeedState } from '@/src/domain/follower';
import { loadFollowerFeed, type FollowerFeedPort } from '@/src/use-cases/follower';

type UseFollowerFeedParams = {
  state: FollowerFeedState;
  feedPort: FollowerFeedPort;
  dispatch: (event: FollowerFeedEvent) => void;
};

export function useFollowerFeed({ state, feedPort, dispatch }: UseFollowerFeedParams) {
  useEffect(() => {
    if (state.status !== 'loading' && state.status !== 'refreshing') {
      return undefined;
    }

    const controller = new AbortController();
    let isActive = true;

    void loadFollowerFeed(state, { feedPort }, controller.signal).then((event) => {
      if (isActive && event) {
        dispatch(event);
      }
    });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [dispatch, feedPort, state]);
}
