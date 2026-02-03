import { useState, useCallback, useRef } from 'react';
import {
  createLocalExercise,
  createEmptySet,
  type LocalExercise,
  type LocalSet,
} from '../services/workoutLogger';
import type { Exercise } from '../services';

interface UseWorkoutStateReturn {
  exercises: LocalExercise[];
  addExercise: (exercise: Exercise) => void;
  removeExercise: (exerciseLocalId: string) => void;
  addSet: (exerciseLocalId: string) => void;
  removeSet: (exerciseLocalId: string, setId: string) => void;
  updateSet: (
    exerciseLocalId: string,
    setId: string,
    field: 'weight' | 'reps',
    value: string
  ) => void;
  toggleSetComplete: (exerciseLocalId: string, setId: string) => boolean;
  updateExerciseNotes: (exerciseLocalId: string, notes: string) => void;
  moveExercise: (exerciseLocalId: string, direction: 'up' | 'down') => void;
}

/**
 * Custom hook for managing workout state (exercises and sets)
 * Returns functions to add/remove exercises and sets, update set values, and toggle completion
 */
export const useWorkoutState = (): UseWorkoutStateReturn => {
  const [exercises, setExercises] = useState<LocalExercise[]>([]);

  const addExercise = useCallback((exercise: Exercise) => {
    const newExercise = createLocalExercise(
      exercise.id,
      exercise.name,
      exercise.category
    );
    setExercises((prev) => [...prev, newExercise]);
  }, []);

  const removeExercise = useCallback((exerciseLocalId: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseLocalId));
  }, []);

  const addSet = useCallback((exerciseLocalId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseLocalId) {
          return { ...ex, sets: [...ex.sets, createEmptySet()] };
        }
        return ex;
      })
    );
  }, []);

  const removeSet = useCallback((exerciseLocalId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseLocalId && ex.sets.length > 1) {
          return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
        }
        return ex;
      })
    );
  }, []);

  const updateSet = useCallback(
    (
      exerciseLocalId: string,
      setId: string,
      field: 'weight' | 'reps',
      value: string
    ) => {
      const numValue = parseFloat(value) || 0;
      setExercises((prev) =>
        prev.map((ex) => {
          if (ex.id === exerciseLocalId) {
            return {
              ...ex,
              sets: ex.sets.map((s) => {
                if (s.id === setId) {
                  return { ...s, [field]: numValue };
                }
                return s;
              }),
            };
          }
          return ex;
        })
      );
    },
    []
  );

  /**
   * Toggles the completion status of a set
   * Returns true if the set was just marked as complete (for haptic feedback)
   */
  const justCompletedRef = useRef(false);
  const toggleSetComplete = useCallback(
    (exerciseLocalId: string, setId: string): boolean => {
      justCompletedRef.current = false;

      setExercises((prev) =>
        prev.map((ex) => {
          if (ex.id === exerciseLocalId) {
            return {
              ...ex,
              sets: ex.sets.map((s) => {
                if (s.id === setId) {
                  justCompletedRef.current = !s.completed;
                  return { ...s, completed: !s.completed };
                }
                return s;
              }),
            };
          }
          return ex;
        })
      );

      return justCompletedRef.current;
    },
    []
  );

  /**
   * Update notes for a specific exercise
   */
  const updateExerciseNotes = useCallback((exerciseLocalId: string, notes: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseLocalId) {
          return { ...ex, notes };
        }
        return ex;
      })
    );
  }, []);

  /**
   * Move an exercise up or down in the list
   */
  const moveExercise = useCallback(
    (exerciseLocalId: string, direction: 'up' | 'down') => {
      setExercises((prev) => {
        const index = prev.findIndex((ex) => ex.id === exerciseLocalId);
        if (index === -1) return prev;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= prev.length) return prev;
        const next = [...prev];
        [next[index], next[newIndex]] = [next[newIndex], next[index]];
        return next;
      });
    },
    []
  );

  return {
    exercises,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    toggleSetComplete,
    updateExerciseNotes,
    moveExercise,
  };
};
