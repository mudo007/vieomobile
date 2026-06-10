import {
  createFakeVideoPicker,
  createThrowingFakeVideoPicker,
} from '@/src/adapters/fake';
import { pickCreatorVideo } from '@/src/use-cases/creator';
import type { CreatorUploadState, SelectedVideo } from '@/src/domain/creator';

const selectedVideo: SelectedVideo = {
  uri: 'file:///creator/video.mov',
  fileName: 'video.mov',
  mimeType: 'video/quicktime',
};

describe('pickCreatorVideo', () => {
  it('does not call the picker when the upload flow is not picking', async () => {
    const idleState: CreatorUploadState = { status: 'idle' };
    const videoPicker = createFakeVideoPicker({ type: 'videoSelected', video: selectedVideo });

    await expect(pickCreatorVideo(idleState, { videoPicker })).resolves.toBeNull();
    expect(videoPicker.pickVideoCallCount).toBe(0);
  });

  it('returns a cancel event when the picker is cancelled', async () => {
    const videoPicker = createFakeVideoPicker({ type: 'cancelled' });

    await expect(pickCreatorVideo({ status: 'picking' }, { videoPicker })).resolves.toEqual({
      type: 'cancelPicking',
    });
    expect(videoPicker.pickVideoCallCount).toBe(1);
  });

  it('returns a permission denied event when media access is denied', async () => {
    const videoPicker = createFakeVideoPicker({
      type: 'permissionDenied',
      message: 'Media library access is required.',
    });

    await expect(pickCreatorVideo({ status: 'picking' }, { videoPicker })).resolves.toEqual({
      type: 'mediaPermissionDenied',
      message: 'Media library access is required.',
    });
  });

  it('returns an unsupported video event when the picked video is not usable', async () => {
    const videoPicker = createFakeVideoPicker({
      type: 'unsupportedVideo',
      message: 'Only local video files are supported.',
      video: selectedVideo,
    });

    await expect(pickCreatorVideo({ status: 'picking' }, { videoPicker })).resolves.toEqual({
      type: 'unsupportedVideoPicked',
      message: 'Only local video files are supported.',
      video: selectedVideo,
    });
  });

  it('returns a video selected event when the picker returns a valid video', async () => {
    const videoPicker = createFakeVideoPicker({ type: 'videoSelected', video: selectedVideo });

    await expect(pickCreatorVideo({ status: 'picking' }, { videoPicker })).resolves.toEqual({
      type: 'videoSelected',
      video: selectedVideo,
    });
  });

  it('returns an unexpected failure event when the picker throws an Error', async () => {
    const videoPicker = createThrowingFakeVideoPicker(new Error('Native picker crashed.'));

    await expect(pickCreatorVideo({ status: 'picking' }, { videoPicker })).resolves.toEqual({
      type: 'unexpectedFailure',
      message: 'Native picker crashed.',
    });
  });

  it('returns a generic unexpected failure event when the picker throws a non-Error value', async () => {
    const videoPicker = createThrowingFakeVideoPicker('boom');

    await expect(pickCreatorVideo({ status: 'picking' }, { videoPicker })).resolves.toEqual({
      type: 'unexpectedFailure',
      message: 'Unexpected video picker failure.',
    });
  });
});
