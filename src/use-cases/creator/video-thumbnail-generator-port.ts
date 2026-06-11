import type { SelectedVideo, VideoThumbnailSource } from '@/src/domain/creator';

export type GenerateVideoThumbnailInput = {
  video: SelectedVideo;
  timeSeconds: number;
};

export type VideoThumbnailGeneratorPort = {
  generateThumbnail(input: GenerateVideoThumbnailInput): Promise<VideoThumbnailSource | null>;
};
