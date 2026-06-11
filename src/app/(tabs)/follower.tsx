import { useRouter } from 'expo-router';

import { localFollowerFeed } from '@/src/adapters/in-memory';
import { FollowerFeedScreen } from '@/src/presentation/follower';

export default function FollowerRoute() {
  const router = useRouter();

  return <FollowerFeedScreen feedPort={localFollowerFeed} onExitFlow={() => router.replace('/')} />;
}
