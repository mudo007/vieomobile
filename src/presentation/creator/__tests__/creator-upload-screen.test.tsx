import { fireEvent, render, waitFor } from '@testing-library/react-native';

import {
  createFakeVideoPicker,
  createThrowingFakeVideoPicker,
} from '@/src/adapters/fake';
import type { CreatorUploadState, SelectedVideo, UploadedVideo } from '@/src/domain/creator';
import { CreatorUploadScreen } from '@/src/presentation/creator';
import type { PickCreatorVideoResult } from '@/src/use-cases/creator';

const selectedVideo: SelectedVideo = {
  uri: 'file:///creator/video.mov',
  fileName: 'video.mov',
  mimeType: 'video/quicktime',
};

const uploadedVideo: UploadedVideo = {
  id: 'video-1',
  title: 'Launch demo',
  sourceUri: selectedVideo.uri,
};

// Every test will need a picker result and a rendered Upload Screen, so we create a helper to reduce boilerplate in the tests.
async function renderWithPickerResult(
  result: PickCreatorVideoResult,
  initialState?: CreatorUploadState
) {
  const videoPicker = createFakeVideoPicker(result);
  const screen = await render(
    <CreatorUploadScreen videoPicker={videoPicker} initialState={initialState} />
  );

  return {
    ...screen,
    videoPicker,
  };
}

async function renderWithThrowingPicker(error: unknown, initialState?: CreatorUploadState) {
  const videoPicker = createThrowingFakeVideoPicker(error);
  const screen = await render(
    <CreatorUploadScreen videoPicker={videoPicker} initialState={initialState} />
  );

  return {
    ...screen,
    videoPicker,
  };
}

describe('<CreatorUploadScreen />', () => {
  it('renders the idle upload action', async () => {
    // Given / When
    const { getByText } = await renderWithPickerResult({ type: 'cancelled' });

    // Then
    expect(getByText('Create upload')).toBeTruthy();
  });

  it('opens the picker and renders the editing form after a valid video is selected', async () => {
    // Given
    const { findByText, getByText, videoPicker } = await renderWithPickerResult({
      type: 'videoSelected',
      video: selectedVideo,
    });

    // When
    fireEvent.press(getByText('Create upload'));

    // Then
    expect(await findByText('video.mov')).toBeTruthy();
    expect(await findByText('Confirm upload')).toBeTruthy();
    expect(videoPicker.pickVideoCallCount).toBe(1);
  });

  it('returns to idle when the picker reports cancellation', async () => {
    // Given
    const { getByText, queryByText, videoPicker } = await renderWithPickerResult({
      type: 'cancelled',
    });

    // When
    fireEvent.press(getByText('Create upload'));

    // Then
    await waitFor(() => expect(getByText('Create upload')).toBeTruthy());
    expect(queryByText('Confirm upload')).toBeNull();
    expect(queryByText('Title is required.')).toBeNull();
    expect(videoPicker.pickVideoCallCount).toBe(1);
  });

  it('renders a permission error when media access is denied', async () => {
    // Given
    const { findByText, getByText } = await renderWithPickerResult({
      type: 'permissionDenied',
      message: 'Media library access is required.',
    });

    // When
    fireEvent.press(getByText('Create upload'));

    // Then
    expect(await findByText('Media library access is required.')).toBeTruthy();
    expect(await findByText('Try again')).toBeTruthy();
  });

  it('renders an unsupported video error when the picked video is not usable', async () => {
    // Given
    const { findByText, getByText } = await renderWithPickerResult({
      type: 'unsupportedVideo',
      message: 'Only local video files are supported.',
      video: selectedVideo,
    });

    // When
    fireEvent.press(getByText('Create upload'));

    // Then
    expect(await findByText('Only local video files are supported.')).toBeTruthy();
  });

  it('renders an unexpected picker error when the picker throws', async () => {
    // Given
    const { findByText, getByText } = await renderWithThrowingPicker(
      new Error('Native picker crashed.')
    );

    // When
    fireEvent.press(getByText('Create upload'));

    // Then
    expect(await findByText('Native picker crashed.')).toBeTruthy();
  });

  it('shows title validation when confirming with an empty title', async () => {
    // Given
    const { findByText, getByText } = await renderWithPickerResult({
      type: 'videoSelected',
      video: selectedVideo,
    });

    // When
    fireEvent.press(getByText('Create upload'));
    await findByText('Confirm upload');
    fireEvent.press(getByText('Confirm upload'));

    // Then
    expect(await findByText('Title is required.')).toBeTruthy();
  });

  it('moves to uploading after a title is entered and confirmed', async () => {
    // Given
    const { findByPlaceholderText, findByText, getByText } = await renderWithPickerResult({
      type: 'videoSelected',
      video: selectedVideo,
    });

    // When
    fireEvent.press(getByText('Create upload'));
    const titleInput = await findByPlaceholderText('Video title');
    fireEvent.changeText(titleInput, 'Launch demo');
    fireEvent.press(getByText('Confirm upload'));

    // Then
    expect(await findByText('Uploading Launch demo')).toBeTruthy();
    expect(await findByText('Progress: 0%')).toBeTruthy();
    expect(await findByText('Cancel upload')).toBeTruthy();
  });

  it('returns to picking when editing is cancelled', async () => {
    // Given
    const editingState: CreatorUploadState = {
      status: 'editing',
      video: selectedVideo,
      title: 'Launch demo',
    };
    const { getByText, queryByText } = await renderWithPickerResult(
      { type: 'cancelled' },
      editingState
    );

    // When
    fireEvent.press(getByText('Cancel editing'));

    // Then
    expect(queryByText('Launch demo')).toBeNull();
    expect(getByText('Picking video...')).toBeTruthy();
  });

  it('returns to editing when upload is cancelled', async () => {
    // Given
    const uploadingState: CreatorUploadState = {
      status: 'uploading',
      video: selectedVideo,
      title: 'Launch demo',
      progress: 0.4,
    };
    const { getByText } = await renderWithPickerResult({ type: 'cancelled' }, uploadingState);

    // When
    fireEvent.press(getByText('Cancel upload'));

    // Then
    expect(getByText('video.mov')).toBeTruthy();
    expect(getByText('Confirm upload')).toBeTruthy();
  });

  it('resets to idle from uploaded state', async () => {
    // Given
    const uploadedState: CreatorUploadState = {
      status: 'uploaded',
      uploadedVideo,
    };
    const { getByText } = await renderWithPickerResult({ type: 'cancelled' }, uploadedState);

    // When
    expect(getByText('Upload complete')).toBeTruthy();
    fireEvent.press(getByText('Create another'));

    // Then
    expect(getByText('Create upload')).toBeTruthy();
  });

  it('resets to idle from failed state', async () => {
    // Given
    const failedState: CreatorUploadState = {
      status: 'failed',
      failure: {
        type: 'uploadFailed',
        message: 'Network request failed.',
      },
    };
    const { getByText } = await renderWithPickerResult({ type: 'cancelled' }, failedState);

    // When
    expect(getByText('Network request failed.')).toBeTruthy();
    fireEvent.press(getByText('Try again'));

    // Then
    expect(getByText('Create upload')).toBeTruthy();
  });
});
