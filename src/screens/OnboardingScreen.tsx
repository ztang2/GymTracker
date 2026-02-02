import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts';
import { spacing, typography, borderRadius } from '../constants/theme';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../navigation/types';

type OnboardingScreenProps = StackScreenProps<AuthStackParamList, 'OnboardingScreen'>;

type FitnessGoal = 'muscle' | 'fat_loss' | 'strength' | 'fitness';
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

const fitnessGoals: Array<{
  id: FitnessGoal;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { id: 'muscle', label: 'Build Muscle', icon: 'body' },
  { id: 'fat_loss', label: 'Lose Fat', icon: 'flame' },
  { id: 'strength', label: 'Get Stronger', icon: 'barbell' },
  { id: 'fitness', label: 'Stay Fit', icon: 'heart' },
];

const experienceLevels: Array<{
  id: ExperienceLevel;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { id: 'beginner', label: 'Beginner', subtitle: '0-6 months', icon: 'walk' },
  { id: 'intermediate', label: 'Intermediate', subtitle: '6-24 months', icon: 'bicycle' },
  { id: 'advanced', label: 'Advanced', subtitle: '2+ years', icon: 'rocket' },
];

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const { colors } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceLevel | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const nextPage = () => {
    if (currentPage < 2) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start(() => {
        setCurrentPage(currentPage + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('@liftarc_onboarding_complete', 'true');
    navigation.reset({ index: 0, routes: [{ name: 'OnboardingScreen' }] });
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('@liftarc_onboarding_complete', 'true');
      const preferences = { goal: selectedGoal, experience: selectedExperience };
      await AsyncStorage.setItem('@liftarc_user_preferences', JSON.stringify(preferences));
      navigation.reset({ index: 0, routes: [{ name: 'OnboardingScreen' }] });
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const canProceed = () => {
    if (currentPage === 0) return !!selectedGoal;
    if (currentPage === 1) return !!selectedExperience;
    return true;
  };

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: currentPage === index ? colors.purple : colors.border,
              width: currentPage === index ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );

  const renderOptionCard = (
    id: string,
    label: string,
    icon: keyof typeof Ionicons.glyphMap,
    selected: boolean,
    onPress: () => void,
    subtitle?: string
  ) => (
    <TouchableOpacity
      key={id}
      style={[
        styles.optionCard,
        {
          backgroundColor: colors.cardBackground,
          borderColor: selected ? colors.purple : colors.border,
          borderWidth: 2,
        },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: selected ? colors.purple : colors.backgroundElevated },
        ]}
      >
        <Ionicons name={icon} size={22} color={selected ? '#fff' : colors.purple} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>{label}</Text>
        {subtitle && (
          <Text style={[styles.levelSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
      {selected && <Ionicons name="checkmark-circle" size={22} color={colors.purple} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip button */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable content area */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {currentPage === 0 && (
            <>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome to LiftArc</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Your personal gym companion
              </Text>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                What's your fitness goal?
              </Text>
              {fitnessGoals.map((g) =>
                renderOptionCard(g.id, g.label, g.icon, selectedGoal === g.id, () =>
                  setSelectedGoal(g.id)
                )
              )}
            </>
          )}

          {currentPage === 1 && (
            <>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                What's your experience?
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Help us tailor your experience
              </Text>
              {experienceLevels.map((l) =>
                renderOptionCard(
                  l.id,
                  l.label,
                  l.icon,
                  selectedExperience === l.id,
                  () => setSelectedExperience(l.id),
                  l.subtitle
                )
              )}
            </>
          )}

          {currentPage === 2 && (
            <>
              <View style={styles.successIconContainer}>
                <View style={[styles.successIcon, { backgroundColor: colors.purple }]}>
                  <Ionicons name="checkmark" size={48} color="#fff" />
                </View>
              </View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>You're all set!</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Let's start your fitness journey
              </Text>
              <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
                <View style={styles.summaryRow}>
                  <Ionicons name="flag" size={20} color={colors.purple} />
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Goal:</Text>
                  <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                    {fitnessGoals.find((g) => g.id === selectedGoal)?.label || '—'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Ionicons name="stats-chart" size={20} color={colors.purple} />
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Experience:
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                    {experienceLevels.find((e) => e.id === selectedExperience)?.label || '—'}
                  </Text>
                </View>
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>

      {/* Fixed bottom: dots + button */}
      <View style={styles.bottomBar}>
        {renderDots()}
        <TouchableOpacity
          disabled={!canProceed()}
          onPress={currentPage === 2 ? handleComplete : nextPage}
          style={{ opacity: canProceed() ? 1 : 0.4 }}
        >
          <LinearGradient
            colors={[colors.purple, colors.pink] as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>
              {currentPage === 2 ? 'Start Training' : 'Next'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  skipButton: {
    padding: spacing.sm,
  },
  skipText: {
    ...typography.body,
    fontWeight: '600',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logo: {
    width: 90,
    height: 90,
  },
  title: {
    ...typography.largeTitle,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.title2,
    marginBottom: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionLabel: {
    ...typography.headline,
  },
  levelSubtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  successIconContainer: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
    marginBottom: spacing.xl,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryLabel: {
    ...typography.body,
    flex: 1,
  },
  summaryValue: {
    ...typography.headline,
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  gradientButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.headline,
    fontWeight: '700',
    color: '#fff',
  },
});
