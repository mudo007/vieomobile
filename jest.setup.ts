import '@testing-library/react-native/matchers';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

jest.mock('expo-video', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    useVideoPlayer: jest.fn((source, setup?: (player: { play: jest.Mock }) => void) => {
      const player = {
        source,
        play: jest.fn(),
      };

      setup?.(player);

      return player;
    }),
    VideoView: (props: Record<string, unknown>) => React.createElement(View, props),
  };
});
