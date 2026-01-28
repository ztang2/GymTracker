import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import type { ProgressScreenProps } from '../navigation/types';
import {
  StatCard,
  TimeRangeSelector,
  DailyProgressBar,
  GoalProgressCard,
  LoadingState,
  EmptyState,
} from '../components';
import type { DayProgress } from '../components/DailyProgressBar';
import type { Goal } from '../components/GoalProgressCard';
import {
  getWorkoutStatsByRange,
  getDailyWorkoutCounts,
  getTotalVolume,
  getDateRangeForTimeRange,
} from '../services/statsService';
import type { TimeRange, WorkoutStats } from '../services/types';
import { colors, typography, spacing } from '../constants/theme';

export default function ProgressScreen({ navigation }: ProgressScreenProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<DayProgress[]>([]);
  const [monthlyGoals, setMonthlyGoals] = useState<Goal[]>([]);
  const [totalVolume, setTotalVolume] = useState(0);

  const userId = 'test-user-123';

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      const { startDate, endDate } = getDateRangeForTimeRange(selectedRange);

      // Fetch stats and daily counts
      const [stats, dailyCounts, volume] = await Promise.all([
        getWorkoutStatsByRange(userId, selectedRange),
        getDailyWorkoutCounts(userId, startDate, endDate),
        getTotalVolume(userId, startDate, endDate),
      ]);

      setWorkoutStats(stats);
      setTotalVolume(volume);

      // Build weekly progress data (last 7 days)
      const today = new Date();
      const weekData: DayProgress[] = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = dailyCounts.find(d => d.date === dateStr);

        weekData.push({
          day: dayNames[date.getDay()],
          date: date.getDate(),
          completed: (dayData?.count || 0) > 0,
          workoutCount: dayData?.count || 0,
        });
      }
      setWeeklyProgress(weekData);

      // Build monthly goals (hardcoded for now)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
      const monthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

      // Count workouts this month
      const monthWorkouts = dailyCounts.filter(d => d.date >= monthStart && d.date <= monthEnd && d.count > 0).length;

      setMonthlyGoals([
        {
          title: 'Workout Days',
          current: monthWorkouts,
          target: 20,
          color: colors.teal,
        },
        {
          title: 'Total Volume',
          current: Math.round(volume),
          target: 10000,
          color: colors.orange,
          unit: 'kg',
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress data');
      console.error('Progress fetch error:', err);
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

  if (loading && !refreshing) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Error Loading Progress"
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
          message="Start tracking your workouts to see your progress here."
          actionLabel="Start Your First Workout"
          onAction={() => {
            navigation.navigate('HomeTab' as any);
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
        <Text style={styles.headerTitle}>Progress</Text>
        <Text style={styles.headerSubtitle}>Monitor your journey</Text>
      </View>

      {/* Time Range Selector */}
      <TimeRangeSelector selectedRange={selectedRange} onSelectRange={onRangeChange} />

      {/* This Week Progress */}
      {weeklyProgress.length > 0 && (
        <View style={styles.section}>
          <DailyProgressBar weekData={weeklyProgress} title="This Week" />
        </View>
      )}

      {/* Monthly Goals */}
      {monthlyGoals.length > 0 && (
        <View style={styles.section}>
          <GoalProgressCard goals={monthlyGoals} title="Monthly Goals" />
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
              title="This Month"
              value={workoutStats.workouts_this_month}
              subtitle="Last 30 days"
              variant="gradient"
              gradientColors={colors.gradientTealGreen}
            />
          </View>

          <View style={styles.metricRow}>
            <StatCard
              title="Avg Duration"
              value={`${workoutStats.avg_workout_duration} min`}
              subtitle="Per workout"
            />
            <StatCard
              title="Total Time"
              value={`${Math.round(workoutStats.total_duration_minutes / 60)} hrs`}
              subtitle={`${workoutStats.total_duration_minutes} min`}
            />
          </View>
        </View>
      </View>

      {/* Bottom padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: spacing.xl,
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
  bottomPadding: {
    height: spacing.xxl,
  },
});
