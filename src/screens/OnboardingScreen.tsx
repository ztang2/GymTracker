import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts';
import { spacing, typography, borderRadius } from '../constants/theme';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../navigation/types';

type OnboardingScreenProps = StackScreenProps<AuthStackParamList, 'OnboardingScreen'>;

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const { colors } = useTheme();

  const handleStart = async () => {
    await AsyncStorage.setItem('@liftarc_onboarding_complete', 'true');
    navigation.reset({ index: 0, routes: [{ name: 'OnboardingScreen' }] });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome to LiftArc</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your personal gym companion
        </Text>

        {/* Feature highlights */}
        <View style={styles.features}>
          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: colors.purple + '20' }]}>
              <Ionicons name="barbell" size={22} color={colors.purple} />
            </View>
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>
              Log workouts & track progress
            </Text>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: colors.purple + '20' }]}>
              <Ionicons name="trending-up" size={22} color={colors.purple} />
            </View>
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>
              Charts, PRs & analytics
            </Text>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: colors.purple + '20' }]}>
              <Ionicons name="trophy" size={22} color={colors.purple} />
            </View>
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>
              Earn XP & unlock achievements
            </Text>
          </View>
        </View>
      </View>

      {/* CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleStart}>
          <LinearGradient
            colors={[colors.purple, colors.pink] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Start Training</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    ...typography.largeTitle,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  features: {
    alignSelf: 'stretch',
    gap: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    ...typography.body,
    fontWeight: '500',
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  buttonText: {
    ...typography.headline,
    fontWeight: '700',
    color: '#fff',
  },
});
