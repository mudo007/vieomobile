export type Persona = 'creator' | 'follower';

export type PersonaDestination = 'gallery' | 'feed';

export function choosePersona(persona: Persona): PersonaDestination {
  return persona === 'creator' ? 'gallery' : 'feed';
}
