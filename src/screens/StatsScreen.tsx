import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import {
  StatCard,
  TimeRangeSelector,
  ContributionCalendar,
  WorkoutTrendChart,
  CategoryChart,
  ExerciseFrequencyList,
  LoadingState,
  EmptyState,
} from '../components';
import {
  getWorkoutStatsByRange,
  getCalendarData,
  getTotalVolume,
  getCategoryDistribution,
  getMostFrequentExercises,
  getWeeklyWorkoutCounts,
  getDateRangeForTimeRange,
} from '../services/statsService';
import { TimeRange, WorkoutStats, CalendarData, CategoryDistribution, ExerciseFrequency, WeeklyCount } from '../services/types';
import { useAuth , useTheme } from '../contexts';
import { typography, spacing ,  type ThemeColors } from '../constants/theme';

const StatsScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { user } = useAuth();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [totalVolume, setTotalVolume] = useState(0);
  const [categoryDist, setCategoryDist] = useState<CategoryDistribution[]>([]);
  const [frequentExercises, setFrequentExercises] = useState<ExerciseFrequency[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyCount[]>([]);

  if (!user) return;
    const userId = user.id;

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      const { startDate, endDate } = getDateRangeForTimeRange(selectedRange);

      // Fetch all data in parallel
      const [
        stats,
        calendar,
        volume,
        categories,
        exercises,
        weekly,
      ] = await Promise.all([
        getWorkoutStatsByRange(userId, selectedRange),
        getCalendarData(userId, 26), // Last 26 weeks
        getTotalVolume(userId, startDate, endDate),
        getCategoryDistribution(userId, startDate, endDate),
        getMostFrequentExercises(userId, startDate, endDate, 10),
        getWeeklyWorkoutCounts(userId, startDate, endDate),
      ]);

      setWorkoutStats(stats);
      setCalendarData(calendar);
      setTotalVolume(volume);
      setCategoryDist(categories);
      setFrequentExercises(exercises);
      setWeeklyData(weekly);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRange, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const onRangeChange = (range: TimeRange) => {
    setSelectedRange(range);
    setLoading(true);
  };

  const onExercisePress = (exerciseId: string) => {
    // TODO: Navigate to ExerciseProgressScreen
  };

  if (loading && !refreshing) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Error Loading Stats"
          message={error}
          actionLabel="Retry"
          onAction={fetchData}
        />
      </View>
    );
  }

  if (!workoutStats || workoutStats.total_workouts === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="No Workout Data"
          message="Start tracking your workouts to see your progress and statistics here."
          actionLabel="Start Your First Workout"
          onAction={() => {
            // TODO: Navigate to Workout tab
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.purpleLight} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle} accessibilityRole="header">Progress</Text>
        <Text style={styles.headerSubtitle}>Monitor your journey</Text>
      </View>

      {/* Time Range Selector */}
      <TimeRangeSelector selectedRange={selectedRange} onSelectRange={onRangeChange} />

      {/* Contribution Calendar */}
      {calendarData && (
        <View style={styles.section}>
          <ContributionCalendar
            data={calendarData.days}
            currentStreak={calendarData.currentStreak}
            longestStreak={calendarData.longestStreak}
          />
        </View>
      )}

      {/* Key Metrics Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricRow}>
            <StatCard
              title="Total Workouts"
              value={workoutStats.total_workouts}
              variant="gradient"
              gradientColors={colors.gradientPurplePink}
            />
            <StatCard
              title="This Week"
              value={workoutStats.workouts_this_week}
              variant="gradient"
              gradientColors={colors.gradientTealGreen}
            />
          </View>

          <View style={styles.metricRow}>
            <StatCard
              title="Total Volume"
              value={`${totalVolume} kg`}
              subtitle="All time"
              variant="gradient"
              gradientColors={colors.gradientOrange}
            />
            <StatCard
              title="Avg Duration"
              value={`${workoutStats.avg_workout_duration} min`}
              subtitle="Per workout"
            />
          </View>

          <View style={styles.metricRow}>
            <StatCard
              title="This Month"
              value={workoutStats.workouts_this_month}
              subtitle={`${selectedRange === 'month' ? '30 days' : 'Current month'}`}
            />
            <StatCard
              title="Total Time"
              value={`${Math.round(workoutStats.total_duration_minutes / 60)} hrs`}
              subtitle={`${workoutStats.total_duration_minutes} minutes`}
            />
          </View>
        </View>
      </View>

      {/* Workout Trends Chart */}
      {weeklyData.length > 0 && (
        <View style={styles.section}>
          <View style={styles.card}>
            <WorkoutTrendChart
              title="Workout Frequency"
              data={weeklyData.map(w => ({
                label: w.week.split('-W')[1] || w.week.substring(0, 10),
                value: w.count,
              }))}
            />
          </View>
        </View>
      )}

      {/* Category Distribution */}
      {categoryDist.length > 0 && (
        <View style={styles.section}>
          <View style={styles.card}>
            <CategoryChart
              title="Exercise Categories"
              data={categoryDist}
              type="pie"
            />
          </View>
        </View>
      )}

      {/* Most Frequent Exercises */}
      {frequentExercises.length > 0 && (
        <View style={styles.section}>
          <ExerciseFrequencyList
            title="Top Exercises"
            exercises={frequentExercises}
            onExercisePress={onExercisePress}
          />
        </View>
      )}

      {/* Bottom padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.largeTitle,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.title2,
    marginBottom: spacing.lg,
  },
  metricsGrid: {
    gap: spacing.sm,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: spacing.xl,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});

export default StatsScreen;
