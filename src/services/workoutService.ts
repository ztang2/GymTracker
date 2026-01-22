import { supabase } from './supabase';
import type {
  WorkoutSession,
  WorkoutSessionWithExercises,
  WorkoutExercise,
  WorkoutExerciseWithDetails,
  ExerciseSet,
  CreateWorkoutSessionInput,
  CreateExerciseSetInput,
} from './types';

/**
 * Workout Service
 * Manages workout sessions, exercises, and sets with full CRUD operations
 */

// ============================================================================
// WORKOUT SESSION MANAGEMENT
// ============================================================================

/**
 * Create a new workout session
 * @param userId - User ID owning the workout
 * @param input - Workout session data (date, start_time, notes, etc.)
 * @returns Promise<WorkoutSession> - Created session
 * @throws Error if creation fails
 */
export async function createWorkoutSession(
  userId: string,
  input: Omit<CreateWorkoutSessionInput, 'user_id'>
): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: userId,
      ...input,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create workout session: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned after creating workout session');
  }

  return data;
}

/**
 * Get a workout session with all exercises and sets (fully populated)
 * @param sessionId - Workout session ID
 * @param userId - User ID for authorization
 * @returns Promise<WorkoutSessionWithExercises | null> - null if not found
 * @throws Error if database query fails
 */
export async function getWorkoutSession(
  sessionId: string,
  userId: string
): Promise<WorkoutSessionWithExercises | null> {
  // Step 1: Fetch the workout session
  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (sessionError) {
    if (sessionError.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch workout session: ${sessionError.message}`);
  }

  if (!session) {
    return null;
  }

  // Step 2: Fetch workout_exercises with exercise details
  const { data: workoutExercises, error: exercisesError } = await supabase
    .from('workout_exercises')
    .select(`
      *,
      exercise:exercises(*)
    `)
    .eq('workout_session_id', sessionId)
    .order('order_index', { ascending: true });

  if (exercisesError) {
    throw new Error(`Failed to fetch workout exercises: ${exercisesError.message}`);
  }

  // Step 3: Fetch all sets for all workout exercises
  const workoutExerciseIds = workoutExercises?.map(we => we.id) || [];
  let allSets: ExerciseSet[] = [];

  if (workoutExerciseIds.length > 0) {
    const { data: sets, error: setsError } = await supabase
      .from('exercise_sets')
      .select('*')
      .in('workout_exercise_id', workoutExerciseIds)
      .order('set_number', { ascending: true });

    if (setsError) {
      throw new Error(`Failed to fetch exercise sets: ${setsError.message}`);
    }

    allSets = sets || [];
  }

  // Step 4: Combine data into composite structure
  const exercisesWithDetails: WorkoutExerciseWithDetails[] = (workoutExercises || []).map(we => ({
    ...we,
    exercise: we.exercise,
    sets: allSets.filter(set => set.workout_exercise_id === we.id),
  }));

  return {
    ...session,
    exercises: exercisesWithDetails,
  };
}

/**
 * Get a basic workout session (no exercises/sets)
 * @param sessionId - Workout session ID
 * @param userId - User ID for authorization
 * @returns Promise<WorkoutSession | null> - null if not found
 * @throws Error if database query fails
 */
export async function getWorkoutSessionBasic(
  sessionId: string,
  userId: string
): Promise<WorkoutSession | null> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch workout session: ${error.message}`);
  }

  return data;
}

/**
 * Get all workout sessions for a specific date
 * @param userId - User ID
 * @param date - ISO date string (YYYY-MM-DD)
 * @returns Promise<WorkoutSession[]>
 * @throws Error if database query fails
 */
export async function getWorkoutsByDate(
  userId: string,
  date: string
): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('start_time', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch workouts by date: ${error.message}`);
  }

  return data || [];
}

/**
 * Get workout sessions within a date range
 * @param userId - User ID
 * @param startDate - Start date (ISO string YYYY-MM-DD)
 * @param endDate - End date (ISO string YYYY-MM-DD)
 * @returns Promise<WorkoutSession[]> - Ordered newest first
 * @throws Error if database query fails
 */
export async function getWorkoutsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch workouts by date range: ${error.message}`);
  }

  return data || [];
}

