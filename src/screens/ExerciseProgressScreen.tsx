import React, { useState, useEffect } from 'react';
import { useWeightUnit } from '../hooks';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ExerciseProgressScreenProps } from '../navigation/types';
import type { HomeStackParamList } from '../navigation/types';
import {
  ExerciseProgressChart,
  LoadingState,
} from '../components';
import {
  getExerciseById,
  getExerciseHistory,
  getExerciseWeightProgression,
  getExerciseVolumeProgression,
  getExercisePRSummary,
  getExerciseStats,
  formatSetsForDisplay,
  calculateFrequencyPerWeek,
} from '../services';
import type {
  Exercise,
  PersonalRecord,
} from '../services/types';
import { useAuth, useTheme } from '../contexts';
import { typography, spacing, getCategoryColor, borderRadius } from '../constants/theme';
import { formatDate, parseISODate } from '../utils/dateUtils';

type NavigationProp = StackNavigationProp<HomeStackParamList>;

const ExerciseProgressScreen: React.FC<ExerciseProgressScreenProps> = ({ route }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { exerciseId } = route.params;
  const { user } = useAuth();
  const { unit } = useWeightUnit();
  const navigation = useNavigation<NavigationProp>();

  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [weightData, setWeightData] = useState<Array<{ date: string; value: number }>>([]);
  const [volumeData, setVolumeData] = useState<Array<{ date: string; value: number }>>([]);
  const [prs, setPRs] = useState<{
    maxWeight: PersonalRecord | null;
    maxReps: PersonalRecord | null;
    estimated1RM: PersonalRecord | null;
    maxVolume: PersonalRecord | null;
  }>({
    maxWeight: null,
    maxReps: null,
    estimated1RM: null,
    maxVolume: null,
  });
  const [stats, setStats] = useState<{
    timesPerformed: number;
    totalSets: number;
    totalReps: number;
    totalVolume: number;
    averageWeight: number;
    averageReps: number;
    averageSetsPerSession: number;
    firstPerformed: string | null;
    lastPerformed: string | null;
  } | null>(null);
  const [recentHistory, setRecentHistory] = useState<Array<{
    workoutId: string;
    date: string;
    sets: Array<{
      setNumber: number;
      weight: number;
      reps: number;
      completed: boolean;
    }>;
    maxWeight: number;
    totalVolume: number;
    totalReps: number;
  }>>([]);

  useEffect(() => {
    loadData();
  }, [exerciseId]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        exerciseData,
        history,
        weightProgression,
        volumeProgression,
        prSummary,
        exerciseStats,
      ] = await Promise.all([
        getExerciseById(exerciseId),
        getExerciseHistory(exerciseId, user.id),
        getExerciseWeightProgression(exerciseId, user.id),
        getExerciseVolumeProgression(exerciseId, user.id),
        getExercisePRSummary(exerciseId, user.id),
        getExerciseStats(exerciseId, user.id),
      ]);

      setExercise(exerciseData);
      setWeightData(weightProgression);
      setVolumeData(volumeProgression);
      setPRs(prSummary);
      setStats(exerciseStats);
      
      // Get last 10 sessions for recent history
      setRecentHistory(history.slice(0, 10));
    } catch (err) {
      console.error('Failed to load exercise progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryItemPress = (workoutId: string) => {
    navigation.navigate('WorkoutDetailScreen', { workoutId });
  };

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

  const categoryColor = getCategoryColor(
    exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)
  );

  const frequencyPerWeek = stats?.firstPerformed && stats?.lastPerformed
    ? calculateFrequencyPerWeek(
        stats.timesPerformed,
        stats.firstPerformed,
        stats.lastPerformed
      )
    : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Exercise Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
              <Text style={styles.categoryText}>
                {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.timesPerformed}>
          Performed {stats?.timesPerformed || 0} times
          {frequencyPerWeek > 0 && ` • ${frequencyPerWeek.toFixed(1)}x/week`}
        </Text>
      </View>

      {/* Weight Progress Chart */}
      <View style={styles.section}>
        <ExerciseProgressChart
          data={weightData}
          title="Weight Progress"
          unit={unit}
          color={colors.teal}
        />
      </View>

      {/* Volume Progress Chart */}
      <View style={styles.section}>
        <ExerciseProgressChart
          data={volumeData}
          title="Volume Progress"
          unit={unit}
          color={colors.purple}
        />
      </View>

      {/* Personal Records */}
      <View style={styles.section}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trophy" size={24} color={colors.orange} />
            <Text style={styles.cardTitle}>Personal Records</Text>
          </View>
          
          <View style={styles.prGrid}>
            {/* Max Weight */}
            <View style={styles.prItem}>
              <Text style={styles.prLabel}>Max Weight</Text>
              {prs.maxWeight ? (
                <>
                  <Text style={styles.prValue}>{prs.maxWeight.value.toFixed(1)} kg</Text>
                  <Text style={styles.prDate}>
                    {formatDate(parseISODate(prs.maxWeight.achieved_at), 'MMM DD')}
                  </Text>
                </>
              ) : (
                <Text style={styles.prEmpty}>—</Text>
              )}
            </View>

            {/* Max Reps */}
            <View style={styles.prItem}>
              <Text style={styles.prLabel}>Max Reps</Text>
              {prs.maxReps ? (
                <>
                  <Text style={styles.prValue}>{prs.maxReps.value}</Text>
                  <Text style={styles.prDate}>
                    {formatDate(parseISODate(prs.maxReps.achieved_at), 'MMM DD')}
                  </Text>
                </>
              ) : (
                <Text style={styles.prEmpty}>—</Text>
              )}
            </View>

            {/* Estimated 1RM */}
            <View style={styles.prItem}>
              <Text style={styles.prLabel}>Estimated 1RM</Text>
              {prs.estimated1RM ? (
                <>
                  <Text style={styles.prValue}>{prs.estimated1RM.value.toFixed(1)} kg</Text>
                  <Text style={styles.prDate}>
                    {formatDate(parseISODate(prs.estimated1RM.achieved_at), 'MMM DD')}
                  </Text>
                </>
              ) : (
                <Text style={styles.prEmpty}>—</Text>
              )}
            </View>

            {/* Max Volume */}
            <View style={styles.prItem}>
              <Text style={styles.prLabel}>Max Volume</Text>
              {prs.maxVolume ? (
                <>
                  <Text style={styles.prValue}>
                    {prs.maxVolume.value >= 1000
                      ? `${(prs.maxVolume.value / 1000).toFixed(1)}k`
                      : prs.maxVolume.value.toFixed(0)} kg
                  </Text>
                  <Text style={styles.prDate}>
                    {formatDate(parseISODate(prs.maxVolume.achieved_at), 'MMM DD')}
                  </Text>
                </>
              ) : (
                <Text style={styles.prEmpty}>—</Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Recent History */}
      <View style={styles.section}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={24} color={colors.textSecondary} />
            <Text style={styles.cardTitle}>Recent History</Text>
          </View>

          {recentHistory.length > 0 ? (
            <View style={styles.historyList}>
              {recentHistory.map((session, index) => (
                <TouchableOpacity
                  key={session.workoutId}
                  style={[
                    styles.historyItem,
                    index < recentHistory.length - 1 && styles.historyItemBorder,
                  ]}
                  onPress={() => handleHistoryItemPress(session.workoutId)}
                >
                  <View style={styles.historyItemLeft}>
                    <Text style={styles.historyDate}>
                      {formatDate(parseISODate(session.date), 'MMM DD, YYYY')}
                    </Text>
                    <Text style={styles.historySets}>
                      {formatSetsForDisplay(session.sets)}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyText}>No history yet</Text>
              <Text style={styles.emptySubtext}>
                Start logging this exercise to see your progress!
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.cardBackground,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  exerciseName: {
    ...typography.largeTitle,
    flex: 1,
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
  timesPerformed: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.title2,
  },
  prGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  prItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  prLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  prValue: {
    ...typography.title,
    marginBottom: spacing.xs,
  },
  prDate: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
  prEmpty: {
    ...typography.title,
    color: colors.textTertiary,
  },
  historyList: {
    gap: spacing.xs,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBackground,
  },
  historyItemLeft: {
    flex: 1,
  },
  historyDate: {
    ...typography.callout,
    marginBottom: spacing.xs,
  },
  historySets: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyHistory: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
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
