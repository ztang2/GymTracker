import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
          gradientColors={colors.gradientPurplePink}
        />
        <StatCard
          title="Minutes"
          value={weeklyMinutes.toString()}
          subtitle="This week"
          gradientColors={[colors.pink, colors.pinkLight]}
        />
      </View>

      {/* Quick Start Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Start</Text>
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
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Workouts</Text>
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
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.title2,
    marginBottom: spacing.lg,
  },
  quickStartRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  workoutsList: {
    gap: spacing.md,
  },
});
