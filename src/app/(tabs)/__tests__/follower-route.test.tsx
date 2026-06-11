import { act, fireEvent, render } from '@testing-library/react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { localUploadedVideos } from '@/src/adapters/in-memory';
import type { SelectedVideo, UploadedVideo } from '@/src/domain/creator';
import FollowerRoute from '@/src/app/(tabs)/follower';

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useRouter: jest.fn(),
}));

const replace = jest.fn();
const focusEffects: (() => void | (() => void))[] = [];

const selectedVideo: SelectedVideo = {
  uri: 'file:///creator/follower-route-video.mov',
  assetId: 'follower-route-video',
  fileName: 'follower-route-video.mov',
  mimeType: 'video/quicktime',
};

const uploadedVideo: UploadedVideo = {
  id: 'follower-route-video',
  title: 'Route video',
  sourceUri: selectedVideo.uri,
};

describe('<FollowerRoute />', () => {
  beforeEach(() => {
    replace.mockClear();
    focusEffects.length = 0;
    localUploadedVideos.clear();

    jest.mocked(useRouter).mockReturnValue({ replace } as never);
    jest.mocked(useFocusEffect).mockImplementation((effect) => {
      focusEffects.push(effect as () => void | (() => void));
    });
  });

  it('returns home when the follower exits the feed', async () => {
    // Given
    const { getByText } = await render(<FollowerRoute />);

    // When
    await fireEvent.press(getByText('Back home'));

    // Then
    expect(replace).toHaveBeenCalledWith('/');
  });

  it('closes inline playback when the route loses focus', async () => {
    // Given
    await localUploadedVideos.saveUploadedVideo({
      uploadedVideo,
      video: selectedVideo,
      title: uploadedVideo.title,
      description: 'Route playback cleanup.',
    });
    const { findByLabelText, findByText, getByText, queryByLabelText } = await render(
      <FollowerRoute />
    );
    await findByText('Route video');
    await fireEvent.press(getByText('Route video'));
    await findByLabelText('Inline player for Route video');

    // When
    await act(async () => {
      const cleanup = focusEffects.at(-1)?.();
      cleanup?.();
    });

    // Then
    expect(queryByLabelText('Inline player for Route video')).toBeNull();
  });
});
