import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import {
  createFakeVideoPicker,
  createThrowingFakeVideoPicker,
} from '@/src/adapters/fake';
import type { CreatorUploadState, SelectedVideo, UploadedVideo } from '@/src/domain/creator';
import { CreatorUploadScreen } from '@/src/presentation/creator';
import type {
  PickCreatorVideoResult,
  UploadCreatorVideoInput,
  VideoUploaderPort,
} from '@/src/use-cases/creator';

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
  initialState: CreatorUploadState = { status: 'picking' },
  onExitFlow?: () => void,
  videoUploader: VideoUploaderPort = createPendingVideoUploader()
) {
  const videoPicker = createFakeVideoPicker(result);
  const screen = await render(
    <CreatorUploadScreen
      videoPicker={videoPicker}
      videoUploader={videoUploader}
      initialState={initialState}
      onExitFlow={onExitFlow}
    />
  );

  return {
    ...screen,
    videoPicker,
  };
}

async function renderWithThrowingPicker(
  error: unknown,
  initialState: CreatorUploadState = { status: 'picking' },
  videoUploader: VideoUploaderPort = createPendingVideoUploader()
) {
  const videoPicker = createThrowingFakeVideoPicker(error);
  const screen = await render(
    <CreatorUploadScreen
      videoPicker={videoPicker}
      videoUploader={videoUploader}
      initialState={initialState}
    />
  );

  return {
    ...screen,
    videoPicker,
  };
}

async function press(element: Parameters<typeof fireEvent.press>[0]) {
  await fireEvent.press(element);
}

function createPendingVideoUploader(): VideoUploaderPort {
  return {
    uploadCreatorVideo: jest.fn(() => new Promise<UploadedVideo>(() => undefined)),
  };
}

function createManualVideoUploader() {
  let uploadInput: UploadCreatorVideoInput | null = null;
  let resolveUpload: (uploadedVideo: UploadedVideo) => void = () => undefined;

  const uploadPromise = new Promise<UploadedVideo>((resolve) => {
    resolveUpload = resolve;
  });

  const videoUploader: VideoUploaderPort = {
    uploadCreatorVideo: jest.fn((input) => {
      uploadInput = input;
      return uploadPromise;
    }),
  };

  return {
    videoUploader,
    get signal() {
      return uploadInput?.signal;
    },
    progress(progress: number) {
      uploadInput?.onProgress(progress);
    },
    succeed(nextUploadedVideo: UploadedVideo) {
      resolveUpload(nextUploadedVideo);
    },
  };
}

