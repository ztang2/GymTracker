import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { HomeScreenProps } from '../navigation/types';
import {
  getRecentWorkouts,
  getWorkoutStatsByRange,
  getUserProfile,
  getLevelInfo,
  type WorkoutSession,
  type LevelInfo,
} from '../services';
import {
  StatCard,
  ActionButton,
  WorkoutHistoryCard,
  LoadingState,
  EmptyState,
  XPProgressBar,
} from '../components';
import { useAuth, useTheme } from '../contexts';
import { typography, spacing } from '../constants/theme';

// Gradient Icon component with pulse animation
interface GradientIconProps {
  iconName: keyof typeof Ionicons.glyphMap;
  gradientColors: readonly [string, string, ...string[]];
}

function GradientIcon({ iconName, gradientColors }: GradientIconProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Create a looping pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <LinearGradient
        colors={gradientColors as any}
        style={styles.gradientCircle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={iconName} size={28} color="#FFFFFF" />
      </LinearGradient>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Reload data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadData();
      }
    }, [user])
  );

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Fetch recent workouts, weekly stats, and user profile
      const [recent, stats, profile] = await Promise.all([
        getRecentWorkouts(user.id, 8),
        getWorkoutStatsByRange(user.id, 'week'),
        getUserProfile(user.id),
      ]);

      setWorkouts(recent);
      setWeeklyWorkouts(stats.total_workouts);
      setWeeklyMinutes(stats.total_duration_minutes);

      // Calculate level info from profile
      if (profile) {
        setLevelInfo(getLevelInfo(profile.total_xp));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleNewWorkout = () => {
    navigation.navigate('ActiveWorkoutScreen');
  };

  const handleSetGoal = () => {
    navigation.navigate('GoalSettingScreen');
  };

  const handleWorkoutPress = (workoutId: string) => {
    navigation.navigate('WorkoutDetailScreen', { workoutId });
  };

  // Cycle through colors for workout cards
  const accentColors = [colors.purple, colors.pink, colors.teal, colors.orange];

  if (loading) {
    return <LoadingState />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.appTitle, { color: colors.textPrimary }]}>FitTrack</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>Let's crush your goals today</Text>
      </View>

      {/* XP Progress Bar */}
      {levelInfo && (
        <View style={styles.xpSection}>
          <XPProgressBar levelInfo={levelInfo} />
        </View>
      )}

      {/* Weekly Stats Cards */}
      <View style={styles.statsRow}>
        <StatCard
          title="Workouts"
          value={weeklyWorkouts.toString()}
          subtitle="This week"
          icon={<GradientIcon iconName="barbell" gradientColors={colors.gradientCyanBlue} />}
        />
        <StatCard
          title="Minutes"
          value={weeklyMinutes.toString()}
          subtitle="This week"
          icon={<GradientIcon iconName="timer-outline" gradientColors={colors.gradientPinkPurple} />}
        />
      </View>

      {/* Quick Start Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flash" size={20} color={colors.orange} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
        </View>
        <View style={styles.quickStartRow}>
          <ActionButton
            title="New Workout"
            icon="barbell"
            onPress={handleNewWorkout}
            gradientColors={colors.gradientTealGreen}
          />
          <ActionButton
            title="Set Goal"
            icon="flag"
            onPress={handleSetGoal}
            gradientColors={colors.gradientOrange}
          />
        </View>
      </View>

      {/* Recent Workouts Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flame" size={20} color={colors.pink} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Workouts</Text>
        </View>
        {workouts.length === 0 ? (
          <EmptyState
            title="No Workouts"
            message="No workouts yet. Start your first workout!"
            actionLabel="New Workout"
            onAction={handleNewWorkout}
          />
        ) : (
          <View style={styles.workoutsList}>
            {workouts.map((workout, index) => (
              <WorkoutHistoryCard
                key={workout.id}
                workout={workout}
                onPress={() => handleWorkoutPress(workout.id)}
                accentColor={accentColors[index % accentColors.length]}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  appTitle: {
    ...typography.largeTitle,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.body,
  },
  xpSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  statCardWrapper: {
    flex: 1,
  },
  gradientCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.title2,
  },
  quickStartRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  workoutsList: {
    gap: spacing.md,
  },
});
