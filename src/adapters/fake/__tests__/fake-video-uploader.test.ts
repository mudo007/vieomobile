import type { SelectedVideo } from '@/src/domain/creator';
import { createFakeVideoUploader } from '@/src/adapters/fake';

const selectedVideo: SelectedVideo = {
  uri: 'file:///creator/video.mov',
  fileName: 'video.mov',
  mimeType: 'video/quicktime',
};

describe('FakeVideoUploader', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('emits configured progress steps before resolving the uploaded video', async () => {
    // Given
    const onProgress = jest.fn();
    const controller = new AbortController();
    const uploader = createFakeVideoUploader({
      progressSteps: [
        { delayMs: 100, progress: 0.5 },
        { delayMs: 100, progress: 1 },
      ],
    });

    // When
    const uploadPromise = uploader.uploadCreatorVideo({
      video: selectedVideo,
      title: 'Launch demo',
      signal: controller.signal,
      onProgress,
    });
    await jest.advanceTimersByTimeAsync(100);

    // Then
    expect(onProgress).toHaveBeenCalledWith(0.5);

    // When
    await jest.advanceTimersByTimeAsync(100);

    // Then
    await expect(uploadPromise).resolves.toEqual({
      id: expect.any(String),
      title: 'Launch demo',
      sourceUri: selectedVideo.uri,
    });
    expect(onProgress).toHaveBeenCalledWith(1);
  });

  it('rejects when the upload is aborted', async () => {
    // Given
    const controller = new AbortController();
    const uploader = createFakeVideoUploader({
      progressSteps: [{ delayMs: 100, progress: 1 }],
    });

    // When
    const uploadPromise = uploader.uploadCreatorVideo({
      video: selectedVideo,
      title: 'Launch demo',
      signal: controller.signal,
      onProgress: jest.fn(),
    });
    controller.abort();

    // Then
    await expect(uploadPromise).rejects.toThrow('Upload aborted.');
  });
});
