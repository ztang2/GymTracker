import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts';
import { useWeightUnit } from '../../hooks';
import type { ThemeColors } from '../../constants/theme';
import type { WorkoutSessionWithExercises, ExerciseSet } from '../../services';

interface ExerciseListSectionProps {
  displayWorkout: WorkoutSessionWithExercises;
  isEditMode: boolean;
  errors: Record<string, string>;
  onRemoveExercise: (exIdx: number) => void;
  onUpdateSet: (exIdx: number, setIdx: number, field: keyof ExerciseSet, value: ExerciseSet[keyof ExerciseSet]) => void;
  onAddSet: (exIdx: number) => void;
  onRemoveSet: (exIdx: number, setIdx: number) => void;
  onOpenExercisePicker: () => void;
  onNavigateToExercise: (exerciseId: string, exerciseName: string) => void;
}

export const ExerciseListSection: React.FC<ExerciseListSectionProps> = ({
  displayWorkout,
  isEditMode,
  errors,
  onRemoveExercise,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onOpenExercisePicker,
  onNavigateToExercise,
}) => {
  const { colors } = useTheme();
  const { unit, convert, toKg } = useWeightUnit();
  const styles = createStyles(colors);

  return (
    <View style={styles.exercisesSection}>
      <Text style={styles.sectionTitle}>
        Exercises ({displayWorkout.exercises.length})
      </Text>

      {errors.exercises && (
        <Text style={styles.errorText}>{errors.exercises}</Text>
      )}

      {displayWorkout.exercises.map((exercise, exIdx) => (
        <View key={exercise.id} style={[styles.exerciseCard, isEditMode && styles.exerciseCardEdit]}>
          {/* Exercise header */}
          <View style={styles.exerciseHeader}>
            {!isEditMode ? (
              <TouchableOpacity
                onPress={() => onNavigateToExercise(exercise.exercise_id, exercise.exercise.name)}
                style={styles.exerciseNameButton}
              >
                <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            ) : (
              <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>
            )}
            {isEditMode && (
              <TouchableOpacity onPress={() => onRemoveExercise(exIdx)}>
                <Ionicons name="close-circle" size={24} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>

          {errors[`exercise_${exIdx}_sets`] && (
            <Text style={styles.errorText}>{errors[`exercise_${exIdx}_sets`]}</Text>
          )}

          {/* Sets */}
          <View style={styles.setsContainer}>
            <View style={styles.setsHeader}>
              <Text style={styles.setsHeaderText}>Set</Text>
              <Text style={styles.setsHeaderText}>Weight ({unit})</Text>
              <Text style={styles.setsHeaderText}>Reps</Text>
              {isEditMode && <Text style={styles.setsHeaderText}>   </Text>}
            </View>

            {exercise.sets.map((set, setIdx) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={styles.setNumber}>{set.set_number}</Text>

                {isEditMode ? (
                  <>
                    <TextInput
                      style={[
                        styles.setInput,
                        errors[`exercise_${exIdx}_set_${setIdx}_weight`] && styles.setInputError
                      ]}
                      value={convert(set.weight_kg || 0).toString()}
                      onChangeText={(text) => {
                        const displayVal = parseFloat(text) || 0;
                        const kgVal = toKg(displayVal);
                        onUpdateSet(exIdx, setIdx, 'weight_kg', Math.round(kgVal * 10) / 10);
                      }}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                    <TextInput
                      style={[
                        styles.setInput,
                        errors[`exercise_${exIdx}_set_${setIdx}_reps`] && styles.setInputError
                      ]}
                      value={set.reps.toString()}
                      onChangeText={(text) => {
                        const value = parseInt(text, 10) || 1;
                        onUpdateSet(exIdx, setIdx, 'reps', value);
                      }}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                    <TouchableOpacity onPress={() => onRemoveSet(exIdx, setIdx)}>
                      <Ionicons name="remove-circle-outline" size={24} color={colors.error} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.setValue}>{convert(set.weight_kg || 0)} {unit}</Text>
                    <Text style={styles.setValue}>{set.reps}</Text>
                  </>
                )}
              </View>
            ))}
          </View>

          {/* Add Set button (edit mode only) */}
          {isEditMode && (
            <TouchableOpacity
              onPress={() => onAddSet(exIdx)}
              style={styles.addSetButton}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.purple} />
              <Text style={styles.addSetButtonText}>Add Set</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* Add Exercise button (edit mode only) */}
      {isEditMode && (
        <TouchableOpacity
          onPress={onOpenExercisePicker}
          style={styles.addExerciseButton}
        >
          <Ionicons name="add-circle" size={24} color={colors.purple} />
          <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    exercisesSection: {
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 16,
    },
    exerciseCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    exerciseCardEdit: {
      borderColor: colors.purple,
      borderWidth: 1.5,
    },
    exerciseHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    exerciseNameButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    exerciseName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    setsContainer: {
      gap: 8,
    },
    setsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    setsHeaderText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
      flex: 1,
      textAlign: 'center',
    },
    setRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    setNumber: {
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: '600',
      flex: 1,
      textAlign: 'center',
    },
    setValue: {
      fontSize: 16,
      color: colors.textPrimary,
      flex: 1,
      textAlign: 'center',
    },
    setInput: {
      fontSize: 16,
      color: colors.textPrimary,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 8,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 4,
    },
    setInputError: {
      borderColor: colors.error,
      borderWidth: 2,
    },
    addSetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 12,
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.purple,
      borderStyle: 'dashed',
    },
    addSetButtonText: {
      fontSize: 14,
      color: colors.purple,
      fontWeight: '600',
    },
    addExerciseButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.purple,
      borderStyle: 'dashed',
      marginTop: 8,
    },
    addExerciseButtonText: {
      fontSize: 16,
      color: colors.purple,
      fontWeight: '600',
    },
    errorText: {
      fontSize: 12,
      color: colors.error,
      marginTop: 4,
      marginBottom: 8,
    },
  });