describe('<CreatorUploadScreen />', () => {
  it('renders the picking upload action', async () => {
    // Given / When
    const { getByText, queryByPlaceholderText, queryByText } = await renderWithPickerResult({
      type: 'cancelled',
    });

    // Then
    expect(getByText('Create upload')).toBeTruthy();
    expect(queryByPlaceholderText('Video title')).toBeNull();
    expect(queryByText('Description')).toBeNull();
  });

  it('opens the picker and renders the editing form after a valid video is selected', async () => {
    // Given
    const { findByPlaceholderText, findByText, getByText, videoPicker } =
      await renderWithPickerResult({
        type: 'videoSelected',
        video: selectedVideo,
      });

    // When
    await press(getByText('Create upload'));

    // Then
    const descriptionInput = await findByPlaceholderText('Add a description...');

    expect(await findByText('video.mov')).toBeTruthy();
    expect(await findByText('Confirm upload')).toBeTruthy();
    expect(descriptionInput.props.editable).not.toBe(false);
    expect(videoPicker.pickVideoCallCount).toBe(1);
  });

  it('transitions away from the picking action when the picker reports cancellation', async () => {
    // Given
    const { getByText, queryByText, videoPicker } = await renderWithPickerResult({
      type: 'cancelled',
    });

    // When
    await press(getByText('Create upload'));

    // Then
    await waitFor(() => expect(videoPicker.pickVideoCallCount).toBe(1));
    expect(queryByText('Create upload')).toBeNull();
    expect(queryByText('Confirm upload')).toBeNull();
    expect(queryByText('Title is required.')).toBeNull();
    expect(videoPicker.pickVideoCallCount).toBe(1);
  });

  it('notifies the route when the picker cancellation exits the flow', async () => {
    // Given
    const onExitFlow = jest.fn();
    const { getByText } = await renderWithPickerResult(
      { type: 'cancelled' },
      { status: 'picking' },
      onExitFlow
    );

    // When
    await press(getByText('Create upload'));

    // Then
    expect(onExitFlow).toHaveBeenCalledTimes(1);
  });

  it('notifies the route when the user exits from the picking state', async () => {
    // Given
    const onExitFlow = jest.fn();
    const { getByText } = await renderWithPickerResult(
      { type: 'cancelled' },
      { status: 'picking' },
      onExitFlow
    );

    // When
    await press(getByText('Back home'));

    // Then
    expect(onExitFlow).toHaveBeenCalledTimes(1);
  });

  it('renders a permission error when media access is denied', async () => {
    // Given
    const { findByText, getByText } = await renderWithPickerResult({
      type: 'permissionDenied',
      message: 'Media library access is required.',
    });

    // When
    await press(getByText('Create upload'));

    // Then
    expect(await findByText('Media library access is required.')).toBeTruthy();
    expect(await findByText('Back home')).toBeTruthy();
  });

  it('renders an unsupported video error when the picked video is not usable', async () => {
    // Given
    const { findByText, getByText } = await renderWithPickerResult({
      type: 'unsupportedVideo',
      message: 'Only local video files are supported.',
      video: selectedVideo,
    });

    // When
    await press(getByText('Create upload'));

    // Then
    expect(await findByText('Only local video files are supported.')).toBeTruthy();
  });

  it('renders an unexpected picker error when the picker throws', async () => {
    // Given
    const { findByText, getByText } = await renderWithThrowingPicker(
      new Error('Native picker crashed.')
    );

    // When
    await press(getByText('Create upload'));

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
    await press(getByText('Create upload'));
    await findByText('Confirm upload');
    await press(getByText('Confirm upload'));

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
    await press(getByText('Create upload'));
    const titleInput = await findByPlaceholderText('Video title');
    await fireEvent.changeText(titleInput, 'Launch demo');
    await press(getByText('Confirm upload'));

    // Then
    expect(await findByText('Uploading Launch demo')).toBeTruthy();
    expect(await findByText('Progress: 0%')).toBeTruthy();
    expect(await findByText('Cancel upload')).toBeTruthy();
  });

  it('renders uploader progress and completion after upload starts', async () => {
    // Given
    const manualUploader = createManualVideoUploader();
    const { findByPlaceholderText, findByText, getByText } = await renderWithPickerResult(
      {
        type: 'videoSelected',
        video: selectedVideo,
      },
      { status: 'picking' },
      undefined,
      manualUploader.videoUploader
    );

    // When
    await press(getByText('Create upload'));
    const titleInput = await findByPlaceholderText('Video title');
    await fireEvent.changeText(titleInput, 'Launch demo');
    await press(getByText('Confirm upload'));
    await findByText('Progress: 0%');
    await act(async () => {
      manualUploader.progress(0.5);
    });

    // Then
    expect(await findByText('Progress: 50%')).toBeTruthy();

    // When
    await act(async () => {
      manualUploader.succeed(uploadedVideo);
    });

    // Then
    expect(await findByText('Upload complete')).toBeTruthy();
  });

  it('returns to picking when editing is cancelled', async () => {
    // Given
    const editingState: CreatorUploadState = {
      status: 'editing',
      video: selectedVideo,
      title: 'Launch demo',
      description: 'A quick launch walkthrough.',
    };
    const { getByText, queryByText } = await renderWithPickerResult(
      { type: 'cancelled' },
      editingState
    );

    // When
    await press(getByText('Cancel editing'));

    // Then
    await waitFor(() => expect(getByText('Create upload')).toBeTruthy());
    expect(queryByText('Launch demo')).toBeNull();
  });

  it('returns to editing when upload is cancelled', async () => {
    // Given
    const uploadingState: CreatorUploadState = {
      status: 'uploading',
      video: selectedVideo,
      title: 'Launch demo',
      description: 'A quick launch walkthrough.',
      progress: 0.4,
    };
    const manualUploader = createManualVideoUploader();
    const { getByText } = await renderWithPickerResult(
      { type: 'cancelled' },
      uploadingState,
      undefined,
      manualUploader.videoUploader
    );

    // When
    await waitFor(() => expect(manualUploader.signal).toBeDefined());
    await press(getByText('Cancel upload'));

    // Then
    await waitFor(() => expect(getByText('video.mov')).toBeTruthy());
    expect(getByText('Confirm upload')).toBeTruthy();
    expect(manualUploader.signal?.aborted).toBe(true);
  });

  it('notifies the route when uploaded state resets to idle', async () => {
    // Given
    const onExitFlow = jest.fn();
    const uploadedState: CreatorUploadState = {
      status: 'uploaded',
      uploadedVideo,
    };
    const { getByText } = await renderWithPickerResult(
      { type: 'cancelled' },
      uploadedState,
      onExitFlow
    );

    // When
    expect(getByText('Upload complete')).toBeTruthy();
    await press(getByText('Back home'));

    // Then
    await waitFor(() => expect(onExitFlow).toHaveBeenCalledTimes(1));
  });

  it('notifies the route when failed state resets to idle', async () => {
    // Given
    const onExitFlow = jest.fn();
    const failedState: CreatorUploadState = {
      status: 'failed',
      failure: {
        type: 'uploadFailed',
        message: 'Network request failed.',
      },
    };
    const { getByText } = await renderWithPickerResult(
      { type: 'cancelled' },
      failedState,
      onExitFlow
    );

    // When
    expect(getByText('Network request failed.')).toBeTruthy();
    await press(getByText('Back home'));

    // Then
    await waitFor(() => expect(onExitFlow).toHaveBeenCalledTimes(1));
  });
});
