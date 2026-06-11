import type { CreatorUploadEvent, CreatorUploadState } from '@/src/domain/creator';
import type { UploadedVideoRepositoryPort } from './uploaded-video-repository-port';
import type { VideoUploaderPort } from './video-uploader-port';

type UploadCreatorVideoPorts = {
  videoUploader: VideoUploaderPort;
  uploadedVideos?: UploadedVideoRepositoryPort;
  onProgressEvent: (event: CreatorUploadEvent) => void;
};

export async function uploadCreatorVideo(
  state: CreatorUploadState,
  ports: UploadCreatorVideoPorts,
  signal: AbortSignal
): Promise<CreatorUploadEvent | null> {
  if (state.status !== 'uploading') {
    return null;
  }

  try {
    let uploadedVideo = await ports.videoUploader.uploadCreatorVideo({
      video: state.video,
      title: state.title,
      signal,
      onProgress: (progress) => {
        if (!signal.aborted) {
          ports.onProgressEvent({ type: 'uploadProgressed', progress });
        }
      },
    });

    if (signal.aborted) {
      return null;
    }

    if (ports.uploadedVideos) {
      uploadedVideo = await ports.uploadedVideos.saveUploadedVideo({
        uploadedVideo,
        video: state.video,
        title: state.title,
        description: state.description,
      });
    }

    return {
      type: 'uploadSucceeded',
      uploadedVideo,
    };
  } catch (error) {
    if (signal.aborted || isAbortError(error)) {
      return null;
    }

    return {
      type: 'uploadFailed',
      message: getUploadFailureMessage(error),
    };
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function getUploadFailureMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return 'Unexpected video upload failure.';
}
