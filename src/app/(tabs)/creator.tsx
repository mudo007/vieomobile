import { useRouter } from 'expo-router';

import { createFakeVideoPicker } from '@/src/adapters/fake';
import { CreatorUploadScreen } from '@/src/presentation/creator';

const demoVideoPicker = createFakeVideoPicker({
  type: 'videoSelected',
  video: {
    uri: 'file:///demo/creator-video.mov',
    fileName: 'creator-video.mov',
    mimeType: 'video/quicktime',
  },
});

export default function CreatorRoute() {
  const router = useRouter();

  return (
    <CreatorUploadScreen videoPicker={demoVideoPicker} onExitFlow={() => router.replace('/')} />
  );
}
