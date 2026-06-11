import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

import { localFollowerFeed } from '@/src/adapters/in-memory';
import { FollowerFeedScreen } from '@/src/presentation/follower';

export default function FollowerRoute() {
  const router = useRouter();
  const [closePlaybackSignal, setClosePlaybackSignal] = useState(0);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setClosePlaybackSignal((currentSignal) => currentSignal + 1);
      };
    }, [])
  );

  return (
    <FollowerFeedScreen
      closePlaybackSignal={closePlaybackSignal}
      feedPort={localFollowerFeed}
      onExitFlow={() => router.replace('/')}
    />
  );
}
