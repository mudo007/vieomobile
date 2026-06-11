import { createInMemoryFollowerFeed } from './in-memory-follower-feed';
import { createInMemoryUploadedVideoRepository } from './in-memory-uploaded-video-repository';

export const localUploadedVideos = createInMemoryUploadedVideoRepository();

export const localFollowerFeed = createInMemoryFollowerFeed(localUploadedVideos);
