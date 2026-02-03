import { supabase } from './supabase';
import { TABLES } from '../constants/tables';
import type {
  PersonalRecord,
  PRRecordType,
  PRDetectionResult,
  Exercise,
} from './types';

/**
 * Personal Records (PR) Service
 * Handles tracking and detection of personal records
 */

// ============================================================================
// PR CRUD OPERATIONS
// ============================================================================

/**
 * Get all PRs for a user
 */
export async function getUserPRs(userId: string): Promise<PersonalRecord[]> {
  const { data, error } = await supabase
    .from(TABLES.PERSONAL_RECORDS)
    .select(`
      *,
      exercise:exercises(id, name, category)
    `)
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false });

  if (error) {
    console.error('Error fetching PRs:', error);
    return [];
  }

  return data || [];
}

/**
 * Get PRs for a specific exercise
 */
export async function getExercisePRs(
  userId: string,
  exerciseId: string
): Promise<PersonalRecord[]> {
  const { data, error } = await supabase
    .from(TABLES.PERSONAL_RECORDS)
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .order('achieved_at', { ascending: false });

  if (error) {
    console.error('Error fetching exercise PRs:', error);
    return [];
  }

  return data || [];
}

/**
 * Get the current PR for a specific exercise and record type
 */
export async function getCurrentPR(
  userId: string,
  exerciseId: string,
  recordType: PRRecordType
): Promise<PersonalRecord | null> {
  const { data, error } = await supabase
    .from(TABLES.PERSONAL_RECORDS)
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .eq('record_type', recordType)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching current PR:', error);
    return null;
  }

  return data;
}

/**
 * Save or update a PR
 */
export async function savePR(
  userId: string,
  exerciseId: string,
  recordType: PRRecordType,
  value: number,
  workoutSessionId: string,
  previousValue: number | null
): Promise<PersonalRecord | null> {
  // Upsert - update if exists, insert if not
  const { data, error } = await supabase
    .from(TABLES.PERSONAL_RECORDS)
    .upsert(
      {
        user_id: userId,
        exercise_id: exerciseId,
        record_type: recordType,
        value,
        achieved_at: new Date().toISOString(),
        workout_session_id: workoutSessionId,
        previous_value: previousValue,
      },
      {
        onConflict: 'user_id,exercise_id,record_type',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error saving PR:', error);
    return null;
  }

  return data;
}

// ============================================================================
// PR DETECTION
// ============================================================================

/**
 * Calculate estimated 1RM using Epley formula
 * 1RM = weight × (1 + reps/30)
 * Note: Most accurate for reps between 1-10
 */
export function calculateEstimated1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/**
 * Detect PRs from a workout's exercise sets
 * Returns array of new PRs achieved
 */
export async function detectPRsFromWorkout(
  userId: string,
  workoutSessionId: string,
  exerciseSets: Array<{
    exerciseId: string;
    exerciseName: string;
    sets: Array<{
      weight: number;
      reps: number;
      completed: boolean;
    }>;
  }>
): Promise<PRDetectionResult[]> {
  const newPRs: PRDetectionResult[] = [];

  for (const exercise of exerciseSets) {
    // Get completed sets only
    const completedSets = exercise.sets.filter(s => s.completed && s.reps > 0);
    if (completedSets.length === 0) continue;

    // Calculate max values from this workout
    let maxWeight = 0;
    let maxReps = 0;
    let maxVolume = 0;
    let max1RM = 0;

    for (const set of completedSets) {
      maxWeight = Math.max(maxWeight, set.weight);
      maxReps = Math.max(maxReps, set.reps);
      maxVolume += set.weight * set.reps;
      const estimated1RM = calculateEstimated1RM(set.weight, set.reps);
      max1RM = Math.max(max1RM, estimated1RM);
    }

    // Check each PR type
    const prChecks: Array<{ type: PRRecordType; value: number }> = [
      { type: 'max_weight', value: maxWeight },
      { type: 'max_reps', value: maxReps },
      { type: 'estimated_1rm', value: max1RM },
      { type: 'max_volume', value: maxVolume },
    ];

    for (const check of prChecks) {
      if (check.value <= 0) continue;

      const currentPR = await getCurrentPR(userId, exercise.exerciseId, check.type);
      const previousValue = currentPR?.value || null;

      // Check if this is a new PR
      if (!previousValue || check.value > previousValue) {
        // Save the new PR
        await savePR(
          userId,
          exercise.exerciseId,
          check.type,
          check.value,
          workoutSessionId,
          previousValue
        );

        // Calculate improvement percentage
        const improvement = previousValue
          ? ((check.value - previousValue) / previousValue) * 100
          : null;

        newPRs.push({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          recordType: check.type,
          newValue: check.value,
          previousValue,
          improvement,
        });
      }
    }
  }

  return newPRs;
}

// ============================================================================
// PR DISPLAY HELPERS
// ============================================================================

/**
 * Format PR value for display
 */
export function formatPRValue(value: number, recordType: PRRecordType): string {
  switch (recordType) {
    case 'max_weight':
      return `${value.toFixed(1)} kg`;
    case 'max_reps':
      return `${value} reps`;
    case 'estimated_1rm':
      return `${value.toFixed(1)} kg (1RM)`;
    case 'max_volume':
      return `${value.toLocaleString()} kg`;
    default:
      return value.toString();
  }
}

/**
 * Get PR type display name
 */
export function getPRTypeName(recordType: PRRecordType): string {
  switch (recordType) {
    case 'max_weight':
      return 'Max Weight';
    case 'max_reps':
      return 'Max Reps';
    case 'estimated_1rm':
      return 'Estimated 1RM';
    case 'max_volume':
      return 'Max Volume';
    default:
      return recordType;
  }
}

/**
 * Get PR type icon name (Ionicons)
 */
export function getPRTypeIcon(recordType: PRRecordType): string {
  switch (recordType) {
    case 'max_weight':
      return 'barbell';
    case 'max_reps':
      return 'repeat';
    case 'estimated_1rm':
      return 'trophy';
    case 'max_volume':
      return 'stats-chart';
    default:
      return 'ribbon';
  }
}

// ============================================================================
// PR SUMMARY
// ============================================================================

/**
 * Get PR summary for a user (count by type)
 */
export async function getPRSummary(userId: string): Promise<{
  totalPRs: number;
  byType: Record<PRRecordType, number>;
  recentPRs: PersonalRecord[];
}> {
  const allPRs = await getUserPRs(userId);

  const byType: Record<PRRecordType, number> = {
    max_weight: 0,
    max_reps: 0,
    estimated_1rm: 0,
    max_volume: 0,
  };

  allPRs.forEach(pr => {
    byType[pr.record_type]++;
  });

  return {
    totalPRs: allPRs.length,
    byType,
    recentPRs: allPRs.slice(0, 5),
  };
}
