import type { CreatorUploadState, SelectedVideo, UploadedVideo } from '@/src/domain/creator';
import {
  uploadCreatorVideo,
  type VideoThumbnailGeneratorPort,
  type VideoUploaderPort,
} from '@/src/use-cases/creator';

const selectedVideo: SelectedVideo = {
  uri: 'file:///creator/video.mov',
  assetId: 'asset-video-1',
  fileName: 'video.mov',
  mimeType: 'video/quicktime',
};

const uploadingState: CreatorUploadState = {
  status: 'uploading',
  video: selectedVideo,
  title: 'Launch demo',
  description: 'A quick launch walkthrough.',
  progress: 0,
};

const uploadedVideo: UploadedVideo = {
  id: 'video-1',
  title: uploadingState.title,
  sourceUri: selectedVideo.uri,
};

function createSuccessfulUploader(progressValues: number[]): VideoUploaderPort {
  return {
    uploadCreatorVideo: jest.fn(async ({ onProgress }) => {
      progressValues.forEach(onProgress);
      return uploadedVideo;
    }),
  };
}

function createThrowingUploader(error: unknown): VideoUploaderPort {
  return {
    uploadCreatorVideo: jest.fn().mockRejectedValue(error),
  };
}

function createThumbnailGenerator(thumbnailUri: string | null): VideoThumbnailGeneratorPort {
  return {
    generateThumbnail: jest.fn().mockResolvedValue(thumbnailUri),
  };
}

describe('uploadCreatorVideo', () => {
  it('does not call the uploader when the creator flow is not uploading', async () => {
    // Given
    const idleState: CreatorUploadState = { status: 'idle' };
    const controller = new AbortController();
    const videoUploader = createSuccessfulUploader([0.5]);
    const onProgressEvent = jest.fn();

    // When
    const event = await uploadCreatorVideo(
      idleState,
      { videoUploader, onProgressEvent },
      controller.signal
    );

    // Then
    expect(event).toBeNull();
    expect(videoUploader.uploadCreatorVideo).not.toHaveBeenCalled();
    expect(onProgressEvent).not.toHaveBeenCalled();
  });

  it('maps uploader progress and success into domain events', async () => {
    // Given
    const controller = new AbortController();
    const videoUploader = createSuccessfulUploader([0.25, 0.75, 1]);
    const onProgressEvent = jest.fn();

    // When
    const event = await uploadCreatorVideo(
      uploadingState,
      { videoUploader, onProgressEvent },
      controller.signal
    );

    // Then
    expect(onProgressEvent).toHaveBeenNthCalledWith(1, {
      type: 'uploadProgressed',
      progress: 0.25,
    });
    expect(onProgressEvent).toHaveBeenNthCalledWith(2, {
      type: 'uploadProgressed',
      progress: 0.75,
    });
    expect(onProgressEvent).toHaveBeenNthCalledWith(3, {
      type: 'uploadProgressed',
      progress: 1,
    });
    expect(event).toEqual({
      type: 'uploadSucceeded',
      uploadedVideo,
    });
    expect(videoUploader.uploadCreatorVideo).toHaveBeenCalledWith({
      video: selectedVideo,
      title: 'Launch demo',
      signal: controller.signal,
      onProgress: expect.any(Function),
    });
  });

  it('stores uploaded video metadata when a repository is provided', async () => {
    // Given
    const controller = new AbortController();
    const videoUploader = createSuccessfulUploader([1]);
    const savedUploadedVideo: UploadedVideo = {
      ...uploadedVideo,
      description: uploadingState.description,
      assetId: selectedVideo.assetId,
      fileName: selectedVideo.fileName,
      mimeType: selectedVideo.mimeType,
    };
    const uploadedVideos = {
      hasUploadedVideo: jest.fn(),
      saveUploadedVideo: jest.fn().mockResolvedValue(savedUploadedVideo),
    };
    const onProgressEvent = jest.fn();

    // When
    const event = await uploadCreatorVideo(
      uploadingState,
      { videoUploader, uploadedVideos, onProgressEvent },
      controller.signal
    );

    // Then
    expect(uploadedVideos.saveUploadedVideo).toHaveBeenCalledWith({
      uploadedVideo,
      video: selectedVideo,
      title: uploadingState.title,
      description: uploadingState.description,
    });
    expect(event).toEqual({
      type: 'uploadSucceeded',
      uploadedVideo: savedUploadedVideo,
    });
  });

  it('generates and stores a thumbnail when a thumbnail generator is provided', async () => {
    // Given
    const controller = new AbortController();
    const videoUploader = createSuccessfulUploader([1]);
    const videoThumbnailGenerator = createThumbnailGenerator('file:///thumbnails/video-1.jpg');
    const savedUploadedVideo: UploadedVideo = {
      ...uploadedVideo,
      description: uploadingState.description,
      assetId: selectedVideo.assetId,
      fileName: selectedVideo.fileName,
      mimeType: selectedVideo.mimeType,
      thumbnailUri: 'file:///thumbnails/video-1.jpg',
    };
    const uploadedVideos = {
      hasUploadedVideo: jest.fn(),
      saveUploadedVideo: jest.fn().mockResolvedValue(savedUploadedVideo),
    };
    const onProgressEvent = jest.fn();

    // When
    const event = await uploadCreatorVideo(
      uploadingState,
      { videoUploader, uploadedVideos, videoThumbnailGenerator, onProgressEvent },
      controller.signal
    );

    // Then
    expect(videoThumbnailGenerator.generateThumbnail).toHaveBeenCalledWith({
      video: selectedVideo,
      timeSeconds: 1,
    });
    expect(uploadedVideos.saveUploadedVideo).toHaveBeenCalledWith({
      uploadedVideo,
      video: {
        ...selectedVideo,
        thumbnailUri: 'file:///thumbnails/video-1.jpg',
        thumbnailSource: 'file:///thumbnails/video-1.jpg',
      },
      title: uploadingState.title,
      description: uploadingState.description,
    });
    expect(event).toEqual({
      type: 'uploadSucceeded',
      uploadedVideo: savedUploadedVideo,
    });
  });

  it('maps uploader failures into upload failure events', async () => {
    // Given
    const controller = new AbortController();
    const videoUploader = createThrowingUploader(new Error('Upload service unavailable.'));
    const onProgressEvent = jest.fn();

    // When
    const event = await uploadCreatorVideo(
      uploadingState,
      { videoUploader, onProgressEvent },
      controller.signal
    );

    // Then
    expect(event).toEqual({
      type: 'uploadFailed',
      message: 'Upload service unavailable.',
    });
  });

  it('ignores aborted uploads instead of turning them into failures', async () => {
    // Given
    const controller = new AbortController();
    const videoUploader = createThrowingUploader(createAbortError());
    const onProgressEvent = jest.fn();

    // When
    controller.abort();
    const event = await uploadCreatorVideo(
      uploadingState,
      { videoUploader, onProgressEvent },
      controller.signal
    );

    // Then
    expect(event).toBeNull();
  });
});

function createAbortError(): Error {
  const error = new Error('Upload aborted.');
  error.name = 'AbortError';

  return error;
}
