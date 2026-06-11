import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import type { FollowerFeedVideo } from '@/src/domain/follower';
import { FollowerFeedScreen } from '@/src/presentation/follower';
import type { FollowerFeedPort } from '@/src/use-cases/follower';

const feedVideos: FollowerFeedVideo[] = [
  {
    id: 'video-1',
    title: 'Launch demo',
    creatorName: 'Diogo',
    durationLabel: '00:42',
  },
];

const creatorUploadedVideos: FollowerFeedVideo[] = [
  {
    id: 'uploaded-video-1',
    title: 'Launch demo',
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

  it('opens a fake fullscreen player when a feed video is pressed', async () => {
    // Given
    const feedPort = createFeedPort(feedVideos);
    const { findByText, getByText } = await render(<FollowerFeedScreen feedPort={feedPort} />);
    await findByText('Launch demo');

    // When
    await fireEvent.press(getByText('Launch demo'));

    // Then
    expect(getByText('Video plays here')).toBeTruthy();
    expect(getByText('Launch demo')).toBeTruthy();
    expect(getByText('Close video')).toBeTruthy();
  });

  it('returns to the feed when the fake player is closed', async () => {
    // Given
    const feedPort = createFeedPort(feedVideos);
    const { findByText, getByText, queryByText } = await render(
      <FollowerFeedScreen feedPort={feedPort} />
    );
    await findByText('Launch demo');
    await fireEvent.press(getByText('Launch demo'));

    // When
    await fireEvent.press(getByText('Close video'));

    // Then
    expect(queryByText('Video plays here')).toBeNull();
    expect(getByText('Launch demo')).toBeTruthy();
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
