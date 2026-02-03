import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import type { ThemeColors } from '../constants/theme';
import { showAlert } from '../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { WorkoutDetailScreenProps } from '../navigation/types';
import {
  getWorkoutSession,
  updateWorkoutSession,
  updateExerciseSet,
  addExerciseSet,
  deleteExerciseSet,
  addWorkoutExercise,
  deleteWorkoutExercise,
  getAllExercises,
  createTemplateFromWorkout,
  type WorkoutSessionWithExercises,
  type WorkoutExerciseWithDetails,
  type ExerciseSet,
  type Exercise,
} from '../services';
import { SaveAsTemplateModal } from '../components';
import { detectPRsFromWorkout } from '../services/prService';
import { useAuth, useTheme } from '../contexts';
import { useWeightUnit } from '../hooks';
import { colorGlow, buildShareTextFromWorkout, shareWorkoutText } from '../utils';

interface EditableSet extends ExerciseSet {
  _isNew?: boolean; // Flag for newly added sets
}

interface EditableExercise extends WorkoutExerciseWithDetails {
  sets: EditableSet[];
  _isNew?: boolean; // Flag for newly added exercises
}

export default function WorkoutDetailScreen({ route, navigation }: WorkoutDetailScreenProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { unit, convert, toKg } = useWeightUnit();
  const styles = createStyles(colors);

  const { workoutId } = route.params;

  // State
  const [workout, setWorkout] = useState<WorkoutSessionWithExercises | null>(null);
  const [editedWorkout, setEditedWorkout] = useState<WorkoutSessionWithExercises | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    try {
      setLoading(true);
      const data = await getWorkoutSession(workoutId, user!.id);
      if (data) {
        setWorkout(data);
        setEditedWorkout(JSON.parse(JSON.stringify(data))); // Deep clone
      }
    } catch (error) {
      console.error('Failed to load workout:', error);
      showAlert('Error', 'Failed to load workout details');
    } finally {
      setLoading(false);
    }
  };

  const loadExercises = async () => {
    try {
      const exercises = await getAllExercises();
      setAvailableExercises(exercises);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  // Enter edit mode
  const handleEnterEditMode = () => {
    setIsEditMode(true);
    setEditedWorkout(JSON.parse(JSON.stringify(workout))); // Fresh clone
    loadExercises(); // Load exercises for adding
  };

  // Cancel editing with confirmation if there are changes
  const handleCancelEdit = () => {
    const hasChanges = JSON.stringify(workout) !== JSON.stringify(editedWorkout);
    
    if (hasChanges) {
      showAlert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setIsEditMode(false);
              setEditedWorkout(JSON.parse(JSON.stringify(workout)));
              setErrors({});
            },
          },
        ]
      );
    } else {
      setIsEditMode(false);
      setErrors({});
    }
  };

  // Validate all inputs
  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editedWorkout) return false;

    // At least 1 exercise required
    if (editedWorkout.exercises.length === 0) {
      newErrors.exercises = 'At least one exercise is required';
    }

    // Validate each exercise
    editedWorkout.exercises.forEach((exercise, exIdx) => {
      // At least 1 set per exercise
      if (exercise.sets.length === 0) {
        newErrors[`exercise_${exIdx}_sets`] = 'At least one set is required';
      }

      // Validate each set
      exercise.sets.forEach((set, setIdx) => {
        const key = `exercise_${exIdx}_set_${setIdx}`;
        
        // Weight must be >= 0
        if (set.weight_kg === null || set.weight_kg < 0) {
          newErrors[`${key}_weight`] = 'Weight must be 0 or greater';
        }

        // Reps must be >= 1
        if (set.reps < 1) {
          newErrors[`${key}_reps`] = 'Reps must be at least 1';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save changes
  const handleSaveEdit = async () => {
    if (!editedWorkout) return;

    // Validate
    if (!validateInputs()) {
      showAlert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    setIsSaving(true);

    try {
      // 1. Update workout session (date, notes, duration)
      await updateWorkoutSession(workoutId, user!.id, {
        date: editedWorkout.date,
        notes: editedWorkout.notes,
        duration_minutes: editedWorkout.duration_minutes,
      });

      // 2. Process exercises
      for (let i = 0; i < editedWorkout.exercises.length; i++) {
        const exercise = editedWorkout.exercises[i] as EditableExercise;

        // If new exercise, add it
        if (exercise._isNew) {
          const newWorkoutExercise = await addWorkoutExercise(
            workoutId,
            exercise.exercise_id,
            i,
            exercise.notes || undefined
          );
          
          // Add sets for new exercise
          for (const set of exercise.sets) {
            await addExerciseSet(newWorkoutExercise.id, {
              set_number: set.set_number,
              reps: set.reps,
              weight_kg: set.weight_kg,
              completed: set.completed,
              notes: set.notes,
              rest_seconds: set.rest_seconds,
            });
          }
        } else {
          // Update existing exercise sets
          for (const set of exercise.sets as EditableSet[]) {
            if (set._isNew) {
              // Add new set
              await addExerciseSet(exercise.id, {
                set_number: set.set_number,
                reps: set.reps,
                weight_kg: set.weight_kg,
                completed: set.completed,
                notes: set.notes,
                rest_seconds: set.rest_seconds,
              });
            } else {
              // Update existing set
              await updateExerciseSet(set.id, {
                reps: set.reps,
                weight_kg: set.weight_kg,
                completed: set.completed,
                notes: set.notes,
              });
            }
          }
        }
      }

      // 3. Handle deleted exercises (compare original vs edited)
      const originalExerciseIds = new Set(workout!.exercises.map(e => e.id));
      const editedExerciseIds = new Set(
        (editedWorkout.exercises as EditableExercise[]).filter(e => !e._isNew).map(e => e.id)
      );
      
      for (const originalId of originalExerciseIds) {
        if (!editedExerciseIds.has(originalId)) {
          await deleteWorkoutExercise(originalId);
        }
      }

      // 4. Handle deleted sets within remaining exercises
      for (const editedEx of editedWorkout.exercises as EditableExercise[]) {
        if (editedEx._isNew) continue;

        const originalEx = workout!.exercises.find(e => e.id === editedEx.id);
        if (!originalEx) continue;

        const originalSetIds = new Set(originalEx.sets.map(s => s.id));
        const editedSetIds = new Set((editedEx.sets as EditableSet[]).filter(s => !s._isNew).map(s => s.id));

        for (const originalSetId of originalSetIds) {
          if (!editedSetIds.has(originalSetId)) {
            await deleteExerciseSet(originalSetId);
          }
        }
      }

      // 5. Recalculate PRs
      const exerciseSets = editedWorkout.exercises.map(ex => ({
        exerciseId: ex.exercise_id,
        exerciseName: ex.exercise.name,
        sets: ex.sets
          .filter(s => s.completed)
          .map(s => ({
            weight: s.weight_kg || 0,
            reps: s.reps,
            completed: s.completed,
          })),
      }));

      await detectPRsFromWorkout(user!.id, workoutId, exerciseSets);

      // Success!
      showAlert('Success', 'Workout updated successfully');
      setIsEditMode(false);
      await loadWorkout(); // Reload fresh data

    } catch (error) {
      console.error('Failed to save workout:', error);
      showAlert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Update set field
  const handleUpdateSet = (exerciseIdx: number, setIdx: number, field: keyof ExerciseSet, value: ExerciseSet[keyof ExerciseSet]) => {
    if (!editedWorkout) return;

    const updated = { ...editedWorkout };
    const exercise = updated.exercises[exerciseIdx];
    exercise.sets[setIdx] = { ...exercise.sets[setIdx], [field]: value };

    setEditedWorkout(updated);
  };

  // Add set to exercise
  const handleAddSet = (exerciseIdx: number) => {
    if (!editedWorkout) return;

    const updated = { ...editedWorkout };
    const exercise = updated.exercises[exerciseIdx];
    
    const newSetNumber = exercise.sets.length + 1;
    const lastSet = exercise.sets[exercise.sets.length - 1];

    const newSet: EditableSet = {
      id: `temp_${Date.now()}`, // Temporary ID
      workout_exercise_id: exercise.id,
      set_number: newSetNumber,
      reps: lastSet?.reps || 10,
      weight_kg: lastSet?.weight_kg || 20,
      completed: true,
      notes: null,
      rest_seconds: null,
      created_at: new Date().toISOString(),
      _isNew: true,
    };

    exercise.sets.push(newSet);
    setEditedWorkout(updated);
  };

  // Remove set from exercise
  const handleRemoveSet = (exerciseIdx: number, setIdx: number) => {
    if (!editedWorkout) return;

    const updated = { ...editedWorkout };
    const exercise = updated.exercises[exerciseIdx];

    // Don't allow removing the last set
    if (exercise.sets.length <= 1) {
      showAlert('Cannot Remove', 'Each exercise must have at least one set');
      return;
    }

    exercise.sets.splice(setIdx, 1);

    // Renumber remaining sets
    exercise.sets.forEach((set, idx) => {
      set.set_number = idx + 1;
    });

    setEditedWorkout(updated);
  };

  // Add exercise to workout
  const handleAddExercise = (exercise: Exercise) => {
    if (!editedWorkout) return;

    const updated = { ...editedWorkout };
    
    const newExercise: EditableExercise = {
      id: `temp_${Date.now()}`,
      workout_session_id: workoutId,
      exercise_id: exercise.id,
      order_index: updated.exercises.length,
      notes: null,
      created_at: new Date().toISOString(),
      exercise: exercise,
      sets: [
        {
          id: `temp_set_${Date.now()}`,
          workout_exercise_id: `temp_${Date.now()}`,
          set_number: 1,
          reps: 10,
          weight_kg: 20,
          completed: true,
          notes: null,
          rest_seconds: null,
          created_at: new Date().toISOString(),
          _isNew: true,
        },
      ],
      _isNew: true,
    };

    updated.exercises.push(newExercise);
    setEditedWorkout(updated);
    setShowExercisePicker(false);
  };

  // Remove exercise from workout
  const handleRemoveExercise = (exerciseIdx: number) => {
    if (!editedWorkout) return;

    // Don't allow removing the last exercise
    if (editedWorkout.exercises.length <= 1) {
      showAlert('Cannot Remove', 'Workout must have at least one exercise');
      return;
    }

    showAlert(
      'Remove Exercise?',
      'Are you sure you want to remove this exercise and all its sets?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updated = { ...editedWorkout };
            updated.exercises.splice(exerciseIdx, 1);

            // Renumber exercises
            updated.exercises.forEach((ex, idx) => {
              ex.order_index = idx;
            });

            setEditedWorkout(updated);
          },
        },
      ]
    );
  };

  // Update workout notes
  const handleUpdateNotes = (notes: string) => {
    if (!editedWorkout) return;
    setEditedWorkout({ ...editedWorkout, notes });
  };

  // Update workout date
  const handleUpdateDate = (date: Date) => {
    if (!editedWorkout) return;
    const isoDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
    setEditedWorkout({ ...editedWorkout, date: isoDate });
    setShowDatePicker(false);
  };

  // Handle share workout
  const handleShareWorkout = () => {
    if (!workout) return;
    const text = buildShareTextFromWorkout(workout);
    shareWorkoutText(text);
  };

  // Handle save as template
  const handleSaveAsTemplate = async (name: string, description: string | null) => {
    if (!user || !workout) return;
    setSavingTemplate(true);
    try {
      const workoutExercises = workout.exercises.map((ex) => ({
        exerciseId: ex.exercise_id,
        sets: ex.sets
          .filter((s) => s.completed)
          .map((s) => ({ weight: s.weight_kg || 0, reps: s.reps })),
      }));

      await createTemplateFromWorkout(
        user.id,
        name,
        workoutExercises,
        workout.duration_minutes
      );

      setShowSaveTemplateModal(false);
      showAlert('Template Saved', `"${name}" has been saved as a template.`);
    } catch (error) {
      console.error('Failed to save template:', error);
      showAlert('Error', 'Failed to save template. Please try again.');
    } finally {
      setSavingTemplate(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Render not found state
  if (!workout || !editedWorkout) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Workout not found</Text>
        </View>
      </View>
    );
  }

  const displayWorkout = isEditMode ? editedWorkout : workout;

  return (
    <View style={styles.container}>
      {/* Header with Edit/Save/Cancel buttons */}
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">Workout Details</Text>
        <View style={styles.headerButtons}>
          {!isEditMode ? (
            <>
              <TouchableOpacity
                onPress={handleShareWorkout}
                style={styles.editButton}
                accessibilityRole="button"
                accessibilityLabel="Share workout"
              >
                <Ionicons name="share-social-outline" size={24} color={colors.green} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowSaveTemplateModal(true)}
                style={styles.editButton}
                accessibilityRole="button"
                accessibilityLabel="Save as template"
              >
                <Ionicons name="bookmark-outline" size={24} color={colors.teal} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleEnterEditMode} 
                style={styles.editButton}
                accessibilityRole="button"
                accessibilityLabel="Edit workout"
              >
                <Ionicons name="pencil" size={24} color={colors.purple} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                onPress={handleCancelEdit} 
                style={styles.cancelButton}
                accessibilityRole="button"
                accessibilityLabel="Cancel editing"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSaveEdit} 
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel="Save changes"
                accessibilityState={{ disabled: isSaving }}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Edit mode indicator */}
        {isEditMode && (
          <View style={styles.editModeIndicator}>
            <Ionicons name="create-outline" size={16} color={colors.purple} />
            <Text style={styles.editModeText}>Edit Mode</Text>
          </View>
        )}

        {/* Date */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Date</Text>
          {isEditMode ? (
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
              <Text style={styles.dateButtonText}>{displayWorkout.date}</Text>
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <Text style={styles.infoValue}>{displayWorkout.date}</Text>
          )}
        </View>

        {/* Duration */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Duration</Text>
          <Text style={styles.infoValue}>
            {displayWorkout.duration_minutes ? `${displayWorkout.duration_minutes} min` : 'In progress'}
          </Text>
        </View>

        {/* Notes */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Notes</Text>
          {isEditMode ? (
            <TextInput
              style={styles.notesInput}
              value={displayWorkout.notes || ''}
              onChangeText={handleUpdateNotes}
              placeholder="Add workout notes..."
              placeholderTextColor={colors.textTertiary}
              multiline
            />
          ) : (
            <Text style={styles.infoValue}>
              {displayWorkout.notes || 'No notes'}
            </Text>
          )}
        </View>

        {/* Exercises */}
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
                    onPress={() => {
                      // Navigate to exercise progress in Progress tab
                      // @ts-ignore - Cross-tab navigation
                      navigation.navigate('ProgressTab', {
                        screen: 'ExerciseProgressScreen',
                        params: { exerciseId: exercise.exercise_id, exerciseName: exercise.exercise.name },
                      });
                    }}
                    style={styles.exerciseNameButton}
                  >
                    <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>
                )}
                {isEditMode && (
                  <TouchableOpacity onPress={() => handleRemoveExercise(exIdx)}>
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
                            handleUpdateSet(exIdx, setIdx, 'weight_kg', Math.round(kgVal * 10) / 10);
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
                            handleUpdateSet(exIdx, setIdx, 'reps', value);
                          }}
                          keyboardType="numeric"
                          selectTextOnFocus
                        />
                        <TouchableOpacity onPress={() => handleRemoveSet(exIdx, setIdx)}>
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
                  onPress={() => handleAddSet(exIdx)}
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
              onPress={() => setShowExercisePicker(true)}
              style={styles.addExerciseButton}
            >
              <Ionicons name="add-circle" size={24} color={colors.purple} />
              <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={new Date(displayWorkout.date)}
          mode="date"
          display="default"
          onChange={(event: { type: string }, date?: Date) => {
            if (event.type === 'set' && date) {
              handleUpdateDate(date);
            } else {
              setShowDatePicker(false);
            }
          }}
        />
      )}

      {/* Exercise Picker Modal */}
      <Modal
        visible={showExercisePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExercisePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Exercise</Text>
              <TouchableOpacity onPress={() => setShowExercisePicker(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.exerciseList}>
              {availableExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  onPress={() => handleAddExercise(exercise)}
                  style={styles.exerciseListItem}
                >
                  <Text style={styles.exerciseListItemName}>{exercise.name}</Text>
                  <Text style={styles.exerciseListItemCategory}>{exercise.category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Save As Template Modal */}
      <SaveAsTemplateModal
        visible={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        onSave={handleSaveAsTemplate}
        loading={savingTemplate}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    headerButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    editButton: {
      padding: 8,
    },
    cancelButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    saveButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.purple,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      fontSize: 16,
      color: '#ffffff',
      fontWeight: '600',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    editModeIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      backgroundColor: `${colors.purple}20`,
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.purple,
    },
    editModeText: {
      fontSize: 14,
      color: colors.purple,
      fontWeight: '600',
    },
    infoCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    infoValue: {
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    dateButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateButtonText: {
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    notesInput: {
      fontSize: 16,
      color: colors.textPrimary,
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 80,
      textAlignVertical: 'top',
    },
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    exerciseList: {
      padding: 20,
    },
    exerciseListItem: {
      padding: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    exerciseListItemName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    exerciseListItemCategory: {
      fontSize: 14,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
  });
