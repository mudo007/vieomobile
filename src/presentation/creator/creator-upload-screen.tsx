import { Text } from 'react-native';

import type { CreatorUploadState } from '@/src/domain/creator';
import type { VideoPickerPort } from '@/src/use-cases/creator';

export type CreatorUploadScreenProps = {
  videoPicker: VideoPickerPort;
  initialState?: CreatorUploadState;
};

export function CreatorUploadScreen({ videoPicker, initialState }: CreatorUploadScreenProps) {
  void videoPicker;
  void initialState;

  return <Text>Creator upload screen not implemented</Text>;
}
