import type { FollowerFeedVideo } from '@/src/domain/follower';
import { describeMediaSource, logMediaDebug } from '@/src/diagnostics/media-debug-log';
import type { FollowerFeedPort, LoadFollowerFeedInput } from '@/src/use-cases/follower';
import type { InMemoryUploadedVideoRepository } from './in-memory-uploaded-video-repository';
import type { UploadedVideo } from '@/src/domain/creator';

export class InMemoryFollowerFeed implements FollowerFeedPort {
  constructor(private readonly uploadedVideos: InMemoryUploadedVideoRepository) {}

  async loadFollowerFeed(input: LoadFollowerFeedInput): Promise<FollowerFeedVideo[]> {
    if (input.signal.aborted) {
      throw createAbortError();
    }

    const uploadedVideos = await this.uploadedVideos.listUploadedVideos();
    const videos = uploadedVideos.map((video) => ({
      id: video.id,
      title: video.title,
      creatorName: 'You',
      durationLabel: formatDuration(video.durationMs),
      description: video.description,
      ...mapThumbnailToFeedImage(video),
      likeCount: 0,
      commentCount: 0,
      publishedAgo: 'Just now',
    }));

    logMediaDebug('follower feed loaded from memory', {
      count: videos.length,
      thumbnails: videos.map((video) => ({
        id: video.id,
        title: video.title,
        imageUri: video.imageUri,
        imageSource: describeMediaSource(video.imageSource),
      })),
    });

    return videos;
  }
}

function mapThumbnailToFeedImage(
  video: UploadedVideo
): Pick<FollowerFeedVideo, 'imageUri' | 'imageSource'> {
  const imageUri =
    video.thumbnailUri ??
    (typeof video.thumbnailSource === 'string' ? video.thumbnailSource : undefined);
  const imageSource =
    video.thumbnailSource && typeof video.thumbnailSource !== 'string'
      ? video.thumbnailSource
      : undefined;

  return {
    ...(imageUri ? { imageUri } : {}),
    ...(imageSource ? { imageSource } : {}),
  };
}

export function createInMemoryFollowerFeed(
  uploadedVideos: InMemoryUploadedVideoRepository
): InMemoryFollowerFeed {
  return new InMemoryFollowerFeed(uploadedVideos);
}

function formatDuration(durationMs: number | undefined): string {
  if (!durationMs || durationMs <= 0) {
    return '00:00';
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function createAbortError(): Error {
  const error = new Error('Feed load aborted.');
  error.name = 'AbortError';

  return error;
}
