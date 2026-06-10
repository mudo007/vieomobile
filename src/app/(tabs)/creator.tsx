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
  return <CreatorUploadScreen videoPicker={demoVideoPicker} />;
}
