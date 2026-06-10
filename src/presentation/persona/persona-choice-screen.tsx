import { Pressable, StyleSheet, View } from 'react-native';

import {
  choosePersona,
  type Persona,
  type PersonaDestination,
} from '@/src/domain/persona';
import { ThemedText } from '@/src/presentation/shared/themed-text';

type PersonaChoiceScreenProps = {
  onChoosePersona?: (persona: Persona, destination: PersonaDestination) => void;
};

export function PersonaChoiceScreen({ onChoosePersona }: PersonaChoiceScreenProps) {
  const handleChoose = (persona: Persona) => {
    onChoosePersona?.(persona, choosePersona(persona));
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title">Video Mobile</ThemedText>
      <ThemedText style={styles.description}>
        Choose a mode to enter the app skeleton.
      </ThemedText>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => handleChoose('creator')}
          style={styles.card}>
          <ThemedText type="subtitle">Creator</ThemedText>
          <ThemedText>Upload videos into a gallery.</ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => handleChoose('follower')}
          style={styles.card}>
          <ThemedText type="subtitle">Follower</ThemedText>
          <ThemedText>Browse creator videos in a feed.</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
    padding: 24,
  },
  description: {
    maxWidth: 320,
  },
  actions: {
    gap: 12,
  },
  card: {
    gap: 8,
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    padding: 16,
  },
});
