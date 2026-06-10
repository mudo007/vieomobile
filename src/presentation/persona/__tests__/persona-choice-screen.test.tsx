import { fireEvent, render } from '@testing-library/react-native';

import { PersonaChoiceScreen } from '@/src/presentation/persona/persona-choice-screen';

describe('<PersonaChoiceScreen />', () => {
  it('renders both persona choices', async () => {
    const { getByText } = await render(<PersonaChoiceScreen />);

    expect(getByText('Creator')).toBeTruthy();
    expect(getByText('Follower')).toBeTruthy();
  });

  it('emits the selected persona and destination', async () => {
    const onChoosePersona = jest.fn();

    const { getByText } = await render(<PersonaChoiceScreen onChoosePersona={onChoosePersona} />);
    fireEvent.press(getByText('Creator'));

    expect(onChoosePersona).toHaveBeenCalledWith('creator', 'gallery');
  });
});
