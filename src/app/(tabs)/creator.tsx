import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

import { createExpoVideoPicker, createExpoVideoThumbnailGenerator } from '@/src/adapters/expo';
import { createFakeVideoUploader } from '@/src/adapters/fake';
import { localUploadedVideos } from '@/src/adapters/in-memory';
import type { CreatorUploadState } from '@/src/domain/creator';
import { CreatorUploadScreen } from '@/src/presentation/creator';

const demoVideoPicker = createExpoVideoPicker();
const demoVideoUploader = createFakeVideoUploader();
const demoVideoThumbnailGenerator = createExpoVideoThumbnailGenerator();

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
      videoThumbnailGenerator={demoVideoThumbnailGenerator}
      uploadedVideos={localUploadedVideos}
      initialState={initialCreatorRouteState}
      onExitFlow={() => router.replace('/')}
    />
  );
}
