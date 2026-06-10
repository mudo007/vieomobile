import type { PickCreatorVideoResult, VideoPickerPort } from '@/src/use-cases/creator';

export class FakeVideoPicker implements VideoPickerPort {
  pickVideoCallCount = 0;

  constructor(private readonly result: PickCreatorVideoResult) {}

  async pickVideo(): Promise<PickCreatorVideoResult> {
    this.pickVideoCallCount += 1;
    return this.result;
  }
}

export class ThrowingFakeVideoPicker implements VideoPickerPort {
  pickVideoCallCount = 0;

  constructor(private readonly error: unknown) {}

  async pickVideo(): Promise<PickCreatorVideoResult> {
    this.pickVideoCallCount += 1;
    throw this.error;
  }
}

export function createFakeVideoPicker(result: PickCreatorVideoResult): FakeVideoPicker {
  return new FakeVideoPicker(result);
}

export function createThrowingFakeVideoPicker(error: unknown): ThrowingFakeVideoPicker {
  return new ThrowingFakeVideoPicker(error);
}
