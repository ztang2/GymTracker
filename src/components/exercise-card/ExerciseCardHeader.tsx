import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts';
import { Ionicons } from '@expo/vector-icons';
import type { LocalExercise } from '../../services/workoutLogger';
import { createExerciseCardStyles } from './styles';

interface ExerciseCardHeaderProps {
  exercise: LocalExercise;
  restDuration?: number;
  isFirst?: boolean;
  isLast?: boolean;
  onRemove: () => void;
  onConfigureRestTimer?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const getCategoryDisplayName = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

const formatRestLabel = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins}m`;
  return `${mins}m${secs}s`;
};

export const ExerciseCardHeader: React.FC<ExerciseCardHeaderProps> = ({
  exercise,
  restDuration,
  isFirst,
  isLast,
  onRemove,
  onConfigureRestTimer,
  onMoveUp,
  onMoveDown,
}) => {
  const { colors } = useTheme();
  const styles = createExerciseCardStyles(colors);

  return (
    <View style={styles.exerciseHeader}>
      {/* Reorder Controls + Name */}
      <View style={styles.headerLeft}>
        {(onMoveUp || onMoveDown) && (
          <View style={styles.reorderControls}>
            <Text style={styles.dragHandle}>⠿</Text>
            <TouchableOpacity
              onPress={onMoveUp}
              disabled={isFirst}
              style={[styles.reorderButton, isFirst && styles.reorderButtonDisabled]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel={`Move ${exercise.exerciseName} up`}
            >
              <Ionicons name="chevron-up" size={18} color={isFirst ? colors.textMuted : colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onMoveDown}
              disabled={isLast}
              style={[styles.reorderButton, isLast && styles.reorderButtonDisabled]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel={`Move ${exercise.exerciseName} down`}
            >
              <Ionicons name="chevron-down" size={18} color={isLast ? colors.textMuted : colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
        <View>
          <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
          <Text style={styles.exerciseCategory}>
            {getCategoryDisplayName(exercise.category)}
          </Text>
        </View>
      </View>
      <View style={styles.headerActions}>
        {onConfigureRestTimer && (
          <TouchableOpacity
            onPress={onConfigureRestTimer}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={`Set rest timer for ${exercise.exerciseName}`}
            style={styles.restTimerButton}
          >
            <Ionicons name="timer-outline" size={18} color={colors.orange} />
            {restDuration !== undefined && (
              <Text style={styles.restTimerLabel}>
                {formatRestLabel(restDuration)}
              </Text>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${exercise.exerciseName}`}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
