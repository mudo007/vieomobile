import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import FollowerRoute from '@/src/app/(tabs)/follower';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const replace = jest.fn();

describe('<FollowerRoute />', () => {
  beforeEach(() => {
    replace.mockClear();
    jest.mocked(useRouter).mockReturnValue({ replace } as never);
  });

  it('returns home when the follower exits the feed', async () => {
    // Given
    const { getByText } = await render(<FollowerRoute />);

    // When
    await fireEvent.press(getByText('Back home'));

    // Then
    expect(replace).toHaveBeenCalledWith('/');
  });
});
