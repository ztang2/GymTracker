import { supabase } from './supabase';
import type {
  WorkoutSession,
  WorkoutExercise,
  ExerciseSet,
} from './types';

/**
 * Local state types for the Active Workout Logger
 */
export interface LocalSet {
  id: string; // Local UUID for tracking
  weight: number;
  reps: number;
  completed: boolean;
}

export interface LocalExercise {
  id: string; // Local UUID for tracking
  exerciseId: string;
  exerciseName: string;
  category: string;
  sets: LocalSet[];
}

export interface ActiveWorkoutState {
  exercises: LocalExercise[];
  startTime: Date;
  notes: string;
}

/**
 * Generate a local UUID for tracking exercises and sets before saving
 */
export function generateLocalId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new empty set with default values
 */
export function createEmptySet(): LocalSet {
  return {
    id: generateLocalId(),
    weight: 0,
    reps: 0,
    completed: false,
  };
}

/**
 * Create a new exercise entry with one empty set
 */
export function createLocalExercise(
  exerciseId: string,
  exerciseName: string,
  category: string
): LocalExercise {
  return {
    id: generateLocalId(),
    exerciseId,
    exerciseName,
    category,
    sets: [createEmptySet()],
  };
}

/**
 * Calculate workout duration in minutes from start time
 */
export function calculateDuration(startTime: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - startTime.getTime();
  return Math.floor(diffMs / 60000);
}

/**
 * Format duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Save the complete workout to Supabase
 * This performs the following sequence:
 * 1. Insert into workout_sessions
 * 2. Get the new session ID
 * 3. Insert into workout_exercises using that ID
 * 4. Insert into exercise_sets for each exercise
 *
 * @param userId - The user ID
 * @param workout - The active workout state to save
 * @returns The created workout session
 */
export async function saveWorkout(
  userId: string,
  workout: ActiveWorkoutState
): Promise<WorkoutSession> {
  const endTime = new Date();
  const durationMinutes = calculateDuration(workout.startTime);

  // Filter out exercises with no completed sets
  const exercisesWithSets = workout.exercises.filter(
    (ex) => ex.sets.some((set) => set.completed && set.reps > 0)
  );

  if (exercisesWithSets.length === 0) {
    throw new Error('No completed sets to save. Please complete at least one set.');
  }

  // Step 1: Create the workout session
  const { data: sessionData, error: sessionError } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: userId,
      date: workout.startTime.toISOString().split('T')[0],
      start_time: workout.startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_minutes: durationMinutes,
      notes: workout.notes || null,
    })
    .select()
    .single();

  if (sessionError) {
    throw new Error(`Failed to create workout session: ${sessionError.message}`);
  }

  const sessionId = sessionData.id;

  // Step 2: Create workout exercises
  const exerciseInserts = exercisesWithSets.map((ex, index) => ({
    workout_session_id: sessionId,
    exercise_id: ex.exerciseId,
    order_index: index,
    notes: null,
  }));

  const { data: exerciseData, error: exerciseError } = await supabase
    .from('workout_exercises')
    .insert(exerciseInserts)
    .select();

  if (exerciseError) {
    // Attempt to clean up the session if exercise insert fails
    await supabase.from('workout_sessions').delete().eq('id', sessionId);
    throw new Error(`Failed to create workout exercises: ${exerciseError.message}`);
  }

  // Step 3: Create exercise sets for each workout exercise
  const setInserts: Array<{
    workout_exercise_id: string;
    set_number: number;
    reps: number;
    weight_kg: number | null;
    rest_seconds: number | null;
    completed: boolean;
    notes: string | null;
  }> = [];

  exercisesWithSets.forEach((localEx, exIndex) => {
    const workoutExerciseId = exerciseData[exIndex].id;

    // Only save completed sets with reps > 0
    const completedSets = localEx.sets.filter(
      (set) => set.completed && set.reps > 0
    );

    completedSets.forEach((set, setIndex) => {
      setInserts.push({
        workout_exercise_id: workoutExerciseId,
        set_number: setIndex + 1,
        reps: set.reps,
        weight_kg: set.weight > 0 ? set.weight : null,
        rest_seconds: 90, // Default rest time
        completed: true,
        notes: null,
      });
    });
  });

  if (setInserts.length > 0) {
    const { error: setsError } = await supabase
      .from('exercise_sets')
      .insert(setInserts);

    if (setsError) {
      // Attempt to clean up if set insert fails
      await supabase.from('workout_exercises').delete().eq('workout_session_id', sessionId);
      await supabase.from('workout_sessions').delete().eq('id', sessionId);
      throw new Error(`Failed to create exercise sets: ${setsError.message}`);
    }
  }

  return sessionData as WorkoutSession;
}

/**
 * Discard an active workout without saving
 * This is used when the user cancels a workout
 */
export function discardWorkout(): void {
  // No cleanup needed for local state - this is handled by the component
  // This function exists for potential future use (e.g., clearing drafts)
}
