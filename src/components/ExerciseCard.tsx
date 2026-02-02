import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../contexts';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LocalExercise } from '../services/workoutLogger';
import type { LastPerformance } from '../services';
import { typography, spacing, borderRadius, shadows } from '../constants/theme';
import { colorGlow } from '../utils';
import { useWeightUnit } from '../hooks';

interface ExerciseCardProps {
  exercise: LocalExercise;
  lastPerformance?: LastPerformance;
  restDuration?: number;
  isFirst?: boolean;
  isLast?: boolean;
  onRemove: () => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onUpdateSet: (setId: string, field: 'weight' | 'reps', value: string) => void;
  onToggleComplete: (setId: string) => void;
  onUpdateNotes?: (notes: string) => void;
  onConfigureRestTimer?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

// Format date for display (e.g., "Jan 15")
const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

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

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  lastPerformance,
  restDuration,
  isFirst,
  isLast,
  onRemove,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleComplete,
  onUpdateNotes,
  onConfigureRestTimer,
  onMoveUp,
  onMoveDown,
}) => {
  const { colors } = useTheme();
  const { unit, convert, toKg } = useWeightUnit();
  const styles = createStyles(colors);
  const [notesExpanded, setNotesExpanded] = useState(false);

  // Highlight animation on reorder
  const highlightAnim = useRef(new Animated.Value(0)).current;
  const [moveCount, setMoveCount] = useState(0);

  const triggerHighlight = () => {
    highlightAnim.setValue(1);
    Animated.timing(highlightAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  const handleMoveUp = () => {
    onMoveUp?.();
    setMoveCount((c) => c + 1);
  };

  const handleMoveDown = () => {
    onMoveDown?.();
    setMoveCount((c) => c + 1);
  };

  useEffect(() => {
    if (moveCount > 0) {
      triggerHighlight();
    }
  }, [moveCount]);

  const animatedBorderColor = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', colors.teal],
  });

  return (
    <Animated.View style={[styles.exerciseCard, { borderWidth: 2, borderColor: animatedBorderColor }]}>
      {/* Exercise Header */}
      <View style={styles.exerciseHeader}>
        {/* Reorder Controls + Name */}
        <View style={styles.headerLeft}>
          {(onMoveUp || onMoveDown) && (
            <View style={styles.reorderControls}>
              <Text style={styles.dragHandle}>⠿</Text>
              <TouchableOpacity
                onPress={handleMoveUp}
                disabled={isFirst}
                style={[styles.reorderButton, isFirst && styles.reorderButtonDisabled]}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityRole="button"
                accessibilityLabel={`Move ${exercise.exerciseName} up`}
              >
                <Ionicons name="chevron-up" size={18} color={isFirst ? colors.textMuted : colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleMoveDown}
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

      {/* Previous Performance Hint */}
      {lastPerformance && (
        <View style={styles.lastPerfContainer}>
          <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
          <Text style={styles.lastPerfText}>
            Last: {convert(lastPerformance.lastWeight || 0)}{unit} × {lastPerformance.lastReps} (
            {formatShortDate(lastPerformance.lastDate)})
          </Text>
          {lastPerformance.maxWeight > (lastPerformance.lastWeight || 0) && (
            <Text style={styles.maxPerfText}>
              • Best: {convert(lastPerformance.maxWeight)}{unit}
            </Text>
          )}
        </View>
      )}

      {/* Exercise Notes */}
      {onUpdateNotes && (
        <View style={styles.notesContainer}>
          <TouchableOpacity
            style={styles.notesHeader}
            onPress={() => setNotesExpanded(!notesExpanded)}
            accessibilityRole="button"
            accessibilityLabel={`${notesExpanded ? 'Collapse' : 'Expand'} exercise notes`}
          >
            <View style={styles.notesHeaderLeft}>
              <Ionicons
                name="document-text-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.notesHeaderText, { color: colors.textSecondary }]}>
                Notes {exercise.notes ? `(${exercise.notes.length})` : ''}
              </Text>
            </View>
            <Ionicons
              name={notesExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {notesExpanded && (
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: colors.backgroundElevated,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Add notes for this exercise..."
              placeholderTextColor={colors.textTertiary}
              value={exercise.notes}
              onChangeText={onUpdateNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          )}
        </View>
      )}

      {/* Sets Header */}
      <View style={styles.setsHeader}>
        <Text style={[styles.setHeaderText, { flex: 0.5 }]}>SET</Text>
        <Text style={[styles.setHeaderText, { flex: 1 }]}>{unit.toUpperCase()}</Text>
        <Text style={[styles.setHeaderText, { flex: 1 }]}>REPS</Text>
        <Text style={[styles.setHeaderText, { flex: 0.5 }]}></Text>
      </View>

      {/* Sets List */}
      {exercise.sets.map((set, index) => (
        <View key={set.id} style={styles.setRow}>
          <Text style={[styles.setNumber, { flex: 0.5 }]}>{index + 1}</Text>
          <WeightInput
            set={set}
            index={index}
            unit={unit}
            convert={convert}
            toKg={toKg}
            onUpdateSet={onUpdateSet}
            colors={colors}
            styles={styles}
          />
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
              accessibilityLabel={`Set ${index + 1} repetitions`}
              accessibilityHint="Enter the number of reps for this set"
            />
          </View>
          <View style={styles.setActions}>
            <TouchableOpacity
              style={[styles.checkbox, set.completed && styles.checkboxChecked]}
              onPress={() => onToggleComplete(set.id)}
              accessibilityRole="checkbox"
              accessibilityLabel={`Mark set ${index + 1} as ${set.completed ? 'incomplete' : 'complete'}`}
              accessibilityState={{ checked: set.completed }}
            >
              {set.completed && (
                <Ionicons name="checkmark" size={16} color={colors.textPrimary} />
              )}
            </TouchableOpacity>
            {exercise.sets.length > 1 && (
              <TouchableOpacity
                onPress={() => onRemoveSet(set.id)}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                accessibilityRole="button"
                accessibilityLabel={`Remove set ${index + 1}`}
              >
                <Ionicons name="close" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      {/* Add Set Button */}
      <TouchableOpacity 
        style={styles.addSetButton} 
        onPress={onAddSet}
        accessibilityRole="button"
        accessibilityLabel={`Add set to ${exercise.exerciseName}`}
      >
        <Ionicons name="add" size={18} color={colors.teal} />
        <Text style={styles.addSetText}>Add Set</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * WeightInput: Uses local state to avoid round-trip conversion issues.
 * User types in display unit freely. Conversion to kg happens only on blur.
 */
const WeightInput: React.FC<{
  set: { id: string; weight: number; completed: boolean };
  index: number;
  unit: string;
  convert: (kg: number) => number;
  toKg: (display: number) => number;
  onUpdateSet: (setId: string, field: 'weight' | 'reps', value: string) => void;
  colors: any;
  styles: any;
}> = ({ set, index, unit, convert, toKg, onUpdateSet, colors, styles }) => {
  const [localValue, setLocalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const lastSyncedWeight = useRef(set.weight);

  // Sync display value from external state ONLY when not focused
  // and when the weight actually changed from outside (not our own update)
  useEffect(() => {
    if (!isFocused && set.weight !== lastSyncedWeight.current) {
      lastSyncedWeight.current = set.weight;
      if (set.weight > 0) {
        const displayed = convert(set.weight);
        // Show integer if it's a whole number, otherwise 1 decimal
        setLocalValue(displayed % 1 === 0 ? displayed.toString() : displayed.toFixed(1));
      } else {
        setLocalValue('');
      }
    }
  }, [set.weight, isFocused, convert]);

  // Initialize on first render
  useEffect(() => {
    if (set.weight > 0 && localValue === '') {
      const displayed = convert(set.weight);
      setLocalValue(displayed % 1 === 0 ? displayed.toString() : displayed.toFixed(1));
      lastSyncedWeight.current = set.weight;
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        style={[styles.setInput, set.completed && styles.setInputCompleted]}
        value={localValue}
        onChangeText={(value) => {
          // Only update local display — no conversion, no parent update
          // Allow digits and decimal point only
          const cleaned = value.replace(/[^0-9.]/g, '');
          setLocalValue(cleaned);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          // Convert to kg and update parent on blur
          const displayVal = parseFloat(localValue) || 0;
          const kgVal = toKg(displayVal);
          const roundedKg = Math.round(kgVal * 10) / 10;
          lastSyncedWeight.current = roundedKg;
          onUpdateSet(set.id, 'weight', roundedKg > 0 ? roundedKg.toString() : '0');
          // Normalize display
          if (displayVal > 0) {
            setLocalValue(displayVal % 1 === 0 ? displayVal.toString() : displayVal.toFixed(1));
          } else {
            setLocalValue('');
          }
        }}
        keyboardType="decimal-pad"
        placeholder="—"
        placeholderTextColor={colors.textMuted}
        editable={!set.completed}
        selectTextOnFocus
        accessibilityLabel={`Set ${index + 1} weight in ${unit}`}
        accessibilityHint={`Enter the weight for this set in ${unit}`}
      />
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  reorderControls: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dragHandle: {
    fontSize: 16,
    color: colors.textTertiary,
    lineHeight: 16,
  },
  reorderButton: {
    padding: 2,
    borderRadius: borderRadius.sm,
  },
  reorderButtonDisabled: {
    opacity: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  restTimerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  restTimerLabel: {
    ...typography.caption2,
    color: colors.orange,
    fontWeight: '600',
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
    color: colors.textPrimary,
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
    ...colorGlow(colors.green, 'sm'),
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
  notesContainer: {
    marginBottom: spacing.md,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  notesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  notesHeaderText: {
    ...typography.callout,
  },
  notesInput: {
    ...typography.body,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    marginTop: spacing.xs,
    minHeight: 80,
  },
});
