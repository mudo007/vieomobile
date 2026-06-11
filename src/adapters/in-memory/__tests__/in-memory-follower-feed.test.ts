import type { SelectedVideo, UploadedVideo } from '@/src/domain/creator';
import { createInMemoryFollowerFeed, createInMemoryUploadedVideoRepository } from '@/src/adapters/in-memory';

const selectedVideo: SelectedVideo = {
  uri: 'file:///creator/launch-demo.mov',
  assetId: 'asset-launch-demo',
  fileName: 'launch-demo.mov',
  mimeType: 'video/quicktime',
  durationMs: 12_000,
  sizeBytes: 42_000_000,
  thumbnailUri: 'file:///thumbnails/launch-demo.jpg',
};

const uploadedVideo: UploadedVideo = {
  id: 'uploaded-video-1',
  title: 'Launch demo',
  sourceUri: selectedVideo.uri,
};

describe('InMemoryFollowerFeed', () => {
  it('returns an empty feed when no creator videos were uploaded', async () => {
    // Given
    const uploadedVideos = createInMemoryUploadedVideoRepository();
    const feed = createInMemoryFollowerFeed(uploadedVideos);
    const controller = new AbortController();

    // When / Then
    await expect(
      feed.loadFollowerFeed({ reason: 'initial', signal: controller.signal })
    ).resolves.toEqual([]);
  });

  it('maps uploaded creator videos into follower feed cards', async () => {
    // Given
    const uploadedVideos = createInMemoryUploadedVideoRepository();
    await uploadedVideos.saveUploadedVideo({
      uploadedVideo,
      video: selectedVideo,
      title: 'Launch demo',
      description: 'A quick launch walkthrough.',
    });
    const feed = createInMemoryFollowerFeed(uploadedVideos);
    const controller = new AbortController();

    // When
    const videos = await feed.loadFollowerFeed({ reason: 'initial', signal: controller.signal });

    // Then
    expect(videos).toEqual([
      {
        id: 'uploaded-video-1',
        title: 'Launch demo',
        sourceUri: 'file:///creator/launch-demo.mov',
        creatorName: 'You',
        durationLabel: '00:12',
        description: 'A quick launch walkthrough.',
        imageUri: 'file:///thumbnails/launch-demo.jpg',
        likeCount: 0,
        commentCount: 0,
        publishedAgo: 'Just now',
      },
    ]);
  });
});
