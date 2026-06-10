import type { CreatorUploadEvent, CreatorUploadState } from '@/src/domain/creator';
import type { VideoPickerPort } from './video-picker-port';

type PickCreatorVideoPorts = {
  videoPicker: VideoPickerPort;
};

export async function pickCreatorVideo(
  state: CreatorUploadState,
  ports: PickCreatorVideoPorts
): Promise<CreatorUploadEvent | null> {
  if (state.status !== 'picking') {
    return null;
  }

  try {
    const result = await ports.videoPicker.pickVideo();

    switch (result.type) {
      case 'cancelled':
        return { type: 'cancelPicking' };

      case 'permissionDenied':
        return {
          type: 'mediaPermissionDenied',
          message: result.message,
        };

      case 'unsupportedVideo':
        return {
          type: 'unsupportedVideoPicked',
          message: result.message,
          video: result.video,
        };

      case 'videoSelected':
        return {
          type: 'videoSelected',
          video: result.video,
        };
    }
  } catch (error) {
    return {
      type: 'unexpectedFailure',
      message: getUnexpectedFailureMessage(error),
    };
  }
}

function getUnexpectedFailureMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return 'Unexpected video picker failure.';
}
