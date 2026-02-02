import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
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
import { getWorkoutsByDateRange, batchGetWorkoutSessions } from '../services/workoutService';
import { typography, spacing } from '../constants/theme';
import { useAuth , useTheme } from '../contexts';
import { useWeightUnit } from '../hooks';
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
  const { unit, convert, formatWeight } = useWeightUnit();
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
  const cacheKey = `@liftarc_progress_${userId}`;
  const cacheLoaded = useRef(false);

  // Restore cached data on first mount (instant display)
  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const data = JSON.parse(cached);
          setSummaryCards(data.summaryCards || []);
          setWeeklyActivity(data.weeklyActivity || []);
          setMonthlyOverview(data.monthlyOverview || []);
          setVolumeTrend(data.volumeTrend || []);
          setRecentPRs(data.recentPRs || []);
          setMuscleGroups(data.muscleGroups || []);
          setHasAnyData(data.hasAnyData || false);
          // Show cached data immediately, skip loading spinner
          if (data.hasAnyData) {
            setLoading(false);
          }
          cacheLoaded.current = true;
        }
      } catch (e) {
        // Cache miss is fine, just show loading
      }
    })();
  }, [cacheKey]);

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

      // ========== BATCH LOAD all workout details in 3 queries ==========
      const workoutDetailsMap = await batchGetWorkoutSessions(
        allWorkouts.map(w => w.id),
        userId
      );

      // Helper: get volume and time from cached details
      const getStatsForWorkouts = (workouts: typeof allWorkouts) => {
        let volume = 0;
        let time = 0;
        for (const w of workouts) {
          const full = workoutDetailsMap.get(w.id);
          if (full) {
            time += full.duration_minutes || 0;
            for (const exercise of full.exercises) {
              for (const set of exercise.sets) {
                volume += set.reps * (set.weight_kg || 0);
              }
            }
          }
        }
        return { volume, time };
      };

      // ========== SUMMARY CARDS ==========
      const thisWeekWorkouts = allWorkouts.filter(w => w.date >= thisWeekStart);
      const lastWeekWorkouts = allWorkouts.filter(
        w => w.date >= lastWeekStart && w.date <= lastWeekEnd
      );

      const thisWeekStats = getStatsForWorkouts(thisWeekWorkouts);
      const lastWeekStats = getStatsForWorkouts(lastWeekWorkouts);
      const thisWeekVolume = thisWeekStats.volume;
      const thisWeekTime = thisWeekStats.time;
      const lastWeekVolume = lastWeekStats.volume;
      const lastWeekTime = lastWeekStats.time;

      // Build summary cards
      const workoutComparison = thisWeekWorkouts.length - lastWeekWorkouts.length;
      const volumeComparison = Math.round(thisWeekVolume - lastWeekVolume);
      const timeComparison = thisWeekTime - lastWeekTime;

      const summaryCards_new: SummaryCardData[] = [
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
          value: Math.round(convert(thisWeekVolume)),
          unit,
          comparison: {
            value: Math.round(convert(volumeComparison)),
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
      ];
      setSummaryCards(summaryCards_new);

      // ========== WEEKLY ACTIVITY CHART ==========
      const weeklyData: DayActivityData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = subtractDays(today, i);
        const dateStr = formatISODate(date);
        const dayWorkouts = allWorkouts.filter(w => w.date === dateStr);
        const dayStats = getStatsForWorkouts(dayWorkouts);

        weeklyData.push({
          day: getDayOfWeek(date),
          date: date.getDate(),
          volume: Math.round(convert(dayStats.volume)),
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
      // Fetch older workouts (weeks 2-12) that aren't in allWorkouts (which only covers 30 days)
      const allWorkoutsForTrend = twelveWeeksStart < monthStart
        ? await getWorkoutsByDateRange(userId, twelveWeeksStart, monthStart)
        : [];
      // Batch-load any missing older workout details
      const olderMissing = allWorkoutsForTrend.filter(w => !workoutDetailsMap.has(w.id));
      if (olderMissing.length > 0) {
        const olderDetails = await batchGetWorkoutSessions(
          olderMissing.map(w => w.id),
          userId
        );
        olderDetails.forEach((v, k) => workoutDetailsMap.set(k, v));
      }
      const combinedWorkouts = [...allWorkoutsForTrend, ...allWorkouts];

      const volumeData: WeekVolumeData[] = [];
      for (let weekNum = 11; weekNum >= 0; weekNum--) {
        const weekEnd = subtractDays(today, weekNum * 7);
        const weekStart = subtractDays(weekEnd, 6);
        const weekStartStr = formatISODate(weekStart);
        const weekEndStr = formatISODate(weekEnd);

        const weekWorkouts = combinedWorkouts.filter(
          w => w.date >= weekStartStr && w.date <= weekEndStr
        );
        const weekStats = getStatsForWorkouts(weekWorkouts);

        volumeData.push({
          week: formatDate(weekStart, 'MMM DD'),
          volume: Math.round(convert(weekStats.volume)),
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
            value = formatWeight(pr.value);
            break;
          case 'max_reps':
            recordType = 'Max Reps';
            value = `${pr.value} reps`;
            break;
          case 'estimated_1rm':
            recordType = 'Est. 1RM';
            value = formatWeight(pr.value);
            break;
          case 'max_volume':
            recordType = 'Max Volume';
            value = `${Math.round(convert(pr.value)).toLocaleString()} ${unit}`;
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

      // Save to cache for instant next load
      try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
          summaryCards: summaryCards_new,
          weeklyActivity: weeklyData,
          monthlyOverview: weeks,
          volumeTrend: volumeData,
          recentPRs: prsWithRecency,
          muscleGroups: muscleData,
          hasAnyData: allWorkouts.length > 0,
          cachedAt: Date.now(),
        }));
      } catch (_) { /* cache write failure is non-critical */ }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress data');
      console.error('Progress fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, cacheKey]);

  // Use useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // If we have cached data already showing, don't show loading spinner
      if (!cacheLoaded.current) {
        setLoading(true);
      }
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
          title="No Progress Data Yet"
          message="Complete a few workouts to see your trends and analytics"
          actionLabel="Start Your First Workout"
          onAction={() => {
            navigation.navigate('HomeTab' as any);
          }}
          icon={
            <View style={styles.emptyIcon}>
              <Ionicons name="bar-chart" size={64} color={colors.purple} />
            </View>
          }
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
        <Text style={[styles.headerTitle, { color: colors.purple }]} accessibilityRole="header">Progress</Text>
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
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
