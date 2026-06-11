import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

import { createExpoVideoPicker } from '@/src/adapters/expo';
import { createFakeVideoUploader } from '@/src/adapters/fake';
import { createInMemoryUploadedVideoRepository } from '@/src/adapters/in-memory';
import type { CreatorUploadState } from '@/src/domain/creator';
import { CreatorUploadScreen } from '@/src/presentation/creator';

const demoVideoPicker = createExpoVideoPicker();
const demoVideoUploader = createFakeVideoUploader();
const demoUploadedVideos = createInMemoryUploadedVideoRepository();

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
      uploadedVideos={demoUploadedVideos}
      initialState={initialCreatorRouteState}
      onExitFlow={() => router.replace('/')}
    />
  );
}