/**
 * Get recent workout sessions (limit to N most recent)
 * @param userId - User ID
 * @param limit - Maximum number of sessions to return (default: 10)
 * @returns Promise<WorkoutSession[]>
 * @throws Error if database query fails
 */
export async function getRecentWorkouts(
  userId: string,
  limit: number = 10
): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch recent workouts: ${error.message}`);
  }

  return data || [];
}

/**
 * Update workout session (end_time, duration, notes, etc.)
 * @param sessionId - Workout session ID
 * @param userId - User ID for authorization
 * @param updates - Partial workout session data to update
 * @returns Promise<WorkoutSession> - Updated session
 * @throws Error if update fails or session not found
 */
export async function updateWorkoutSession(
  sessionId: string,
  userId: string,
  updates: Partial<Omit<WorkoutSession, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .update(updates)
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update workout session: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned after updating workout session');
  }

  return data;
}

/**
 * Delete a workout session (cascades to exercises and sets)
 * @param sessionId - Workout session ID
 * @param userId - User ID for authorization
 * @returns Promise<void>
 * @throws Error if deletion fails or session not found
 */
export async function deleteWorkoutSession(
  sessionId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete workout session: ${error.message}`);
  }
}

// ============================================================================
// EXERCISE MANAGEMENT IN WORKOUTS
// ============================================================================

/**
 * Add an exercise to a workout session
 * @param sessionId - Workout session ID
 * @param exerciseId - Exercise ID from exercise library
 * @param orderIndex - Position in workout (0-based)
 * @param notes - Optional notes for this exercise in workout
 * @returns Promise<WorkoutExercise> - Created workout exercise
 * @throws Error if creation fails
 */
