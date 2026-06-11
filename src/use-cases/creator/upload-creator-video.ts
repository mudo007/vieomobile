import type {
  CreatorUploadEvent,
  CreatorUploadState,
  SelectedVideo,
  VideoThumbnailSource,
} from '@/src/domain/creator';
import { describeMediaSource, logMediaDebug } from '@/src/diagnostics/media-debug-log';
import type { UploadedVideoRepositoryPort } from './uploaded-video-repository-port';
import type { VideoThumbnailGeneratorPort } from './video-thumbnail-generator-port';
import type { VideoUploaderPort } from './video-uploader-port';

type UploadCreatorVideoPorts = {
  videoUploader: VideoUploaderPort;
  uploadedVideos?: UploadedVideoRepositoryPort;
  videoThumbnailGenerator?: VideoThumbnailGeneratorPort;
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
      const thumbnailSource = await generateThumbnailSource(state, ports.videoThumbnailGenerator);
      const video = thumbnailSource
        ? addThumbnailToSelectedVideo(state.video, thumbnailSource)
        : state.video;

      uploadedVideo = await ports.uploadedVideos.saveUploadedVideo({
        uploadedVideo,
        video,
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

async function generateThumbnailSource(
  state: CreatorUploadState,
  videoThumbnailGenerator: VideoThumbnailGeneratorPort | undefined
): Promise<VideoThumbnailSource | null> {
  if (state.status !== 'uploading' || !videoThumbnailGenerator) {
    logMediaDebug('thumbnail generation skipped', {
      state: state.status,
      hasGenerator: Boolean(videoThumbnailGenerator),
    });

    return null;
  }

  try {
    const thumbnailSource = await videoThumbnailGenerator.generateThumbnail({
      video: state.video,
      timeSeconds: 1,
    });

    logMediaDebug('thumbnail generation returned to use case', {
      thumbnail: describeMediaSource(thumbnailSource),
    });

    return thumbnailSource;
  } catch {
    logMediaDebug('thumbnail generation failed; upload will continue without thumbnail');
    return null;
  }
}

function addThumbnailToSelectedVideo(
  video: SelectedVideo,
  thumbnailSource: VideoThumbnailSource
): SelectedVideo {
  return {
    ...video,
    thumbnailSource,
    ...(typeof thumbnailSource === 'string' ? { thumbnailUri: thumbnailSource } : {}),
  };
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
