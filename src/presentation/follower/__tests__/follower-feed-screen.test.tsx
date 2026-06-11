import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useVideoPlayer } from 'expo-video';

import type { FollowerFeedVideo } from '@/src/domain/follower';
import { FollowerFeedScreen } from '@/src/presentation/follower';
import type { FollowerFeedPort } from '@/src/use-cases/follower';

const feedVideos: FollowerFeedVideo[] = [
  {
    id: 'video-1',
    title: 'Launch demo',
    sourceUri: 'file:///feed/launch-demo.mov',
    creatorName: 'Diogo',
    durationLabel: '00:42',
  },
];

const creatorUploadedVideos: FollowerFeedVideo[] = [
  {
    id: 'uploaded-video-1',
    title: 'Launch demo',
    sourceUri: 'file:///creator/launch-demo.mov',
    creatorName: 'You',
    durationLabel: '00:12',
    description: 'A quick launch walkthrough.',
    likeCount: 0,
    commentCount: 0,
    publishedAgo: 'Just now',
  },
];

function createFeedPort(videos: FollowerFeedVideo[]): FollowerFeedPort {
  return {
    loadFollowerFeed: jest.fn().mockResolvedValue(videos),
  };
}

function createPendingFeedPort(): FollowerFeedPort {
  return {
    loadFollowerFeed: jest.fn(() => new Promise<FollowerFeedVideo[]>(() => undefined)),
  };
}

function createThrowingThenPendingFeedPort(error: unknown): FollowerFeedPort {
  return {
    loadFollowerFeed: jest
      .fn()
      .mockRejectedValueOnce(error)
      .mockImplementationOnce(() => new Promise<FollowerFeedVideo[]>(() => undefined)),
  };
}

function createLoadedThenPendingFeedPort(videos: FollowerFeedVideo[]): FollowerFeedPort {
  return {
    loadFollowerFeed: jest
      .fn()
      .mockResolvedValueOnce(videos)
      .mockImplementationOnce(() => new Promise<FollowerFeedVideo[]>(() => undefined)),
  };
}

