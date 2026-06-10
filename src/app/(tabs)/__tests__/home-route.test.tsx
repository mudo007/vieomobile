import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import HomeScreen from '@/src/app/(tabs)';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const push = jest.fn();

describe('<HomeScreen />', () => {
  beforeEach(() => {
    push.mockClear();
    jest.mocked(useRouter).mockReturnValue({ push } as never);
  });

  it('navigates to the creator flow when Creator is selected', async () => {
    // Given
    const { getByText } = await render(<HomeScreen />);

    // When
    await fireEvent.press(getByText('Creator'));

    // Then
    expect(push).toHaveBeenCalledWith('/creator');
  });

  it('navigates to the follower flow when Follower is selected', async () => {
    // Given
    const { getByText } = await render(<HomeScreen />);

    // When
    await fireEvent.press(getByText('Follower'));

    // Then
    expect(push).toHaveBeenCalledWith('/follower');
  });
});
