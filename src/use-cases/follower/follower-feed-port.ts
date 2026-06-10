import type { FollowerFeedVideo } from '@/src/domain/follower';

export type LoadFollowerFeedInput = {
  reason: 'initial' | 'refresh';
  signal: AbortSignal;
};

export type FollowerFeedPort = {
  loadFollowerFeed(input: LoadFollowerFeedInput): Promise<FollowerFeedVideo[]>;
};
