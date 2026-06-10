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
      expect(initialCreatorUploadState).toEqual({ status: 'idle' });
    });

    it('moves to picking when the creator starts picking a video', () => {
      expect(reduceCreatorUpload({ status: 'idle' }, { type: 'startPicking' })).toEqual({
        status: 'picking',
      });
    });

    it('ignores upload success before an upload has started', () => {
      const idleState: CreatorUploadState = { status: 'idle' };

      expect(
        reduceCreatorUpload(idleState, { type: 'uploadSucceeded', uploadedVideo })
      ).toEqual(idleState);
    });
  });

  describe('picking state', () => {
    it('returns to idle when picking is cancelled', () => {
      expect(reduceCreatorUpload({ status: 'picking' }, { type: 'cancelPicking' })).toEqual({
        status: 'idle',
      });
    });

    it('moves to editing when a video is selected', () => {
      expect(
        reduceCreatorUpload({ status: 'picking' }, { type: 'selectVideo', video: selectedVideo })
      ).toEqual({
        status: 'editing',
        video: selectedVideo,
        title: '',
      });
    });

    it('moves to failed when media permission is denied', () => {
      expect(
        reduceCreatorUpload(
          { status: 'picking' },
          { type: 'mediaPermissionDenied', message: 'Media library access is required.' }
        )
      ).toEqual({
        status: 'failed',
        failure: {
          type: 'mediaPermissionDenied',
          message: 'Media library access is required.',
        },
      });
    });

    it('moves to failed when the selected video is unsupported', () => {
      expect(
        reduceCreatorUpload(
          { status: 'picking' },
          {
            type: 'rejectUnsupportedVideo',
            message: 'Only local video files are supported.',
            video: selectedVideo,
          }
        )
      ).toEqual({
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
      expect(
        reduceCreatorUpload(editingState, { type: 'changeTitle', title: 'Launch demo' })
      ).toEqual({
        status: 'editing',
        video: selectedVideo,
        title: 'Launch demo',
      });
    });

    it('keeps editing and records a validation failure when title is empty', () => {
      expect(reduceCreatorUpload(editingState, { type: 'confirmUpload' })).toEqual({
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
      expect(
        reduceCreatorUpload(
          { status: 'editing', video: selectedVideo, title: 'Launch demo' },
          { type: 'confirmUpload' }
        )
      ).toEqual({
        status: 'uploading',
        video: selectedVideo,
        title: 'Launch demo',
        progress: 0,
      });
    });

    it('ignores upload progress before upload starts', () => {
      expect(
        reduceCreatorUpload(editingState, { type: 'uploadProgressed', progress: 0.5 })
      ).toEqual(editingState);
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
      expect(
        reduceCreatorUpload(uploadingState, { type: 'uploadProgressed', progress: 0.5 })
      ).toEqual({
        ...uploadingState,
        progress: 0.5,
      });
    });

    it('clamps upload progress to 1 when progress is too high', () => {
      expect(
        reduceCreatorUpload(uploadingState, { type: 'uploadProgressed', progress: 1.4 })
      ).toEqual({
        ...uploadingState,
        progress: 1,
      });
    });

    it('moves to uploaded when upload succeeds', () => {
      expect(
        reduceCreatorUpload(uploadingState, { type: 'uploadSucceeded', uploadedVideo })
      ).toEqual({
        status: 'uploaded',
        uploadedVideo,
      });
    });

    it('moves to failed when upload fails', () => {
      expect(
        reduceCreatorUpload(uploadingState, {
          type: 'uploadFailed',
          message: 'Network request failed.',
        })
      ).toEqual({
        status: 'failed',
        failure: {
          type: 'uploadFailed',
          message: 'Network request failed.',
        },
      });
    });
  });

  describe('uploaded state', () => {
    it('resets to idle', () => {
      expect(
        reduceCreatorUpload({ status: 'uploaded', uploadedVideo }, { type: 'reset' })
      ).toEqual({
        status: 'idle',
      });
    });

    it('ignores title changes after upload is complete', () => {
      const uploadedState: CreatorUploadState = { status: 'uploaded', uploadedVideo };

      expect(
        reduceCreatorUpload(uploadedState, { type: 'changeTitle', title: 'Ignored' })
      ).toEqual(uploadedState);
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
      expect(reduceCreatorUpload(failedState, { type: 'reset' })).toEqual({
        status: 'idle',
      });
    });

    it('ignores upload progress after a failure', () => {
      expect(
        reduceCreatorUpload(failedState, { type: 'uploadProgressed', progress: 0.75 })
      ).toEqual(failedState);
    });
  });
});
