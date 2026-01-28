import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StatCard, TimeRangeSelector, WorkoutTrendChart, LoadingState } from '../components';
import { getExerciseProgress, getDateRangeForTimeRange } from '../services/statsService';
import { getExerciseById } from '../services/exerciseService';
import { TimeRange, ExerciseProgress, Exercise } from '../services/types';
import { colors, typography, spacing, getCategoryColor, borderRadius } from '../constants/theme';

type ExerciseProgressScreenRouteProp = RouteProp<
  { ExerciseProgressScreen: { exerciseId: string } },
  'ExerciseProgressScreen'
>;

interface ExerciseProgressScreenProps {
  route: ExerciseProgressScreenRouteProp;
}

const ExerciseProgressScreen: React.FC<ExerciseProgressScreenProps> = ({ route }) => {
  const { exerciseId } = route.params;
  const [selectedRange, setSelectedRange] = useState<TimeRange>('3months');
  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [progressData, setProgressData] = useState<ExerciseProgress[]>([]);

  const userId = 'test-user-123';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { startDate, endDate } = getDateRangeForTimeRange(selectedRange);

        const [exerciseData, progress] = await Promise.all([
          getExerciseById(exerciseId),
          getExerciseProgress(userId, exerciseId, startDate, endDate),
        ]);

        setExercise(exerciseData);
        setProgressData(progress);
      } catch (err) {
        console.error('Failed to load exercise progress:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [exerciseId, selectedRange]);

  if (loading) {
    return <LoadingState message="Loading exercise progress..." />;
  }

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Exercise not found</Text>
      </View>
    );
  }

  // Calculate stats
  const totalWorkouts = progressData.length;
  const totalVolume = progressData.reduce((sum, p) => sum + p.total_volume, 0);
  const totalReps = progressData.reduce((sum, p) => sum + p.total_reps, 0);
  const maxWeight = Math.max(...progressData.map(p => p.max_weight), 0);
  const avgWeight = totalWorkouts > 0
    ? progressData.reduce((sum, p) => sum + p.max_weight, 0) / totalWorkouts
    : 0;

  const categoryColor = getCategoryColor(
    exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)
  );

  return (
    <ScrollView style={styles.container}>
      {/* Exercise Info */}
      <View style={styles.infoCard}>
        <View style={styles.headerRow}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryText}>
              {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}
            </Text>
          </View>
        </View>

        {exercise.description && (
          <Text style={styles.description}>{exercise.description}</Text>
        )}
      </View>

      {/* Time Range Selector */}
      <View style={styles.section}>
        <TimeRangeSelector
          selectedRange={selectedRange}
          onSelectRange={setSelectedRange}
          ranges={['month', '3months', 'year', 'all']}
        />
      </View>

      {/* Statistics Grid */}
      <View style={styles.section}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricRow}>
            <StatCard
              title="Total Workouts"
              value={totalWorkouts}
              variant="gradient"
              gradientColors={colors.gradientPurplePink}
            />
            <StatCard
              title="Max Weight"
              value={`${maxWeight} kg`}
              subtitle="Personal record"
              variant="gradient"
              gradientColors={colors.gradientOrange}
            />
          </View>

          <View style={styles.metricRow}>
            <StatCard
              title="Total Volume"
              value={`${Math.round(totalVolume)} kg`}
              subtitle="All sets combined"
            />
            <StatCard
              title="Total Reps"
              value={totalReps}
              subtitle="All time"
            />
          </View>

          <View style={styles.metricRow}>
            <StatCard
              title="Avg Weight"
              value={`${Math.round(avgWeight)} kg`}
              subtitle="Per workout"
            />
            <StatCard
              title="Frequency"
              value={`${(totalWorkouts / (selectedRange === 'month' ? 4 : selectedRange === '3months' ? 12 : 52)).toFixed(1)}/wk`}
              subtitle="Average"
            />
          </View>
        </View>
      </View>

      {/* Progress Chart */}
      {progressData.length > 0 && (
        <View style={styles.section}>
          <View style={styles.card}>
            <WorkoutTrendChart
              title="Max Weight Progress"
              data={progressData.map(p => ({
                label: p.date.substring(5), // MM-DD
                value: p.max_weight,
              }))}
            />
          </View>
        </View>
      )}

      {progressData.length === 0 && (
        <View style={styles.section}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No workout data for this exercise in the selected time range.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.cardBackground,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  exerciseName: {
    ...typography.title,
    flex: 1,
    marginRight: spacing.md,
  },
  categoryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
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
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  emptyCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.callout,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    ...typography.headline,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});

export default ExerciseProgressScreen;