export async function addExerciseToWorkout(
  sessionId: string,
  exerciseId: string,
  orderIndex: number,
  notes?: string
): Promise<WorkoutExercise> {
  const { data, error } = await supabase
    .from('workout_exercises')
    .insert({
      workout_session_id: sessionId,
      exercise_id: exerciseId,
      order_index: orderIndex,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add exercise to workout: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned after adding exercise to workout');
  }

  return data;
}

/**
 * Get all exercises for a workout session (with exercise details and sets)
 * @param sessionId - Workout session ID
 * @returns Promise<WorkoutExerciseWithDetails[]>
 * @throws Error if database query fails
 */
export async function getWorkoutExercises(
  sessionId: string
): Promise<WorkoutExerciseWithDetails[]> {
  // Fetch workout_exercises with exercise details
  const { data: workoutExercises, error: exercisesError } = await supabase
    .from('workout_exercises')
    .select(`
      *,
      exercise:exercises(*)
    `)
    .eq('workout_session_id', sessionId)
    .order('order_index', { ascending: true });

  if (exercisesError) {
    throw new Error(`Failed to fetch workout exercises: ${exercisesError.message}`);
  }

  // Fetch all sets for these exercises
  const workoutExerciseIds = workoutExercises?.map(we => we.id) || [];
  let allSets: ExerciseSet[] = [];

  if (workoutExerciseIds.length > 0) {
    const { data: sets, error: setsError } = await supabase
      .from('exercise_sets')
      .select('*')
      .in('workout_exercise_id', workoutExerciseIds)
      .order('set_number', { ascending: true });

    if (setsError) {
      throw new Error(`Failed to fetch exercise sets: ${setsError.message}`);
    }

    allSets = sets || [];
  }

  // Combine into composite structure
  const exercisesWithDetails: WorkoutExerciseWithDetails[] = (workoutExercises || []).map(we => ({
    ...we,
    exercise: we.exercise,
    sets: allSets.filter(set => set.workout_exercise_id === we.id),
  }));

  return exercisesWithDetails;
}

/**
 * Remove an exercise from a workout (cascades to sets)
 * @param workoutExerciseId - Workout exercise ID
 * @returns Promise<void>
 * @throws Error if deletion fails
 */
export async function removeExerciseFromWorkout(
  workoutExerciseId: string
): Promise<void> {
  const { error } = await supabase
    .from('workout_exercises')
    .delete()
    .eq('id', workoutExerciseId);

  if (error) {
    throw new Error(`Failed to remove exercise from workout: ${error.message}`);
  }
}

/**
 * Reorder exercises in a workout session
 * @param updates - Array of { workoutExerciseId, newOrderIndex }
 * @returns Promise<void>
 * @throws Error if updates fail
 */
export async function reorderWorkoutExercises(
  updates: Array<{ workoutExerciseId: string; newOrderIndex: number }>
): Promise<void> {
  // Perform all updates in parallel using Promise.all
  const updatePromises = updates.map(({ workoutExerciseId, newOrderIndex }) =>
    supabase
      .from('workout_exercises')
      .update({ order_index: newOrderIndex })
      .eq('id', workoutExerciseId)
  );

  const results = await Promise.all(updatePromises);

  // Check for any errors
  const errors = results.filter(result => result.error);
  if (errors.length > 0) {
    throw new Error(
      `Failed to reorder exercises: ${errors.map(e => e.error?.message).join(', ')}`
    );
  }
}

/**
 * Update notes for an exercise in a workout
 * @param workoutExerciseId - Workout exercise ID
 * @param notes - New notes text
 * @returns Promise<WorkoutExercise>
 * @throws Error if update fails
 */
export async function updateWorkoutExerciseNotes(
  workoutExerciseId: string,
  notes: string
): Promise<WorkoutExercise> {
  const { data, error } = await supabase
    .from('workout_exercises')
    .update({ notes })
    .eq('id', workoutExerciseId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update workout exercise notes: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned after updating workout exercise notes');
  }

  return data;
}

// ============================================================================
// SET LOGGING
// ============================================================================

/**
 * Add a set to a workout exercise
 * @param workoutExerciseId - Workout exercise ID
 * @param setData - Set data (reps, weight, etc.)
 * @returns Promise<ExerciseSet> - Created set
 * @throws Error if creation fails
 */
export async function addSetToExercise(
  workoutExerciseId: string,
  setData: Omit<CreateExerciseSetInput, 'workout_exercise_id'>
): Promise<ExerciseSet> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .insert({
      workout_exercise_id: workoutExerciseId,
      ...setData,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add set: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned after adding set');
  }

  return data;
}

/**
 * Get all sets for a workout exercise
 * @param workoutExerciseId - Workout exercise ID
 * @returns Promise<ExerciseSet[]> - Ordered by set_number
 * @throws Error if database query fails
 */
export async function getExerciseSets(
  workoutExerciseId: string
): Promise<ExerciseSet[]> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select('*')
    .eq('workout_exercise_id', workoutExerciseId)
    .order('set_number', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch exercise sets: ${error.message}`);
  }

  return data || [];
}

/**
 * Update a set (reps, weight, completion status, etc.)
 * @param setId - Exercise set ID
 * @param updates - Partial set data to update
 * @returns Promise<ExerciseSet> - Updated set
 * @throws Error if update fails
 */
export async function updateSet(
  setId: string,
  updates: Partial<Omit<ExerciseSet, 'id' | 'workout_exercise_id' | 'created_at'>>
): Promise<ExerciseSet> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .update(updates)
    .eq('id', setId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update set: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned after updating set');
  }

  return data;
}

/**
 * Mark a set as complete
 * @param setId - Exercise set ID
 * @returns Promise<ExerciseSet> - Updated set
 * @throws Error if update fails
 */
export async function markSetComplete(setId: string): Promise<ExerciseSet> {
  return updateSet(setId, { completed: true });
}

/**
 * Delete a set
 * @param setId - Exercise set ID
 * @returns Promise<void>
 * @throws Error if deletion fails
 */
export async function deleteSet(setId: string): Promise<void> {
  const { error } = await supabase
    .from('exercise_sets')
    .delete()
    .eq('id', setId);

  if (error) {
    throw new Error(`Failed to delete set: ${error.message}`);
  }
}

/**
 * Delete all sets for a workout exercise
 * @param workoutExerciseId - Workout exercise ID
 * @returns Promise<void>
 * @throws Error if deletion fails
 */
export async function deleteAllSetsForExercise(
  workoutExerciseId: string
): Promise<void> {
  const { error } = await supabase
    .from('exercise_sets')
    .delete()
    .eq('workout_exercise_id', workoutExerciseId);

  if (error) {
    throw new Error(`Failed to delete all sets for exercise: ${error.message}`);
  }
}
