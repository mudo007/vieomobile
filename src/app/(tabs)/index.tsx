import { useRouter } from 'expo-router';

import type { Persona, PersonaDestination } from '@/src/domain/persona';
import { PersonaChoiceScreen } from '@/src/presentation/persona/persona-choice-screen';

export default function HomeScreen() {
  const router = useRouter();

  const handleChoosePersona = (_persona: Persona, destination: PersonaDestination) => {
    if (destination === 'gallery') {
      router.push('/creator');
      return;
    }

    router.push('/follower');
  };

  return <PersonaChoiceScreen onChoosePersona={handleChoosePersona} />;
}
