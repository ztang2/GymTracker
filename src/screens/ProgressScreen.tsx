import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { ProgressScreenProps } from '../navigation/types';
import {
  SummaryCardRow,
  WeeklyActivityChart,
  MonthlyOverview,
  VolumeTrendChart,
  RecentPRsList,
  MuscleGroupDistribution,
  LoadingState,
  EmptyState,
} from '../components';
import type { SummaryCardData } from '../components/SummaryCardRow';
import type { DayActivityData } from '../components/WeeklyActivityChart';
import type { WeekOverviewData } from '../components/MonthlyOverview';
import type { WeekVolumeData } from '../components/VolumeTrendChart';
import type { PRDisplayData } from '../components/RecentPRsList';
import type { CategoryWorkoutData } from '../components/MuscleGroupDistribution';
import {
  getDailyWorkoutCounts,
  getCategoryDistribution,
} from '../services/statsService';
import { getUserPRs } from '../services/prService';
import { getWorkoutsByDateRange, getWorkoutSession } from '../services/workoutService';
import { typography, spacing } from '../constants/theme';
import { useAuth , useTheme } from '../contexts';
import {
  formatISODate,
  parseISODate,
  subtractDays,
  getToday,
  getDayOfWeek,
  formatDate,
} from '../utils/dateUtils';

