import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import CreatorRoute from '@/src/app/(tabs)/creator';

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useRouter: jest.fn(),
}));

const replace = jest.fn();
const focusEffects: (() => void)[] = [];

describe('<CreatorRoute />', () => {
  beforeEach(() => {
    replace.mockClear();
    focusEffects.length = 0;

    jest.mocked(useRouter).mockReturnValue({ replace } as never);
    jest.mocked(useFocusEffect).mockImplementation((effect) => {
      focusEffects.push(effect as () => void);
    });
  });

  it('starts a fresh creator session when the route is focused again', async () => {
    // Given
    const { getByText, queryByText } = await render(<CreatorRoute />);

    // When
    await fireEvent.press(getByText('Back home'));

    // Then
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
    expect(queryByText('Creator flow is idle.')).toBeNull();
    expect(queryByText('Create upload')).toBeNull();

    // When
    await act(async () => {
      focusEffects.at(-1)?.();
    });

    // Then
    expect(getByText('Create upload')).toBeTruthy();
  });
});
