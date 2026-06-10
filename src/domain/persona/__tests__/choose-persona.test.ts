import { choosePersona } from '@/src/domain/persona';

describe('choosePersona', () => {
  it('routes creators to the gallery', () => {
    // Given
    const persona = 'creator';

    // When
    const destination = choosePersona(persona);

    // Then
    expect(destination).toBe('gallery');
  });

  it('routes followers to the feed', () => {
    // Given
    const persona = 'follower';

    // When
    const destination = choosePersona(persona);

    // Then
    expect(destination).toBe('feed');
  });
});
