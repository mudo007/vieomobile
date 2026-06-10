import type { CreatorUploadEvent, CreatorUploadState } from './creator-upload-types';

export const initialCreatorUploadState: CreatorUploadState = {
  status: 'idle',
};

export function reduceCreatorUpload(
  state: CreatorUploadState,
  event: CreatorUploadEvent
): CreatorUploadState {
  if (event.type === 'unexpectedFailure') {
    return {
      status: 'failed',
      failure: {
        type: 'unexpected',
        message: event.message,
      },
    };
  }

  switch (state.status) {
    case 'idle':
      if (event.type === 'startPicking') {
        return { status: 'picking' };
      }

      return state;

    case 'picking':
      if (event.type === 'cancelPicking') {
        return { status: 'idle' };
      }

      if (event.type === 'selectVideo') {
        return {
          status: 'editing',
          video: event.video,
          title: '',
        };
      }

      if (event.type === 'mediaPermissionDenied') {
        return {
          status: 'failed',
          failure: {
            type: 'mediaPermissionDenied',
            message: event.message,
          },
        };
      }

      if (event.type === 'rejectUnsupportedVideo') {
        return {
          status: 'failed',
          failure: {
            type: 'unsupportedVideo',
            message: event.message,
            video: event.video,
          },
        };
      }

      return state;

    case 'editing':
      if (event.type === 'changeTitle') {
        return {
          status: 'editing',
          video: state.video,
          title: event.title,
        };
      }

      if (event.type === 'confirmUpload') {
        const title = state.title.trim();

        if (title.length === 0) {
          return {
            ...state,
            titleError: {
              type: 'missingTitle',
              message: 'Title is required.',
            },
          };
        }

        return {
          status: 'uploading',
          video: state.video,
          title: state.title,
          progress: 0,
        };
      }

      return state;

    case 'uploading':
      if (event.type === 'uploadProgressed') {
        return {
          ...state,
          progress: clampProgress(event.progress),
        };
      }

      if (event.type === 'uploadSucceeded') {
        return {
          status: 'uploaded',
          uploadedVideo: event.uploadedVideo,
        };
      }

      if (event.type === 'uploadFailed') {
        return {
          status: 'failed',
          failure: {
            type: 'uploadFailed',
            message: event.message,
          },
        };
      }

      return state;

    case 'uploaded':
      if (event.type === 'reset') {
        return { status: 'idle' };
      }

      return state;

    case 'failed':
      if (event.type === 'reset') {
        return { status: 'idle' };
      }

      return state;
  }
}

function clampProgress(progress: number): number {
  return Math.min(1, Math.max(0, progress));
}
