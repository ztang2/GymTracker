import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LocalExercise } from '../services/workoutLogger';
import type { LastPerformance } from '../services';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';

interface ExerciseCardProps {
  exercise: LocalExercise;
  lastPerformance?: LastPerformance;
  onRemove: () => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onUpdateSet: (setId: string, field: 'weight' | 'reps', value: string) => void;
  onToggleComplete: (setId: string) => void;
}

// Format date for display (e.g., "Jan 15")
const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getCategoryDisplayName = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  lastPerformance,
  onRemove,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleComplete,
}) => {
  return (
    <View style={styles.exerciseCard}>
      {/* Exercise Header */}
      <View style={styles.exerciseHeader}>
        <View>
          <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
          <Text style={styles.exerciseCategory}>
            {getCategoryDisplayName(exercise.category)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Previous Performance Hint */}
      {lastPerformance && (
        <View style={styles.lastPerfContainer}>
          <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
          <Text style={styles.lastPerfText}>
            Last: {lastPerformance.lastWeight}kg × {lastPerformance.lastReps} (
            {formatShortDate(lastPerformance.lastDate)})
          </Text>
          {lastPerformance.maxWeight > (lastPerformance.lastWeight || 0) && (
            <Text style={styles.maxPerfText}>
              • Best: {lastPerformance.maxWeight}kg
            </Text>
          )}
        </View>
      )}

      {/* Sets Header */}
      <View style={styles.setsHeader}>
        <Text style={[styles.setHeaderText, { flex: 0.5 }]}>SET</Text>
        <Text style={[styles.setHeaderText, { flex: 1 }]}>KG</Text>
        <Text style={[styles.setHeaderText, { flex: 1 }]}>REPS</Text>
        <Text style={[styles.setHeaderText, { flex: 0.5 }]}></Text>
      </View>

      {/* Sets List */}
      {exercise.sets.map((set, index) => (
        <View key={set.id} style={styles.setRow}>
          <Text style={[styles.setNumber, { flex: 0.5 }]}>{index + 1}</Text>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.setInput, set.completed && styles.setInputCompleted]}
              value={set.weight > 0 ? set.weight.toString() : ''}
              onChangeText={(value) => onUpdateSet(set.id, 'weight', value)}
              keyboardType="numeric"
              placeholder="—"
              placeholderTextColor={colors.textMuted}
              editable={!set.completed}
              selectTextOnFocus
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.setInput, set.completed && styles.setInputCompleted]}
              value={set.reps > 0 ? set.reps.toString() : ''}
              onChangeText={(value) => onUpdateSet(set.id, 'reps', value)}
              keyboardType="numeric"
              placeholder="—"
              placeholderTextColor={colors.textMuted}
              editable={!set.completed}
              selectTextOnFocus
            />
          </View>
          <View style={styles.setActions}>
            <TouchableOpacity
              style={[styles.checkbox, set.completed && styles.checkboxChecked]}
              onPress={() => onToggleComplete(set.id)}
            >
              {set.completed && (
                <Ionicons name="checkmark" size={16} color={colors.textPrimary} />
              )}
            </TouchableOpacity>
            {exercise.sets.length > 1 && (
              <TouchableOpacity
                onPress={() => onRemoveSet(set.id)}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <Ionicons name="close" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      {/* Add Set Button */}
      <TouchableOpacity style={styles.addSetButton} onPress={onAddSet}>
        <Ionicons name="add" size={18} color={colors.teal} />
        <Text style={styles.addSetText}>Add Set</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  lastPerfContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  lastPerfText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  maxPerfText: {
    ...typography.caption,
    color: colors.teal,
  },
  exerciseName: {
    ...typography.headline,
    marginBottom: spacing.xs,
  },
  exerciseCategory: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  setHeaderText: {
    ...typography.caption2,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  setNumber: {
    ...typography.callout,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  setInput: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  setInputCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  setActions: {
    flex: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  addSetText: {
    ...typography.callout,
    color: colors.teal,
  },
});
