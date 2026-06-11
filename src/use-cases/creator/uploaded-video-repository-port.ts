import type { SelectedVideo, UploadedVideo } from '@/src/domain/creator';

export type SaveUploadedVideoInput = {
  uploadedVideo: UploadedVideo;
  video: SelectedVideo;
  title: string;
  description: string;
};

export type UploadedVideoRepositoryPort = {
  hasUploadedVideo(video: SelectedVideo): Promise<boolean>;
  saveUploadedVideo(input: SaveUploadedVideoInput): Promise<UploadedVideo>;
};
