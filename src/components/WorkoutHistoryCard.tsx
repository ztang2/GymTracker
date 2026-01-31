import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '../constants/theme';
import type { WorkoutSession, WorkoutSessionWithExercises } from '../services/types';

interface WorkoutHistoryCardProps {
  workout: WorkoutSession | WorkoutSessionWithExercises;
  onPress: () => void;
  accentColor?: string;
}

export default function WorkoutHistoryCard({
  workout,
  onPress,
  accentColor = colors.purple,
}: WorkoutHistoryCardProps) {
  // Format date (e.g., "Jan 15, 2026")
  // Parse YYYY-MM-DD as local date to avoid UTC timezone shift
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get first 2-3 exercise names (if exercises are included)
  const hasExercises = 'exercises' in workout && workout.exercises && workout.exercises.length > 0;
  const exerciseNames = hasExercises
    ? workout.exercises
        .slice(0, 3)
        .map((ex) => ex.exercise.name)
        .join(', ')
    : 'Workout Session';
  const moreExercises = hasExercises && workout.exercises.length > 3 ? ` +${workout.exercises.length - 3} more` : '';

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
      {/* Left side: Colored circular icon */}
      <View style={[styles.iconContainer, { backgroundColor: accentColor }]}>
        <Ionicons name="barbell" size={24} color={colors.textPrimary} />
      </View>

      {/* Middle: Workout info */}
      <View style={styles.content}>
        <Text style={styles.exerciseText} numberOfLines={1}>
          {exerciseNames}{moreExercises}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{formatDate(workout.date)}</Text>
          {workout.duration_minutes && (
            <>
              <Text style={styles.metaText}> • </Text>
              <Text style={styles.metaText}>{workout.duration_minutes} min</Text>
            </>
          )}
        </View>
      </View>

      {/* Right side: Chevron */}
      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  exerciseText: {
    ...typography.body,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...typography.caption,
  },
});
