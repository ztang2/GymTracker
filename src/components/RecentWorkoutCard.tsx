import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts';
import { typography, borderRadius, spacing ,  type ThemeColors } from '../constants/theme';
import type { WorkoutSessionWithExercises, ExerciseCategory } from '../services/types';
import { parseISODate, isSameDay } from '../utils/dateUtils';
import { colorGlow } from '../utils';
import { useWeightUnit } from '../hooks';

interface RecentWorkoutCardProps {
  workout: WorkoutSessionWithExercises;
  onPress: () => void;
  accentColor?: string;
}

/** Map category to a theme color key */
const CATEGORY_COLOR_KEY: Record<ExerciseCategory, keyof ThemeColors> = {
  chest: 'categoryChest',
  back: 'categoryBack',
  legs: 'categoryLegs',
  shoulders: 'categoryShoulders',
  arms: 'categoryArms',
  core: 'categoryCore',
  cardio: 'categoryCardio',
};

const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  chest: 'Chest',
  back: 'Back',
  legs: 'Legs',
  shoulders: 'Shoulders',
  arms: 'Arms',
  core: 'Core',
  cardio: 'Cardio',
};

/** Format date as "Today", "Yesterday", or "Jan 28" */
function formatRelativeDate(dateStr: string): string {
  const date = parseISODate(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (isSameDay(date, today)) return 'Today';

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Yesterday';

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${date.getDate()}`;
}

/** Compute total volume from exercises */
function computeTotalVolume(workout: WorkoutSessionWithExercises): number {
  let total = 0;
  for (const ex of workout.exercises) {
    for (const set of ex.sets) {
      if (set.completed && set.weight_kg != null) {
        total += set.reps * set.weight_kg;
      }
    }
  }
  return total;
}

/** Get unique muscle groups from exercises */
function getMuscleGroups(workout: WorkoutSessionWithExercises): ExerciseCategory[] {
  const seen = new Set<ExerciseCategory>();
  for (const ex of workout.exercises) {
    if (ex.exercise?.category) {
      seen.add(ex.exercise.category);
    }
  }
  return Array.from(seen);
}

export default function RecentWorkoutCard({
  workout,
  onPress,
  accentColor,
}: RecentWorkoutCardProps) {
  const { colors } = useTheme();
  const { unit, convert } = useWeightUnit();
  const accent = accentColor || colors.purple;

  const relativeDate = formatRelativeDate(workout.date);
  const exerciseCount = workout.exercises.length;
  const totalVolumeKg = computeTotalVolume(workout);
  const totalVolume = convert(totalVolumeKg);
  const muscleGroups = getMuscleGroups(workout);
  const duration = workout.duration_minutes;

  // Format volume compactly
  const formatVolume = (vol: number): string => {
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}t`;
    return `${Math.round(vol)} ${unit}`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Workout from ${relativeDate}, ${exerciseCount} exercises, ${duration ?? 0} minutes`}
      accessibilityHint="View workout details"
    >
      {/* Top row: icon + date + chevron */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: accent, ...colorGlow(accent, 'sm') },
          ]}
        >
          <Ionicons name="barbell" size={22} color="#FFFFFF" />
        </View>

        <View style={styles.titleArea}>
          <Text style={[styles.dateText, { color: colors.textPrimary }]}>{relativeDate}</Text>
          {duration != null && duration > 0 && (
            <Text style={[styles.durationText, { color: colors.textSecondary }]}>
              {duration} min
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="fitness-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
          </Text>
        </View>
        {totalVolume > 0 && (
          <View style={styles.statItem}>
            <Ionicons name="trending-up-outline" size={14} color={colors.textTertiary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {formatVolume(totalVolume)}
            </Text>
          </View>
        )}
      </View>

      {/* Muscle group chips */}
      {muscleGroups.length > 0 && (
        <View style={styles.chipsRow}>
          {muscleGroups.map((cat) => {
            const chipColor = (colors[CATEGORY_COLOR_KEY[cat]] as string) || colors.purple;
            return (
              <View
                key={cat}
                style={[
                  styles.chip,
                  { backgroundColor: chipColor + '20', borderColor: chipColor + '40' },
                ]}
              >
                <Text style={[styles.chipText, { color: chipColor }]}>
                  {CATEGORY_LABELS[cat]}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleArea: {
    flex: 1,
    gap: 2,
  },
  dateText: {
    ...typography.headline,
  },
  durationText: {
    ...typography.caption,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingLeft: 42 + spacing.md, // align with title area
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.caption,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingLeft: 42 + spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