describe('<FollowerFeedScreen />', () => {
  beforeEach(() => {
    jest.mocked(useVideoPlayer).mockClear();
  });

  it('renders loading while the feed is pending', async () => {
    // Given
    const feedPort = createPendingFeedPort();
    const { getByText } = await render(<FollowerFeedScreen feedPort={feedPort} />);

    // When / Then
    expect(getByText('Loading feed...')).toBeTruthy();
  });

  it('renders loaded feed videos', async () => {
    // Given
    const feedPort = createFeedPort(feedVideos);
    const { findByText } = await render(<FollowerFeedScreen feedPort={feedPort} />);

    // When / Then
    expect(await findByText('Launch demo')).toBeTruthy();
    expect(await findByText('Diogo')).toBeTruthy();
    expect(await findByText('00:42')).toBeTruthy();
  });

  it('renders creator uploaded metadata with a fallback thumbnail', async () => {
    // Given
    const feedPort = createFeedPort(creatorUploadedVideos);
    const { findByText } = await render(<FollowerFeedScreen feedPort={feedPort} />);

    // When / Then
    expect(await findByText('Launch demo')).toBeTruthy();
    expect(await findByText('You')).toBeTruthy();
    expect(await findByText('A quick launch walkthrough.')).toBeTruthy();
    expect(await findByText('Video')).toBeTruthy();
    expect(await findByText('Just now')).toBeTruthy();
  });

  it('renders creator thumbnail images when the feed provides an image uri', async () => {
    // Given
    const feedPort = createFeedPort([
      {
        ...creatorUploadedVideos[0],
        imageUri: 'file:///thumbnails/uploaded-video-1.jpg',
      },
    ]);
    const { findByLabelText, findByText, queryByText } = await render(
      <FollowerFeedScreen feedPort={feedPort} />
    );

    // When
    await findByText('Launch demo');

    // Then
    expect((await findByLabelText('Thumbnail for Launch demo')).props.source).toContainEqual({
      uri: 'file:///thumbnails/uploaded-video-1.jpg',
    });
    expect(queryByText('Video')).toBeNull();
  });

  it('keeps feed videos visible and shows a refresh indicator during pull refresh', async () => {
    // Given
    const feedPort = createLoadedThenPendingFeedPort(feedVideos);
    const { findByLabelText, findByText, getByTestId, getByText } = await render(
      <FollowerFeedScreen feedPort={feedPort} />
    );
    await findByText('Launch demo');

    // When
    await act(async () => {
      getByTestId('follower-feed-scroll').props.refreshControl.props.onRefresh();
    });

    // Then
    expect(getByText('Launch demo')).toBeTruthy();
    expect(await findByLabelText('Refreshing feed')).toBeTruthy();
    await waitFor(() => expect(feedPort.loadFollowerFeed).toHaveBeenCalledTimes(2));
  });

  it('renders an inline video player in the selected card frame when a feed video is pressed', async () => {
    // Given
    const feedPort = createFeedPort(feedVideos);
    const { findByLabelText, findByText, getByText, queryByLabelText, queryByText } = await render(
      <FollowerFeedScreen feedPort={feedPort} />
    );
    await findByText('Launch demo');

    // When
    await fireEvent.press(getByText('Launch demo'));

    // Then
    expect(getByText('Your Feed. Drag down and hold to refresh.')).toBeTruthy();
    expect(getByText('Launch demo')).toBeTruthy();
    expect((await findByLabelText('Inline player for Launch demo')).props.fullscreenOptions).toEqual({
      enable: true,
      orientation: 'default',
    });
    expect(queryByLabelText('Enter fullscreen for Launch demo')).toBeNull();
    expect(getByText('Close video')).toBeTruthy();
    expect(queryByText('Video plays here')).toBeNull();
    expect(useVideoPlayer).toHaveBeenCalledWith(
      {
        uri: 'file:///feed/launch-demo.mov',
      },
      expect.any(Function)
    );
  });

  it('returns the selected card to its thumbnail frame when the inline player is closed', async () => {
    // Given
    const feedPort = createFeedPort(feedVideos);
    const { findByLabelText, findByText, getByText, queryByLabelText } = await render(
      <FollowerFeedScreen feedPort={feedPort} />
    );
    await findByText('Launch demo');
    await fireEvent.press(getByText('Launch demo'));
    await findByLabelText('Inline player for Launch demo');

    // When
    await fireEvent.press(getByText('Close video'));

    // Then
    expect(queryByLabelText('Inline player for Launch demo')).toBeNull();
    expect(getByText('Launch demo')).toBeTruthy();
  });

  it('closes the inline player before notifying the route to go home', async () => {
    // Given
    const onExitFlow = jest.fn();
    const feedPort = createFeedPort(feedVideos);
    const { findByLabelText, findByText, getByText, queryByLabelText } = await render(
      <FollowerFeedScreen feedPort={feedPort} onExitFlow={onExitFlow} />
    );
    await findByText('Launch demo');
    await fireEvent.press(getByText('Launch demo'));
    await findByLabelText('Inline player for Launch demo');

    // When
    await fireEvent.press(getByText('Back home'));

    // Then
    expect(queryByLabelText('Inline player for Launch demo')).toBeNull();
    expect(onExitFlow).toHaveBeenCalledTimes(1);
  });

  it('closes the inline player when the route loses focus', async () => {
    // Given
    const feedPort = createFeedPort(feedVideos);
    const { findByLabelText, findByText, getByText, queryByLabelText, rerender } = await render(
      <FollowerFeedScreen feedPort={feedPort} closePlaybackSignal={0} />
    );
    await findByText('Launch demo');
    await fireEvent.press(getByText('Launch demo'));
    await findByLabelText('Inline player for Launch demo');

    // When
    await rerender(<FollowerFeedScreen feedPort={feedPort} closePlaybackSignal={1} />);

    // Then
    expect(queryByLabelText('Inline player for Launch demo')).toBeNull();
  });

  it('renders an empty feed state', async () => {
    // Given
    const feedPort = createFeedPort([]);
    const { findByText } = await render(<FollowerFeedScreen feedPort={feedPort} />);

    // When / Then
    expect(await findByText('No videos yet.')).toBeTruthy();
  });

  it('renders a failed feed state and reloads when refresh is pressed', async () => {
    // Given
    const feedPort = createThrowingThenPendingFeedPort(new Error('Feed service unavailable.'));
    const { findByText, getByText } = await render(<FollowerFeedScreen feedPort={feedPort} />);

    // When / Then
    expect(await findByText('Feed service unavailable.')).toBeTruthy();

    // When
    await fireEvent.press(getByText('Refresh'));

    // Then
    expect(await findByText('Loading feed...')).toBeTruthy();
    await waitFor(() => expect(feedPort.loadFollowerFeed).toHaveBeenCalledTimes(2));
  });

  it('notifies the route when back home is pressed', async () => {
    // Given
    const onExitFlow = jest.fn();
    const feedPort = createFeedPort(feedVideos);
    const { getByText } = await render(
      <FollowerFeedScreen feedPort={feedPort} onExitFlow={onExitFlow} />
    );

    // When
    await fireEvent.press(getByText('Back home'));

    // Then
    expect(onExitFlow).toHaveBeenCalledTimes(1);
  });
});