export default function ProgressScreen({ navigation }: ProgressScreenProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [summaryCards, setSummaryCards] = useState<SummaryCardData[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<DayActivityData[]>([]);
  const [monthlyOverview, setMonthlyOverview] = useState<WeekOverviewData[]>([]);
  const [volumeTrend, setVolumeTrend] = useState<WeekVolumeData[]>([]);
  const [recentPRs, setRecentPRs] = useState<PRDisplayData[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<CategoryWorkoutData[]>([]);
  const [hasAnyData, setHasAnyData] = useState(false);

  const userId = user!.id;

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      const today = getToday();
      const todayStr = formatISODate(today);

      // Date ranges
      const thisWeekStart = formatISODate(subtractDays(today, 6)); // Last 7 days
      const lastWeekStart = formatISODate(subtractDays(today, 13));
      const lastWeekEnd = formatISODate(subtractDays(today, 7));
      const monthStart = formatISODate(subtractDays(today, 29)); // Last 30 days
      const twelveWeeksStart = formatISODate(subtractDays(today, 84)); // Last 12 weeks

      // Fetch all workouts for last 30 days
      const allWorkouts = await getWorkoutsByDateRange(userId, monthStart, todayStr);
      setHasAnyData(allWorkouts.length > 0);

      // ========== SUMMARY CARDS ==========
      const thisWeekWorkouts = allWorkouts.filter(w => w.date >= thisWeekStart);
      const lastWeekWorkouts = allWorkouts.filter(
        w => w.date >= lastWeekStart && w.date <= lastWeekEnd
      );

      // Calculate this week's stats
      let thisWeekVolume = 0;
      let thisWeekTime = 0;
      for (const workout of thisWeekWorkouts) {
        const fullWorkout = await getWorkoutSession(workout.id, userId);
        if (fullWorkout) {
          thisWeekTime += fullWorkout.duration_minutes || 0;
          for (const exercise of fullWorkout.exercises) {
            for (const set of exercise.sets) {
              thisWeekVolume += set.reps * (set.weight_kg || 0);
            }
          }
        }
      }

      // Calculate last week's stats
      let lastWeekVolume = 0;
      let lastWeekTime = 0;
      for (const workout of lastWeekWorkouts) {
        const fullWorkout = await getWorkoutSession(workout.id, userId);
        if (fullWorkout) {
          lastWeekTime += fullWorkout.duration_minutes || 0;
          for (const exercise of fullWorkout.exercises) {
            for (const set of exercise.sets) {
              lastWeekVolume += set.reps * (set.weight_kg || 0);
            }
          }
        }
      }

      // Build summary cards
      const workoutComparison = thisWeekWorkouts.length - lastWeekWorkouts.length;
      const volumeComparison = Math.round(thisWeekVolume - lastWeekVolume);
      const timeComparison = thisWeekTime - lastWeekTime;

      setSummaryCards([
        {
          label: 'Workouts',
          value: thisWeekWorkouts.length,
          comparison: {
            value: workoutComparison,
            trend: workoutComparison > 0 ? 'up' : workoutComparison < 0 ? 'down' : 'neutral',
          },
        },
        {
          label: 'Volume',
          value: Math.round(thisWeekVolume),
          unit: 'kg',
          comparison: {
            value: volumeComparison,
            trend: volumeComparison > 0 ? 'up' : volumeComparison < 0 ? 'down' : 'neutral',
          },
        },
        {
          label: 'Time',
          value: thisWeekTime,
          unit: 'min',
          comparison: {
            value: timeComparison,
            trend: timeComparison > 0 ? 'up' : timeComparison < 0 ? 'down' : 'neutral',
          },
        },
      ]);

      // ========== WEEKLY ACTIVITY CHART ==========
      const weeklyData: DayActivityData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = subtractDays(today, i);
        const dateStr = formatISODate(date);
        const dayWorkouts = allWorkouts.filter(w => w.date === dateStr);

        let dayVolume = 0;
        for (const workout of dayWorkouts) {
          const fullWorkout = await getWorkoutSession(workout.id, userId);
          if (fullWorkout) {
            for (const exercise of fullWorkout.exercises) {
              for (const set of exercise.sets) {
                dayVolume += set.reps * (set.weight_kg || 0);
              }
            }
          }
        }

        weeklyData.push({
          day: getDayOfWeek(date),
          date: date.getDate(),
          volume: Math.round(dayVolume),
          workoutCount: dayWorkouts.length,
          isToday: i === 0,
        });
      }
      setWeeklyActivity(weeklyData);

      // ========== MONTHLY OVERVIEW (last 4 weeks) ==========
      const weeks: WeekOverviewData[] = [];
      const weekLabels = ['This Week', 'Last Week', '2 Weeks Ago', '3 Weeks Ago'];

      for (let weekIndex = 0; weekIndex < 4; weekIndex++) {
        const days: boolean[] = [];
        let totalWorkouts = 0;

        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const date = subtractDays(today, weekIndex * 7 + dayOffset);
          const dateStr = formatISODate(date);
          const dayWorkouts = allWorkouts.filter(w => w.date === dateStr);
          const hasWorkout = dayWorkouts.length > 0;
          
          days.unshift(hasWorkout); // Add to front to get Mon-Sun order
          if (hasWorkout) totalWorkouts += dayWorkouts.length;
        }

        weeks.push({
          label: weekLabels[weekIndex],
          days,
          totalWorkouts,
        });
      }
      setMonthlyOverview(weeks);

      // ========== VOLUME TREND (last 12 weeks) ==========
      const volumeData: WeekVolumeData[] = [];
      for (let weekNum = 11; weekNum >= 0; weekNum--) {
        const weekEnd = subtractDays(today, weekNum * 7);
        const weekStart = subtractDays(weekEnd, 6);
        const weekStartStr = formatISODate(weekStart);
        const weekEndStr = formatISODate(weekEnd);

        const weekWorkouts = await getWorkoutsByDateRange(userId, weekStartStr, weekEndStr);
        
        let weekVolume = 0;
        for (const workout of weekWorkouts) {
          const fullWorkout = await getWorkoutSession(workout.id, userId);
          if (fullWorkout) {
            for (const exercise of fullWorkout.exercises) {
              for (const set of exercise.sets) {
                weekVolume += set.reps * (set.weight_kg || 0);
              }
            }
          }
        }

        volumeData.push({
          week: formatDate(weekStart, 'MMM DD'),
          volume: Math.round(weekVolume),
          weekNumber: 11 - weekNum,
        });
      }
      setVolumeTrend(volumeData);

      // ========== RECENT PRS ==========
      const allPRs = await getUserPRs(userId);
      
      // Determine recency (gold = this week, silver = this month, bronze = older)
      const prsWithRecency: PRDisplayData[] = allPRs.slice(0, 5).map(pr => {
        const prDate = parseISODate(pr.achieved_at.split('T')[0]);
        const daysSince = Math.floor((today.getTime() - prDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let recency: 'gold' | 'silver' | 'bronze';
        if (daysSince <= 7) recency = 'gold';
        else if (daysSince <= 30) recency = 'silver';
        else recency = 'bronze';

        // Format record type
        let recordType = '';
        let value = '';
        switch (pr.record_type) {
          case 'max_weight':
            recordType = 'Max Weight';
            value = `${pr.value.toFixed(1)} kg`;
            break;
          case 'max_reps':
            recordType = 'Max Reps';
            value = `${pr.value} reps`;
            break;
          case 'estimated_1rm':
            recordType = 'Est. 1RM';
            value = `${pr.value.toFixed(1)} kg`;
            break;
          case 'max_volume':
            recordType = 'Max Volume';
            value = `${pr.value.toLocaleString()} kg`;
            break;
        }

        return {
          id: pr.id,
          exerciseName: (pr.exercise as any)?.name || 'Unknown Exercise',
          recordType,
          value,
          date: pr.achieved_at.split('T')[0],
          recency,
        };
      });
      setRecentPRs(prsWithRecency);

      // ========== MUSCLE GROUP DISTRIBUTION ==========
      const distribution = await getCategoryDistribution(userId, monthStart, todayStr);
      const muscleData: CategoryWorkoutData[] = distribution.map(d => ({
        category: d.category.charAt(0).toUpperCase() + d.category.slice(1),
        count: d.count,
        percentage: d.percentage,
      }));
      setMuscleGroups(muscleData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress data');
      console.error('Progress fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  // Use useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [fetchData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
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

  if (!hasAnyData) {
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.purpleLight}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress</Text>
        <Text style={styles.headerSubtitle}>Your fitness journey at a glance</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.section}>
        <SummaryCardRow cards={summaryCards} />
      </View>

      {/* Weekly Activity Chart */}
      <View style={styles.section}>
        <WeeklyActivityChart weekData={weeklyActivity} />
      </View>

      {/* Monthly Overview */}
      <View style={styles.section}>
        <MonthlyOverview weeks={monthlyOverview} />
      </View>

      {/* Volume Trend */}
      <View style={styles.section}>
        <VolumeTrendChart data={volumeTrend} />
      </View>

      {/* Recent PRs */}
      <View style={styles.section}>
        <RecentPRsList prs={recentPRs} />
      </View>

      {/* Muscle Group Distribution */}
      <View style={styles.section}>
        <MuscleGroupDistribution data={muscleGroups} />
      </View>

      {/* Bottom padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
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
    marginBottom: spacing.lg,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
