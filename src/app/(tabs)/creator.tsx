import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

import { createFakeVideoPicker, createFakeVideoUploader } from '@/src/adapters/fake';
import type { CreatorUploadState } from '@/src/domain/creator';
import { CreatorUploadScreen } from '@/src/presentation/creator';

const demoVideoPicker = createFakeVideoPicker({
  type: 'videoSelected',
  video: {
    uri: 'file:///demo/creator-video.mov',
    fileName: 'creator-video.mov',
    mimeType: 'video/quicktime',
  },
});

const demoVideoUploader = createFakeVideoUploader();

const initialCreatorRouteState: CreatorUploadState = {
  status: 'picking',
};

export default function CreatorRoute() {
  const router = useRouter();
  const [sessionKey, setSessionKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setSessionKey((currentSessionKey) => currentSessionKey + 1);
    }, [])
  );

  return (
    <CreatorUploadScreen
      key={sessionKey}
      videoPicker={demoVideoPicker}
      videoUploader={demoVideoUploader}
      initialState={initialCreatorRouteState}
      onExitFlow={() => router.replace('/')}
    />
  );
}
