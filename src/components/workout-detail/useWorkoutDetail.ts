import { useState, useEffect } from 'react';
import { showAlert } from '../../utils/alert';
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
} from '../../services';
import { detectPRsFromWorkout } from '../../services/prService';
import { useAuth } from '../../contexts';
import { buildShareTextFromWorkout, shareWorkoutText } from '../../utils';

export interface EditableSet extends ExerciseSet {
  _isNew?: boolean;
}

export interface EditableExercise extends WorkoutExerciseWithDetails {
  sets: EditableSet[];
  _isNew?: boolean;
}

export function useWorkoutDetail(workoutId: string) {
  const { user } = useAuth();

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
        setEditedWorkout(JSON.parse(JSON.stringify(data)));
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

  const handleEnterEditMode = () => {
    setIsEditMode(true);
    setEditedWorkout(JSON.parse(JSON.stringify(workout)));
    loadExercises();
  };

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

  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editedWorkout) return false;

    if (editedWorkout.exercises.length === 0) {
      newErrors.exercises = 'At least one exercise is required';
    }

    editedWorkout.exercises.forEach((exercise, exIdx) => {
      if (exercise.sets.length === 0) {
        newErrors[`exercise_${exIdx}_sets`] = 'At least one set is required';
      }

      exercise.sets.forEach((set, setIdx) => {
        const key = `exercise_${exIdx}_set_${setIdx}`;

        if (set.weight_kg === null || set.weight_kg < 0) {
          newErrors[`${key}_weight`] = 'Weight must be 0 or greater';
        }

        if (set.reps < 1) {
          newErrors[`${key}_reps`] = 'Reps must be at least 1';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!editedWorkout) return;

    if (!validateInputs()) {
      showAlert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    setIsSaving(true);

    try {
      await updateWorkoutSession(workoutId, user!.id, {
        date: editedWorkout.date,
        notes: editedWorkout.notes,
        duration_minutes: editedWorkout.duration_minutes,
      });

      for (let i = 0; i < editedWorkout.exercises.length; i++) {
        const exercise = editedWorkout.exercises[i] as EditableExercise;

        if (exercise._isNew) {
          const newWorkoutExercise = await addWorkoutExercise(
            workoutId,
            exercise.exercise_id,
            i,
            exercise.notes || undefined
          );

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
          for (const set of exercise.sets as EditableSet[]) {
            if (set._isNew) {
              await addExerciseSet(exercise.id, {
                set_number: set.set_number,
                reps: set.reps,
                weight_kg: set.weight_kg,
                completed: set.completed,
                notes: set.notes,
                rest_seconds: set.rest_seconds,
              });
            } else {
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

      const originalExerciseIds = new Set(workout!.exercises.map(e => e.id));
      const editedExerciseIds = new Set(
        (editedWorkout.exercises as EditableExercise[]).filter(e => !e._isNew).map(e => e.id)
      );

      for (const originalId of originalExerciseIds) {
        if (!editedExerciseIds.has(originalId)) {
          await deleteWorkoutExercise(originalId);
        }
      }

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

      showAlert('Success', 'Workout updated successfully');
      setIsEditMode(false);
      await loadWorkout();
    } catch (error) {
      console.error('Failed to save workout:', error);
      showAlert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSet = (exerciseIdx: number, setIdx: number, field: keyof ExerciseSet, value: ExerciseSet[keyof ExerciseSet]) => {
    if (!editedWorkout) return;

    const updated = { ...editedWorkout };
    const exercise = updated.exercises[exerciseIdx];
    exercise.sets[setIdx] = { ...exercise.sets[setIdx], [field]: value };

    setEditedWorkout(updated);
  };

  const handleAddSet = (exerciseIdx: number) => {
    if (!editedWorkout) return;

    const updated = { ...editedWorkout };
    const exercise = updated.exercises[exerciseIdx];

    const newSetNumber = exercise.sets.length + 1;
    const lastSet = exercise.sets[exercise.sets.length - 1];

    const newSet: EditableSet = {
      id: `temp_${Date.now()}`,
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

  const handleRemoveSet = (exerciseIdx: number, setIdx: number) => {
    if (!editedWorkout) return;

    const updated = { ...editedWorkout };
    const exercise = updated.exercises[exerciseIdx];

    if (exercise.sets.length <= 1) {
      showAlert('Cannot Remove', 'Each exercise must have at least one set');
      return;
    }

    exercise.sets.splice(setIdx, 1);
    exercise.sets.forEach((set, idx) => {
      set.set_number = idx + 1;
    });

    setEditedWorkout(updated);
  };

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

  const handleRemoveExercise = (exerciseIdx: number) => {
    if (!editedWorkout) return;

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

            updated.exercises.forEach((ex, idx) => {
              ex.order_index = idx;
            });

            setEditedWorkout(updated);
          },
        },
      ]
    );
  };

  const handleUpdateNotes = (notes: string) => {
    if (!editedWorkout) return;
    setEditedWorkout({ ...editedWorkout, notes });
  };

  const handleUpdateDate = (date: Date) => {
    if (!editedWorkout) return;
    const isoDate = date.toISOString().split('T')[0];
    setEditedWorkout({ ...editedWorkout, date: isoDate });
    setShowDatePicker(false);
  };

  const handleShareWorkout = () => {
    if (!workout) return;
    const text = buildShareTextFromWorkout(workout);
    shareWorkoutText(text);
  };

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

  return {
    workout,
    editedWorkout,
    loading,
    isEditMode,
    isSaving,
    availableExercises,
    showExercisePicker,
    setShowExercisePicker,
    showDatePicker,
    setShowDatePicker,
    errors,
    showSaveTemplateModal,
    setShowSaveTemplateModal,
    savingTemplate,
    handleEnterEditMode,
    handleCancelEdit,
    handleSaveEdit,
    handleUpdateSet,
    handleAddSet,
    handleRemoveSet,
    handleAddExercise,
    handleRemoveExercise,
    handleUpdateNotes,
    handleUpdateDate,
    handleShareWorkout,
    handleSaveAsTemplate,
  };
}
