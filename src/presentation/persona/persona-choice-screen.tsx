import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  choosePersona,
  type Persona,
  type PersonaDestination,
} from '@/src/domain/persona';
import { AppColors, AppRadii, AppShadow, AppSpacing } from '@/src/presentation/shared/app-design';
import { APP_DEMO_VERSION } from '@/src/presentation/shared/app-version';

type PersonaChoiceScreenProps = {
  onChoosePersona?: (persona: Persona, destination: PersonaDestination) => void;
};

export function PersonaChoiceScreen({ onChoosePersona }: PersonaChoiceScreenProps) {
  const handleChoose = (persona: Persona) => {
    onChoosePersona?.(persona, choosePersona(persona));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>VideoShare</Text>
        <View style={styles.versionPill}>
          <Text style={styles.versionText}>Demo version {APP_DEMO_VERSION}</Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Learning showcase</Text>
        <Text style={styles.title}>Choose your flow</Text>
        <Text style={styles.description}>
          This is a demo app built to showcase the video upload flow we built for one of our clients. You can choose to experience the flow as a creator or as a follower. Feel free to explore both flows!
        </Text>
        <Text style={styles.description}>
          Videos uploaded in the creator flow are shown in the follower feed.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => handleChoose('creator')}
          style={styles.card}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>↥</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Creator</Text>
            <Text style={styles.cardDescription}>Upload videos into a gallery.</Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => handleChoose('follower')}
          style={styles.card}>
          <View style={[styles.cardIcon, styles.cardIconPurple]}>
            <Text style={styles.cardIconText}>▣</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Follower</Text>
            <Text style={styles.cardDescription}>Browse creator videos in a feed.</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    gap: AppSpacing.lg,
    padding: AppSpacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: AppColors.softBorder,
    borderRadius: AppRadii.md,
    backgroundColor: AppColors.surface,
    padding: AppSpacing.md,
    ...AppShadow,
  },
  brand: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  versionPill: {
    borderRadius: 999,
    backgroundColor: AppColors.mutedSurface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  versionText: {
    color: AppColors.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  heroCard: {
    gap: AppSpacing.sm,
    borderWidth: 1,
    borderColor: AppColors.softBorder,
    borderRadius: AppRadii.lg,
    backgroundColor: AppColors.surface,
    padding: AppSpacing.lg,
    ...AppShadow,
  },
  kicker: {
    color: AppColors.primary,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: AppColors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  description: {
    color: AppColors.mutedText,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    gap: AppSpacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.md,
    borderWidth: 1,
    borderColor: AppColors.softBorder,
    borderRadius: AppRadii.md,
    backgroundColor: AppColors.surface,
    padding: AppSpacing.md,
    ...AppShadow,
  },
  cardIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: AppColors.primary,
  },
  cardIconPurple: {
    backgroundColor: AppColors.purple,
  },
  cardIconText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  cardContent: {
    flex: 1,
    gap: AppSpacing.xs,
  },
  cardTitle: {
    color: AppColors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  cardDescription: {
    color: AppColors.mutedText,
    fontSize: 14,
  },
});
