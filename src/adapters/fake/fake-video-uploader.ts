import type { UploadedVideo } from '@/src/domain/creator';
import type { UploadCreatorVideoInput, VideoUploaderPort } from '@/src/use-cases/creator';

export type FakeUploadProgressStep = {
  delayMs: number;
  progress: number;
};

type FakeVideoUploaderOptions = {
  progressSteps?: FakeUploadProgressStep[];
};

const defaultProgressSteps: FakeUploadProgressStep[] = [
  { delayMs: 600, progress: 0.2 },
  { delayMs: 600, progress: 0.45 },
  { delayMs: 600, progress: 0.75 },
  { delayMs: 600, progress: 1 },
];

export class FakeVideoUploader implements VideoUploaderPort {
  constructor(private readonly options: FakeVideoUploaderOptions = {}) {}

  async uploadCreatorVideo(input: UploadCreatorVideoInput): Promise<UploadedVideo> {
    const progressSteps = this.options.progressSteps ?? defaultProgressSteps;

    for (const step of progressSteps) {
      await waitForDelay(step.delayMs, input.signal);
      input.onProgress(step.progress);
    }

    return {
      id: `fake-upload-${Date.now()}`,
      title: input.title,
      sourceUri: input.video.uri,
    };
  }
}

export function createFakeVideoUploader(
  options: FakeVideoUploaderOptions = {}
): FakeVideoUploader {
  return new FakeVideoUploader(options);
}

function waitForDelay(delayMs: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(createAbortError());
      return;
    }

    const timeout = setTimeout(resolve, delayMs);

    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout);
        reject(createAbortError());
      },
      { once: true }
    );
  });
}

function createAbortError(): Error {
  const error = new Error('Upload aborted.');
  error.name = 'AbortError';

  return error;
}
