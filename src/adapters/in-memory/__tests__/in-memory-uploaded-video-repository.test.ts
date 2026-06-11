import type { SelectedVideo, UploadedVideo } from '@/src/domain/creator';
import { createInMemoryUploadedVideoRepository } from '@/src/adapters/in-memory';

const selectedVideo: SelectedVideo = {
  uri: 'file:///creator/video.mov',
  assetId: 'asset-video-1',
  fileName: 'video.mov',
  mimeType: 'video/quicktime',
  durationMs: 12_000,
  sizeBytes: 42_000_000,
};

const uploadedVideo: UploadedVideo = {
  id: 'video-1',
  title: 'Launch demo',
  sourceUri: selectedVideo.uri,
};

describe('InMemoryUploadedVideoRepository', () => {
  it('stores uploaded metadata and detects future duplicates by asset id', async () => {
    // Given
    const repository = createInMemoryUploadedVideoRepository();

    // When
    const savedVideo = await repository.saveUploadedVideo({
      uploadedVideo,
      video: selectedVideo,
      title: 'Launch demo',
      description: 'A quick launch walkthrough.',
    });

    // Then
    await expect(repository.hasUploadedVideo(selectedVideo)).resolves.toBe(true);
    await expect(repository.listUploadedVideos()).resolves.toEqual([savedVideo]);
    expect(savedVideo).toEqual({
      ...uploadedVideo,
      description: 'A quick launch walkthrough.',
      assetId: 'asset-video-1',
      fileName: 'video.mov',
      mimeType: 'video/quicktime',
      durationMs: 12_000,
      sizeBytes: 42_000_000,
    });
  });

  it('uses uri and metadata as a fallback duplicate key when asset id is missing', async () => {
    // Given
    const repository = createInMemoryUploadedVideoRepository();
    const videoWithoutAssetId: SelectedVideo = {
      ...selectedVideo,
      assetId: undefined,
    };

    // When
    await repository.saveUploadedVideo({
      uploadedVideo,
      video: videoWithoutAssetId,
      title: 'Launch demo',
      description: '',
    });

    // Then
    await expect(repository.hasUploadedVideo(videoWithoutAssetId)).resolves.toBe(true);
  });
});
