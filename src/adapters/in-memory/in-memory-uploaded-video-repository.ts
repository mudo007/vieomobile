import type { SelectedVideo, UploadedVideo } from '@/src/domain/creator';
import type {
  SaveUploadedVideoInput,
  UploadedVideoRepositoryPort,
} from '@/src/use-cases/creator';

export class InMemoryUploadedVideoRepository implements UploadedVideoRepositoryPort {
  private readonly uploadedVideos: UploadedVideo[] = [];
  private readonly duplicateKeys = new Set<string>();

  async hasUploadedVideo(video: SelectedVideo): Promise<boolean> {
    return this.duplicateKeys.has(createVideoDuplicateKey(video));
  }

  async saveUploadedVideo(input: SaveUploadedVideoInput): Promise<UploadedVideo> {
    const uploadedVideo: UploadedVideo = {
      ...input.uploadedVideo,
      title: input.title,
      sourceUri: input.video.uri,
      description: input.description,
      assetId: input.video.assetId,
      fileName: input.video.fileName,
      mimeType: input.video.mimeType,
      durationMs: input.video.durationMs,
      sizeBytes: input.video.sizeBytes,
    };

    this.uploadedVideos.unshift(uploadedVideo);
    this.duplicateKeys.add(createVideoDuplicateKey(input.video));

    return uploadedVideo;
  }

  async listUploadedVideos(): Promise<UploadedVideo[]> {
    return [...this.uploadedVideos];
  }

  clear(): void {
    this.uploadedVideos.length = 0;
    this.duplicateKeys.clear();
  }
}

export function createInMemoryUploadedVideoRepository(): InMemoryUploadedVideoRepository {
  return new InMemoryUploadedVideoRepository();
}

export function createVideoDuplicateKey(video: SelectedVideo): string {
  if (video.assetId && video.assetId.length > 0) {
    return `asset:${video.assetId}`;
  }

  return [
    'fallback',
    video.uri,
    video.fileName ?? '',
    video.sizeBytes?.toString() ?? '',
    video.durationMs?.toString() ?? '',
  ].join(':');
}
