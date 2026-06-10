import { fireEvent, render } from '@testing-library/react-native';

import { PersonaChoiceScreen } from '@/src/presentation/persona/persona-choice-screen';

describe('<PersonaChoiceScreen />', () => {
  it('renders both persona choices', async () => {
    // Given / When
    const { getByText } = await render(<PersonaChoiceScreen />);

    // Then
    expect(getByText('Creator')).toBeTruthy();
    expect(getByText('Follower')).toBeTruthy();
    expect(getByText('Demo version 1.0.0')).toBeTruthy();
  });

  it('emits the selected persona and destination', async () => {
    // Given
    const onChoosePersona = jest.fn();
    const { getByText } = await render(<PersonaChoiceScreen onChoosePersona={onChoosePersona} />);

    // When
    fireEvent.press(getByText('Creator'));

    // Then
    expect(onChoosePersona).toHaveBeenCalledWith('creator', 'gallery');
  });
});
