import type { CreatorUploadEvent, CreatorUploadState } from '@/src/domain/creator';
import type { VideoPickerPort } from './video-picker-port';

type PickCreatorVideoPorts = {
  videoPicker: VideoPickerPort;
};

export async function pickCreatorVideo(
  state: CreatorUploadState,
  ports: PickCreatorVideoPorts
): Promise<CreatorUploadEvent | null> {
  void state;
  void ports;

  throw new Error('pickCreatorVideo not implemented');
}
