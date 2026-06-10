import { useRouter } from 'expo-router';

import { createFakeFollowerFeed } from '@/src/adapters/fake';
import { FollowerFeedScreen } from '@/src/presentation/follower';

const demoFollowerFeed = createFakeFollowerFeed();

export default function FollowerRoute() {
  const router = useRouter();

  return <FollowerFeedScreen feedPort={demoFollowerFeed} onExitFlow={() => router.replace('/')} />;
}
