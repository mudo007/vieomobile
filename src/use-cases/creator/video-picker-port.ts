import type { SelectedVideo } from '@/src/domain/creator';

export type PickCreatorVideoResult =
  | {
      type: 'videoSelected';
      video: SelectedVideo;
    }
  | {
      type: 'cancelled';
    }
  | {
      type: 'permissionDenied';
      message: string;
    }
  | {
      type: 'unsupportedVideo';
      message: string;
      video?: SelectedVideo;
    };

export type VideoPickerPort = {
  pickVideo(): Promise<PickCreatorVideoResult>;
};
