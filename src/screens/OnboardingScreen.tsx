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

// Dimensions no longer needed for horizontal paging

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

  const handleGoalSelect = (goal: FitnessGoal) => {
    setSelectedGoal(goal);
  };

  const handleExperienceSelect = (experience: ExperienceLevel) => {
    setSelectedExperience(experience);
  };

  const nextPage = () => {
    if (currentPage < 2) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setCurrentPage(currentPage + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handleComplete = async () => {
    try {
      // Save onboarding completion status
      await AsyncStorage.setItem('@liftarc_onboarding_complete', 'true');
      
      // Save user preferences
      const preferences = {
        goal: selectedGoal,
        experience: selectedExperience,
      };
      await AsyncStorage.setItem('@liftarc_user_preferences', JSON.stringify(preferences));
      
      // Reset navigation stack - AppNavigator will detect onboarding is complete
      // and automatically show MainTabNavigator
      navigation.reset({
        index: 0,
        routes: [{ name: 'OnboardingScreen' }],
      });
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const renderDots = () => {
    return (
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
  };

  const renderPage1 = () => {
    const getGoalLabel = (id: FitnessGoal) => {
      return fitnessGoals.find((g) => g.id === id)?.label || '';
    };

    return (
      <Animated.View style={[styles.page, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        
        <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome to LiftArc</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your personal gym companion
        </Text>

        <View style={styles.optionsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            What's your fitness goal?
          </Text>
          
          {fitnessGoals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: selectedGoal === goal.id ? colors.purple : colors.border,
                  borderWidth: 2,
                },
              ]}
              onPress={() => handleGoalSelect(goal.id)}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: selectedGoal === goal.id ? colors.purple : colors.backgroundElevated,
                  },
                ]}
              >
                <Ionicons
                  name={goal.icon}
                  size={24}
                  color={selectedGoal === goal.id ? colors.textPrimary : colors.purple}
                />
              </View>
              <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                {goal.label}
              </Text>
              {selectedGoal === goal.id && (
                <Ionicons name="checkmark-circle" size={24} color={colors.purple} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          disabled={!selectedGoal}
          onPress={nextPage}
          style={[styles.buttonContainer, { opacity: selectedGoal ? 1 : 0.5 }]}
        >
          <LinearGradient
            colors={[colors.purple, colors.pink] as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Next</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderPage2 = () => {
    return (
      <Animated.View style={[styles.page, { opacity: fadeAnim }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>What's your experience?</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Help us tailor your experience
        </Text>

        <View style={styles.optionsContainer}>
          {experienceLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: selectedExperience === level.id ? colors.purple : colors.border,
                  borderWidth: 2,
                },
              ]}
              onPress={() => handleExperienceSelect(level.id)}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      selectedExperience === level.id ? colors.purple : colors.backgroundElevated,
                  },
                ]}
              >
                <Ionicons
                  name={level.icon}
                  size={24}
                  color={selectedExperience === level.id ? colors.textPrimary : colors.purple}
                />
              </View>
              <View style={styles.levelTextContainer}>
                <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                  {level.label}
                </Text>
                <Text style={[styles.levelSubtitle, { color: colors.textSecondary }]}>
                  {level.subtitle}
                </Text>
              </View>
              {selectedExperience === level.id && (
                <Ionicons name="checkmark-circle" size={24} color={colors.purple} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          disabled={!selectedExperience}
          onPress={nextPage}
          style={[styles.buttonContainer, { opacity: selectedExperience ? 1 : 0.5 }]}
        >
          <LinearGradient
            colors={[colors.purple, colors.pink] as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Next</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderPage3 = () => {
    const goalLabel = fitnessGoals.find((g) => g.id === selectedGoal)?.label || '';
    const experienceLabel = experienceLevels.find((e) => e.id === selectedExperience)?.label || '';

    return (
      <Animated.View style={[styles.page, { opacity: fadeAnim }]}>
        <View style={styles.successIconContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.purple }]}>
            <Ionicons name="checkmark" size={48} color={colors.textPrimary} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>You're all set!</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Let's start your fitness journey
        </Text>

        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.summaryRow}>
              <Ionicons name="flag" size={20} color={colors.purple} />
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Goal:</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                {goalLabel}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="stats-chart" size={20} color={colors.purple} />
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Experience:
              </Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                {experienceLabel}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={handleComplete} style={styles.buttonContainer}>
          <LinearGradient
            colors={[colors.purple, colors.pink] as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Start Training</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.mainContent}>
        {currentPage === 0 && (
          <ScrollView 
            style={styles.pageScroll} 
            contentContainerStyle={styles.pageScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderPage1()}
          </ScrollView>
        )}
        {currentPage === 1 && (
          <ScrollView 
            style={styles.pageScroll} 
            contentContainerStyle={styles.pageScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderPage2()}
          </ScrollView>
        )}
        {currentPage === 2 && (
          <ScrollView 
            style={styles.pageScroll} 
            contentContainerStyle={styles.pageScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderPage3()}
          </ScrollView>
        )}
      </View>

      {renderDots()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  pageScroll: {
    flex: 1,
  },
  pageScrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  page: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    ...typography.largeTitle,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    ...typography.title2,
    marginBottom: spacing.lg,
  },
  optionsContainer: {
    flex: 1,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionLabel: {
    ...typography.headline,
    flex: 1,
  },
  levelTextContainer: {
    flex: 1,
  },
  levelSubtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  buttonContainer: {
    marginTop: spacing.xl,
  },
  gradientButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.headline,
    fontWeight: '700',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: borderRadius.full,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    flex: 1,
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
});
