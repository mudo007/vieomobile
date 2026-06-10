import type { SelectedVideo, UploadedVideo } from '@/src/domain/creator';

export type UploadCreatorVideoInput = {
  video: SelectedVideo;
  title: string;
  signal: AbortSignal;
  onProgress: (progress: number) => void;
};

export type VideoUploaderPort = {
  uploadCreatorVideo(input: UploadCreatorVideoInput): Promise<UploadedVideo>;
};
