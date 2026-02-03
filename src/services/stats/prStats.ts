import { supabase } from '../supabase';
import { TABLES } from '../../constants/tables';
import type { LastPerformance } from '../types';

/**
 * Get the last performance data for a specific exercise
 */
export async function getLastPerformance(
  userId: string,
  exerciseId: string
): Promise<LastPerformance | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.WORKOUT_EXERCISES)
      .select(`
        id,
        workout_session_id,
        exercise_id,
        exercises (
          id,
          name
        ),
        workout_sessions!inner (
          id,
          date,
          user_id
        ),
        exercise_sets (
          weight_kg,
          reps,
          completed
        )
      `)
      .eq('exercise_id', exerciseId)
      .eq('workout_sessions.user_id', userId)
      .order('workout_sessions(date)', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching last performance:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const mostRecent = data[0];
    const exerciseData = mostRecent.exercises;
    const exercise = (Array.isArray(exerciseData) ? exerciseData[0] : exerciseData) as { id: string; name: string } | undefined;
    const sessionData = mostRecent.workout_sessions;
    const session = (Array.isArray(sessionData) ? sessionData[0] : sessionData) as { id: string; date: string; user_id: string } | undefined;
    const sets = mostRecent.exercise_sets as Array<{ weight_kg: number | null; reps: number; completed: boolean }>;

    if (!exercise || !session) {
      return null;
    }

    const completedSets = sets.filter(s => s.completed && s.reps > 0);
    if (completedSets.length === 0) {
      return null;
    }

    const lastSet = completedSets[completedSets.length - 1];

    let maxWeight = 0;
    let maxReps = 0;

    for (const workout of data) {
      const workoutSets = workout.exercise_sets as Array<{ weight_kg: number | null; reps: number; completed: boolean }>;
      for (const set of workoutSets) {
        if (set.completed) {
          maxWeight = Math.max(maxWeight, set.weight_kg || 0);
          maxReps = Math.max(maxReps, set.reps);
        }
      }
    }

    return {
      exerciseId: exerciseId,
      exerciseName: exercise.name,
      lastWeight: lastSet.weight_kg,
      lastReps: lastSet.reps,
      lastDate: session.date,
      maxWeight,
      maxReps,
    };
  } catch (error) {
    console.error('Error in getLastPerformance:', error);
    return null;
  }
}

/**
 * Get last performance data for multiple exercises at once
 */
export async function getLastPerformanceBatch(
  userId: string,
  exerciseIds: string[]
): Promise<Map<string, LastPerformance>> {
  const results = new Map<string, LastPerformance>();

  const promises = exerciseIds.map(async (exerciseId) => {
    const perf = await getLastPerformance(userId, exerciseId);
    if (perf) {
      results.set(exerciseId, perf);
    }
  });

  await Promise.all(promises);
  return results;
}

/**
 * Get total number of personal records set by user
 */
export async function getTotalPRCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from(TABLES.PERSONAL_RECORDS)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error getting PR count:', error);
    return 0;
  }
  return count || 0;
}

/**
 * Get max weight for a specific exercise by name
 */
export async function getExerciseMaxWeight(userId: string, exerciseName: string): Promise<number> {
  const { data: exercise } = await supabase
    .from(TABLES.EXERCISES)
    .select('id')
    .ilike('name', exerciseName)
    .single();

  if (!exercise) return 0;

  const { data, error } = await supabase
    .from(TABLES.PERSONAL_RECORDS)
    .select('value')
    .eq('user_id', userId)
    .eq('exercise_id', exercise.id)
    .eq('record_type', 'max_weight')
    .single();

  if (error || !data) return 0;
  return Number(data.value);
}
