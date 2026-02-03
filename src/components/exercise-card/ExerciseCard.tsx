import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts';
import { View, Text, TouchableOpacity, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LocalExercise } from '../../services/workoutLogger';
import type { LastPerformance } from '../../services';
import { spacing } from '../../constants/theme';
import { useWeightUnit } from '../../hooks';
import { ExerciseCardHeader } from './ExerciseCardHeader';
import { SetRow } from './SetRow';
import { createExerciseCardStyles } from './styles';

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

const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
  const styles = createExerciseCardStyles(colors);
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
      <ExerciseCardHeader
        exercise={exercise}
        restDuration={restDuration}
        isFirst={isFirst}
        isLast={isLast}
        onRemove={onRemove}
        onConfigureRestTimer={onConfigureRestTimer}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
      />

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
        <SetRow
          key={set.id}
          set={set}
          index={index}
          unit={unit}
          convert={convert}
          toKg={toKg}
          canRemove={exercise.sets.length > 1}
          onUpdateSet={onUpdateSet}
          onToggleComplete={onToggleComplete}
          onRemoveSet={onRemoveSet}
        />
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
