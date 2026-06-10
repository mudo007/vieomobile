import { choosePersona } from '@/src/domain/persona';

describe('choosePersona', () => {
  it('routes creators to the gallery', () => {
    expect(choosePersona('creator')).toBe('gallery');
  });

  it('routes followers to the feed', () => {
    expect(choosePersona('follower')).toBe('feed');
  });
});
