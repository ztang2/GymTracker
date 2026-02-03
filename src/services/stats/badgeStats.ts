import { supabase } from '../supabase';
import { TABLES } from '../../constants/tables';
import { formatISODate } from '../../utils/dateUtils';

/**
 * Get count of unique exercises ever performed
 */
export async function getUniqueExerciseCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from(TABLES.WORKOUT_EXERCISES)
    .select('exercise_id, workout_session_id!inner(user_id)')
    .eq('workout_session_id.user_id', userId);

  if (error || !data) return 0;

  const unique = new Set(data.map((d) => d.exercise_id));
  return unique.size;
}

/**
 * Check if user trained all muscle groups in the current week
 * Returns 1 if all groups were hit, 0 otherwise
 */
export async function getAllMuscleGroupsThisWeek(userId: string): Promise<number> {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  const startDate = formatISODate(monday);
  const endDate = formatISODate(today);

  const { data, error } = await supabase
    .from(TABLES.WORKOUT_EXERCISES)
    .select('exercise:exercises(category), workout_session_id!inner(user_id, date)')
    .eq('workout_session_id.user_id', userId)
    .gte('workout_session_id.date', startDate)
    .lte('workout_session_id.date', endDate);

  if (error || !data) return 0;

  const categories = new Set(data.map((d) => (d.exercise as { category?: string })?.category).filter(Boolean));
  const allGroups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
  const hitAll = allGroups.every(g => categories.has(g));
  return hitAll ? 1 : 0;
}

/**
 * Get count of workouts started before 7 AM
 */
export async function getEarlyWorkoutCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from(TABLES.WORKOUT_SESSIONS)
    .select('start_time')
    .eq('user_id', userId)
    .not('start_time', 'is', null);

  if (error || !data) return 0;

  return data.filter((w) => {
    const hour = new Date(w.start_time).getHours();
    return hour < 7;
  }).length;
}

/**
 * Get count of workouts started after 10 PM
 */
export async function getNightWorkoutCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from(TABLES.WORKOUT_SESSIONS)
    .select('start_time')
    .eq('user_id', userId)
    .not('start_time', 'is', null);

  if (error || !data) return 0;

  return data.filter((w) => {
    const hour = new Date(w.start_time).getHours();
    return hour >= 22;
  }).length;
}

/**
 * Get count of workouts on weekends (Saturday/Sunday)
 */
export async function getWeekendWorkoutCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from(TABLES.WORKOUT_SESSIONS)
    .select('date')
    .eq('user_id', userId);

  if (error || !data) return 0;

  return data.filter((w) => {
    const day = new Date(w.date + 'T12:00:00').getDay();
    return day === 0 || day === 6;
  }).length;
}
