import { supabase } from './supabase';
import { getWorkoutsByDateRange, getWorkoutSession } from './workoutService';
import { getExercisePRs as getPRsForExercise } from './prService';
import type {
  ExerciseProgress,
  PersonalRecord,
  PRRecordType,
  ExerciseSet,
  WorkoutExercise,
  WorkoutSession,
} from './types';
import { formatISODate, parseISODate } from '../utils/dateUtils';

/**
 * Exercise Statistics Service
 * Provides detailed statistics and progress tracking for individual exercises
 */

// ============================================================================
// EXERCISE HISTORY
// ============================================================================

export interface ExerciseHistorySession {
  workoutId: string;
  date: string;
  sets: Array<{
    setNumber: number;
    weight: number;
    reps: number;
    completed: boolean;
  }>;
  maxWeight: number;
  totalVolume: number;
  totalReps: number;
}

/**
 * Get complete history of all sessions where an exercise was performed
 * @param exerciseId - Exercise ID
 * @param userId - User ID
 * @returns Array of sessions with set details
 */
export async function getExerciseHistory(
  exerciseId: string,
  userId: string
): Promise<ExerciseHistorySession[]> {
  try {
    // Query workout_exercises joined with workout_sessions and exercise_sets
    const { data, error } = await supabase
      .from('workout_exercises')
      .select(`
        id,
        workout_session_id,
        exercise_id,
        workout_sessions!inner (
          id,
          date,
          user_id
        ),
        exercise_sets (
          set_number,
          weight_kg,
          reps,
          completed
        )
      `)
      .eq('exercise_id', exerciseId)
      .eq('workout_sessions.user_id', userId)
      .order('workout_sessions(date)', { ascending: false });

    if (error) {
      console.error('Error fetching exercise history:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform the data
    // TODO: type Supabase join result properly
    const history: ExerciseHistorySession[] = data.map((workoutExercise: Record<string, unknown>) => {
      const session = Array.isArray(workoutExercise.workout_sessions)
        ? workoutExercise.workout_sessions[0]
        : workoutExercise.workout_sessions;
      
      const sets = (workoutExercise.exercise_sets || []) as Array<{
        set_number: number;
        weight_kg: number | null;
        reps: number;
        completed: boolean;
      }>;

      const transformedSets = sets.map(set => ({
        setNumber: set.set_number,
        weight: set.weight_kg || 0,
        reps: set.reps,
        completed: set.completed,
      }));

      let maxWeight = 0;
      let totalVolume = 0;
      let totalReps = 0;

      transformedSets.forEach(set => {
        if (set.completed) {
          maxWeight = Math.max(maxWeight, set.weight);
          totalVolume += set.weight * set.reps;
          totalReps += set.reps;
        }
      });

      return {
        workoutId: session.id,
        date: session.date,
        sets: transformedSets,
        maxWeight,
        totalVolume,
        totalReps,
      };
    });

    return history;
  } catch (error) {
    console.error('Error in getExerciseHistory:', error);
    return [];
  }
}

// ============================================================================
// PROGRESSION DATA (for charts)
// ============================================================================

export interface ProgressionDataPoint {
  date: string;
  value: number;
}

/**
 * Get weight progression data for charts
 * @param exerciseId - Exercise ID
 * @param userId - User ID
 * @returns Array of {date, maxWeight} data points
 */
export async function getExerciseWeightProgression(
  exerciseId: string,
  userId: string
): Promise<ProgressionDataPoint[]> {
  const history = await getExerciseHistory(exerciseId, userId);
  
  return history
    .map(session => ({
      date: session.date,
      value: session.maxWeight,
    }))
    .reverse(); // Oldest to newest for chart
}

/**
 * Get volume progression data for charts
 * @param exerciseId - Exercise ID
 * @param userId - User ID
 * @returns Array of {date, totalVolume} data points
 */
export async function getExerciseVolumeProgression(
  exerciseId: string,
  userId: string
): Promise<ProgressionDataPoint[]> {
  const history = await getExerciseHistory(exerciseId, userId);
  
  return history
    .map(session => ({
      date: session.date,
      value: session.totalVolume,
    }))
    .reverse(); // Oldest to newest for chart
}

// ============================================================================
// EXERCISE PRs (enhanced from prService)
// ============================================================================

export interface ExercisePRSummary {
  maxWeight: PersonalRecord | null;
  maxReps: PersonalRecord | null;
  estimated1RM: PersonalRecord | null;
  maxVolume: PersonalRecord | null;
}

/**
 * Get all current PRs for an exercise in organized format
 * @param exerciseId - Exercise ID
 * @param userId - User ID
 * @returns Organized PR summary
 */
export async function getExercisePRSummary(
  exerciseId: string,
  userId: string
): Promise<ExercisePRSummary> {
  const prs = await getPRsForExercise(userId, exerciseId);
  
  const summary: ExercisePRSummary = {
    maxWeight: null,
    maxReps: null,
    estimated1RM: null,
    maxVolume: null,
  };

  prs.forEach(pr => {
    switch (pr.record_type) {
      case 'max_weight':
        summary.maxWeight = pr;
        break;
      case 'max_reps':
        summary.maxReps = pr;
        break;
      case 'estimated_1rm':
        summary.estimated1RM = pr;
        break;
      case 'max_volume':
        summary.maxVolume = pr;
        break;
    }
  });

  return summary;
}

// ============================================================================
// EXERCISE STATISTICS
// ============================================================================

export interface ExerciseStats {
  timesPerformed: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  averageWeight: number;
  averageReps: number;
  averageSetsPerSession: number;
  firstPerformed: string | null;
  lastPerformed: string | null;
}

/**
 * Get comprehensive statistics for an exercise
 * @param exerciseId - Exercise ID
 * @param userId - User ID
 * @returns Complete exercise statistics
 */
export async function getExerciseStats(
  exerciseId: string,
  userId: string
): Promise<ExerciseStats> {
  const history = await getExerciseHistory(exerciseId, userId);
  
  if (history.length === 0) {
    return {
      timesPerformed: 0,
      totalSets: 0,
      totalReps: 0,
      totalVolume: 0,
      averageWeight: 0,
      averageReps: 0,
      averageSetsPerSession: 0,
      firstPerformed: null,
      lastPerformed: null,
    };
  }

  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;
  let totalWeightedSets = 0;
  let sumWeights = 0;

  history.forEach(session => {
    const completedSets = session.sets.filter(s => s.completed);
    totalSets += completedSets.length;
    totalReps += session.totalReps;
    totalVolume += session.totalVolume;
    
    completedSets.forEach(set => {
      if (set.weight > 0) {
        sumWeights += set.weight;
        totalWeightedSets++;
      }
    });
  });

  // Dates are already sorted newest first
  const lastPerformed = history[0].date;
  const firstPerformed = history[history.length - 1].date;

  return {
    timesPerformed: history.length,
    totalSets,
    totalReps,
    totalVolume,
    averageWeight: totalWeightedSets > 0 ? sumWeights / totalWeightedSets : 0,
    averageReps: totalSets > 0 ? totalReps / totalSets : 0,
    averageSetsPerSession: history.length > 0 ? totalSets / history.length : 0,
    firstPerformed,
    lastPerformed,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format set data for display (e.g., "3 x 10 @ 60kg")
 * @param sets - Array of sets
 * @returns Formatted string
 */
export function formatSetsForDisplay(
  sets: Array<{ setNumber: number; weight: number; reps: number; completed: boolean }>
): string {
  const completedSets = sets.filter(s => s.completed);
  
  if (completedSets.length === 0) {
    return 'No completed sets';
  }

  // Group sets by weight and reps
  const grouped = new Map<string, number>();
  
  completedSets.forEach(set => {
    const key = `${set.reps} @ ${set.weight}kg`;
    grouped.set(key, (grouped.get(key) || 0) + 1);
  });

  // Format as "3 x 10 @ 60kg, 2 x 8 @ 65kg"
  return Array.from(grouped.entries())
    .map(([key, count]) => `${count} × ${key}`)
    .join(', ');
}

/**
 * Calculate frequency per week based on total performances and date range
 * @param timesPerformed - Total number of times performed
 * @param firstDate - First performance date
 * @param lastDate - Last performance date
 * @returns Frequency per week
 */
export function calculateFrequencyPerWeek(
  timesPerformed: number,
  firstDate: string,
  lastDate: string
): number {
  if (timesPerformed === 0) return 0;
  
  const first = parseISODate(firstDate);
  const last = parseISODate(lastDate);
  
  const daysDiff = Math.max(
    1,
    Math.round((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24))
  );
  
  const weeks = Math.max(1, daysDiff / 7);
  return timesPerformed / weeks;
}
