import {
  initialCreatorUploadState,
  reduceCreatorUpload,
  type CreatorUploadState,
  type SelectedVideo,
  type UploadedVideo,
} from '@/src/domain/creator';

const selectedVideo: SelectedVideo = {
  uri: 'file:///creator/video.mov',
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

describe('creator upload reducer', () => {
  describe('idle state', () => {
    it('starts in idle', () => {
      // Given / When / Then
      expect(initialCreatorUploadState).toEqual({ status: 'idle' });
    });

    it('moves to picking when the creator starts picking a video', () => {
      // Given
      const state: CreatorUploadState = { status: 'idle' };

      // When
      const nextState = reduceCreatorUpload(state, { type: 'startPicking' });

      // Then
      expect(nextState).toEqual({
        status: 'picking',
      });
    });

    it('ignores upload success before an upload has started', () => {
      // Given
      const idleState: CreatorUploadState = { status: 'idle' };

      // When
      const nextState = reduceCreatorUpload(idleState, { type: 'uploadSucceeded', uploadedVideo });

      // Then
      expect(nextState).toEqual(idleState);
    });
  });

  describe('picking state', () => {
    it('returns to idle when picking is cancelled', () => {
      // Given
      const state: CreatorUploadState = { status: 'picking' };

      // When
      const nextState = reduceCreatorUpload(state, { type: 'cancelPicking' });

      // Then
      expect(nextState).toEqual({
        status: 'idle',
      });
    });

    it('moves to editing when a video is selected', () => {
      // Given
      const state: CreatorUploadState = { status: 'picking' };

      // When
      const nextState = reduceCreatorUpload(state, {
        type: 'videoSelected',
        video: selectedVideo,
      });

      // Then
      expect(nextState).toEqual({
        status: 'editing',
        video: selectedVideo,
        title: '',
      });
    });

    it('moves to failed when media permission is denied', () => {
      // Given
      const state: CreatorUploadState = { status: 'picking' };

      // When
      const nextState = reduceCreatorUpload(state, {
        type: 'mediaPermissionDenied',
        message: 'Media library access is required.',
      });

      // Then
      expect(nextState).toEqual({
        status: 'failed',
        failure: {
          type: 'mediaPermissionDenied',
          message: 'Media library access is required.',
        },
      });
    });

    it('moves to failed when the selected video is unsupported', () => {
      // Given
      const state: CreatorUploadState = { status: 'picking' };

      // When
      const nextState = reduceCreatorUpload(state, {
        type: 'unsupportedVideoPicked',
        message: 'Only local video files are supported.',
        video: selectedVideo,
      });

      // Then
      expect(nextState).toEqual({
        status: 'failed',
        failure: {
          type: 'unsupportedVideo',
          message: 'Only local video files are supported.',
          video: selectedVideo,
        },
      });
    });
  });

  describe('editing state', () => {
    const editingState: CreatorUploadState = {
      status: 'editing',
      video: selectedVideo,
      title: '',
    };

    it('updates the title while editing', () => {
      // Given
      const state = editingState;

      // When
      const nextState = reduceCreatorUpload(state, { type: 'changeTitle', title: 'Launch demo' });

      // Then
      expect(nextState).toEqual({
        status: 'editing',
        video: selectedVideo,
        title: 'Launch demo',
      });
    });

    it('keeps editing and records a validation failure when title is empty', () => {
      // Given
      const state = editingState;

      // When
      const nextState = reduceCreatorUpload(state, { type: 'confirmUpload' });

      // Then
      expect(nextState).toEqual({
        status: 'editing',
        video: selectedVideo,
        title: '',
        titleError: {
          type: 'missingTitle',
          message: 'Title is required.',
        },
      });
    });

    it('moves to uploading when title is valid', () => {
      // Given
      const state: CreatorUploadState = {
        status: 'editing',
        video: selectedVideo,
        title: 'Launch demo',
      };

      // When
      const nextState = reduceCreatorUpload(state, { type: 'confirmUpload' });

      // Then
      expect(nextState).toEqual({
        status: 'uploading',
        video: selectedVideo,
        title: 'Launch demo',
        progress: 0,
      });
    });

    it('returns to picking when editing is cancelled', () => {
      // Given
      const state: CreatorUploadState = {
        status: 'editing',
        video: selectedVideo,
        title: 'Launch demo',
      };

      // When
      const nextState = reduceCreatorUpload(state, { type: 'cancelEditing' });

      // Then
      expect(nextState).toEqual({
        status: 'picking',
      });
    });

    it('ignores upload progress before upload starts', () => {
      // Given
      const state = editingState;

      // When
      const nextState = reduceCreatorUpload(state, { type: 'uploadProgressed', progress: 0.5 });

      // Then
      expect(nextState).toEqual(editingState);
    });
  });

  describe('uploading state', () => {
    const uploadingState: CreatorUploadState = {
      status: 'uploading',
      video: selectedVideo,
      title: 'Launch demo',
      progress: 0,
    };

    it('updates upload progress', () => {
      // Given
      const state = uploadingState;

      // When
      const nextState = reduceCreatorUpload(state, { type: 'uploadProgressed', progress: 0.5 });

      // Then
      expect(nextState).toEqual({
        ...uploadingState,
        progress: 0.5,
      });
    });

    it('clamps upload progress to 1 when progress is too high', () => {
      // Given
      const state = uploadingState;

      // When
      const nextState = reduceCreatorUpload(state, { type: 'uploadProgressed', progress: 1.4 });

      // Then
      expect(nextState).toEqual({
        ...uploadingState,
        progress: 1,
      });
    });

    it('moves to uploaded when upload succeeds', () => {
      // Given
      const state = uploadingState;

      // When
      const nextState = reduceCreatorUpload(state, { type: 'uploadSucceeded', uploadedVideo });

      // Then
      expect(nextState).toEqual({
        status: 'uploaded',
        uploadedVideo,
      });
    });

    it('moves to failed when upload fails', () => {
      // Given
      const state = uploadingState;

      // When
      const nextState = reduceCreatorUpload(state, {
        type: 'uploadFailed',
        message: 'Network request failed.',
      });

      // Then
      expect(nextState).toEqual({
        status: 'failed',
        failure: {
          type: 'uploadFailed',
          message: 'Network request failed.',
        },
      });
    });

    it('returns to editing when upload is cancelled', () => {
      // Given
      const state = uploadingState;

      // When
      const nextState = reduceCreatorUpload(state, { type: 'cancelUpload' });

      // Then
      expect(nextState).toEqual({
        status: 'editing',
        video: selectedVideo,
        title: 'Launch demo',
      });
    });
  });

  describe('uploaded state', () => {
    it('resets to idle', () => {
      // Given
      const state: CreatorUploadState = { status: 'uploaded', uploadedVideo };

      // When
      const nextState = reduceCreatorUpload(state, { type: 'reset' });

      // Then
      expect(nextState).toEqual({
        status: 'idle',
      });
    });

    it('ignores title changes after upload is complete', () => {
      // Given
      const uploadedState: CreatorUploadState = { status: 'uploaded', uploadedVideo };

      // When
      const nextState = reduceCreatorUpload(uploadedState, {
        type: 'changeTitle',
        title: 'Ignored',
      });

      // Then
      expect(nextState).toEqual(uploadedState);
    });
  });

  describe('failed state', () => {
    const failedState: CreatorUploadState = {
      status: 'failed',
      failure: {
        type: 'uploadFailed',
        message: 'Network request failed.',
      },
    };

    it('resets to idle after a failure', () => {
      // Given
      const state = failedState;

      // When
      const nextState = reduceCreatorUpload(state, { type: 'reset' });

      // Then
      expect(nextState).toEqual({
        status: 'idle',
      });
    });

    it('ignores upload progress after a failure', () => {
      // Given
      const state = failedState;

      // When
      const nextState = reduceCreatorUpload(state, { type: 'uploadProgressed', progress: 0.75 });

      // Then
      expect(nextState).toEqual(failedState);
    });
  });
});
