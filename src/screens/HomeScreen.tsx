import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
  Platform,
  TouchableOpacity,
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
  batchGetWorkoutSessions,
  type WorkoutSession,
  type WorkoutSessionWithExercises,
  type LevelInfo,
} from '../services';
import {
  StatCard,
  ActionButton,
  WorkoutHistoryCard,
  RecentWorkoutCard,
  LoadingState,
  EmptyState,
  XPProgressBar,
  AnimatedCard,
} from '../components';
import { useAuth, useTheme } from '../contexts';
import { typography, spacing } from '../constants/theme';
import { colorGlow } from '../utils';

// Gradient Icon component with pulse animation
interface GradientIconProps {
  iconName: keyof typeof Ionicons.glyphMap;
  gradientColors: readonly [string, string, ...string[]];
}

function GradientIcon({ iconName, gradientColors }: GradientIconProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  // Use the first gradient color as the glow color
  const glowColor = gradientColors[0] as string;

  useEffect(() => {
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
        style={[styles.gradientCircle, colorGlow(glowColor, 'md')]}
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
  const [detailedWorkouts, setDetailedWorkouts] = useState<WorkoutSessionWithExercises[]>([]);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasAnyWorkouts, setHasAnyWorkouts] = useState(true);
  const [showAllWorkouts, setShowAllWorkouts] = useState(false);

  const INITIAL_DISPLAY_COUNT = 5;
  const FETCH_LIMIT = 15;

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
        getRecentWorkouts(user.id, FETCH_LIMIT),
        getWorkoutStatsByRange(user.id, 'week'),
        getUserProfile(user.id),
      ]);

      setWorkouts(recent);
      setWeeklyWorkouts(stats.total_workouts);
      setWeeklyMinutes(stats.total_duration_minutes);
      setHasAnyWorkouts(recent.length > 0 || stats.total_workouts > 0);

      // Batch-fetch detailed workout data (exercises + sets) for rich cards
      if (recent.length > 0) {
        const sessionIds = recent.map((w) => w.id);
        const detailMap = await batchGetWorkoutSessions(sessionIds, user.id);
        // Preserve chronological (descending) order from recent
        const ordered = sessionIds
          .map((id) => detailMap.get(id))
          .filter((w): w is WorkoutSessionWithExercises => w != null);
        setDetailedWorkouts(ordered);
      } else {
        setDetailedWorkouts([]);
      }

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

  // Show welcoming empty state for brand new users
  if (!hasAnyWorkouts) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.appTitle, { color: colors.purple }]} accessibilityRole="header">LiftArc</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>Welcome to your fitness journey!</Text>
        </View>

        {/* Welcoming Empty State */}
        <EmptyState
          title="Start Your Journey"
          message="Log your first workout to see your stats here"
          actionLabel="Start Workout"
          onAction={handleNewWorkout}
          icon={<GradientIcon iconName="barbell" gradientColors={colors.gradientPurplePink} />}
        />

        {/* Quick Actions for New Users */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderStandalone}>
            <Ionicons name="flash" size={20} color={colors.orange} accessible={false} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]} accessibilityRole="header">Quick Actions</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            <ActionButton
              title="Quick Start"
              icon="flash"
              onPress={handleNewWorkout}
              gradientColors={colors.gradientTealGreen}
            />
            <ActionButton
              title="Browse Exercises"
              icon="list"
              onPress={() => navigation.navigate('ExerciseListScreen')}
              gradientColors={colors.gradientPurplePink}
            />
          </View>
          <View style={styles.quickActionsGridRow}>
            <ActionButton
              title="Use Template"
              icon="document-text"
              onPress={() => navigation.navigate('TemplateListScreen')}
              gradientColors={colors.gradientOrange}
            />
            <ActionButton
              title="Set Goal"
              icon="flag"
              onPress={handleSetGoal}
              gradientColors={colors.gradientCyanBlue}
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.appTitle, { color: colors.purple }]} accessibilityRole="header">LiftArc</Text>
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
        <AnimatedCard index={0} style={{ flex: 1 }}>
          <StatCard
            title="Workouts"
            value={weeklyWorkouts.toString()}
            subtitle="This week"
            icon={<GradientIcon iconName="barbell" gradientColors={colors.gradientCyanBlue} />}
          />
        </AnimatedCard>
        <AnimatedCard index={1} style={{ flex: 1 }}>
          <StatCard
            title="Minutes"
            value={weeklyMinutes.toString()}
            subtitle="This week"
            icon={<GradientIcon iconName="timer-outline" gradientColors={colors.gradientPinkPurple} />}
          />
        </AnimatedCard>
      </View>

      {/* Quick Actions Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderStandalone}>
          <Ionicons name="flash" size={20} color={colors.orange} accessible={false} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]} accessibilityRole="header">Quick Actions</Text>
        </View>
        <View style={styles.quickActionsGrid}>
          <ActionButton
            title="Quick Start"
            icon="flash"
            onPress={handleNewWorkout}
            gradientColors={colors.gradientTealGreen}
          />
          <ActionButton
            title="Browse Exercises"
            icon="list"
            onPress={() => navigation.navigate('ExerciseListScreen')}
            gradientColors={colors.gradientPurplePink}
          />
        </View>
        <View style={styles.quickActionsGridRow}>
          <ActionButton
            title="Use Template"
            icon="document-text"
            onPress={() => navigation.navigate('TemplateListScreen')}
            gradientColors={colors.gradientOrange}
          />
          <ActionButton
            title="Set Goal"
            icon="flag"
            onPress={handleSetGoal}
            gradientColors={colors.gradientCyanBlue}
          />
        </View>
      </View>

      {/* Recent Workouts Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flame" size={20} color={colors.pink} accessible={false} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]} accessibilityRole="header">Recent Workouts</Text>
          </View>
          {detailedWorkouts.length > INITIAL_DISPLAY_COUNT && (
            <TouchableOpacity
              onPress={() => setShowAllWorkouts((prev) => !prev)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.viewAllText, { color: colors.purple }]}>
                {showAllWorkouts ? 'Show Less' : 'View All'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {detailedWorkouts.length === 0 ? (
          <View style={styles.emptyWorkoutsContainer}>
            <Text style={[styles.emptyWorkoutsText, { color: colors.textSecondary }]}>
              No workouts this week yet. Start one to see it here!
            </Text>
          </View>
        ) : (
          <View style={styles.workoutsList}>
            {(showAllWorkouts
              ? detailedWorkouts
              : detailedWorkouts.slice(0, INITIAL_DISPLAY_COUNT)
            ).map((workout, index) => (
              <AnimatedCard key={workout.id} index={index} delay={200} staggerMs={60}>
                <RecentWorkoutCard
                  workout={workout}
                  onPress={() => handleWorkoutPress(workout.id)}
                  accentColor={accentColors[index % accentColors.length]}
                />
              </AnimatedCard>
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
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionHeaderStandalone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.title2,
  },
  viewAllText: {
    ...typography.callout,
    fontWeight: '600',
  },
  quickStartRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  quickActionsGridRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  workoutsList: {
    gap: spacing.md,
  },
  emptyWorkoutsContainer: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  emptyWorkoutsText: {
    ...typography.body,
    textAlign: 'center',
  },
});
