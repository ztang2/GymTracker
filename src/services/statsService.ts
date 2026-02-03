import {
  getWorkoutsByDateRange,
  getWorkoutSession,
  getRecentWorkouts,
} from './workoutService';
import { supabase } from './supabase';
import type {
  WorkoutStats,
  TimeRange,
  DayData,
  CalendarData,
  ExerciseFrequency,
  CategoryDistribution,
  WeeklyCount,
  ExerciseProgress,
  ExerciseCategory,
  WorkoutSession,
  LastPerformance,
} from './types';
import {
  formatISODate,
  getLastNWeeks,
  getLastNMonths,
  getDateRange,
  isSameDay,
  subtractDays,
  formatWeekIdentifier,
  getToday,
  getYesterday,
  parseISODate,
} from '../utils/dateUtils';

/**
 * Stats Service
 * Provides analytics and statistics for workout data
 */

// ============================================================================
// WORKOUT STATISTICS
// ============================================================================

/**
 * Get date range based on TimeRange enum
 * @param range - Time range (week, month, 3months, year, all)
 * @returns Object with startDate and endDate as ISO strings
 */
export function getDateRangeForTimeRange(range: TimeRange): { startDate: string; endDate: string } {
  const today = new Date();
  const endDate = formatISODate(today);

  switch (range) {
    case 'week':
      return { startDate: formatISODate(subtractDays(today, 7)), endDate };
    case 'month':
      return { startDate: formatISODate(subtractDays(today, 30)), endDate };
    case '3months':
      return { startDate: formatISODate(subtractDays(today, 90)), endDate };
    case 'year':
      return { startDate: formatISODate(subtractDays(today, 365)), endDate };
    case 'all':
      // Use a very old date (10 years ago) to get all workouts
      return { startDate: formatISODate(subtractDays(today, 3650)), endDate };
    default:
      return { startDate: formatISODate(subtractDays(today, 30)), endDate };
  }
}

/**
 * Get workout statistics for a date range
 * @param userId - User ID
 * @param startDate - Start date (ISO string YYYY-MM-DD)
 * @param endDate - End date (ISO string YYYY-MM-DD)
 * @returns Promise<WorkoutStats> - Aggregated statistics
 */
export async function getWorkoutStats(
  userId: string,
  startDate: string,
  endDate: string
): Promise<WorkoutStats> {
  const workouts = await getWorkoutsByDateRange(userId, startDate, endDate);

  const totalWorkouts = workouts.length;
  const totalDurationMinutes = workouts.reduce(
    (sum, w) => sum + (w.duration_minutes || 0),
    0
  );
  const avgWorkoutDuration =
    totalWorkouts > 0 ? Math.round(totalDurationMinutes / totalWorkouts) : 0;

  // Calculate workouts this week
  const weekRange = getLastNWeeks(1);
  const workoutsThisWeek = workouts.filter(
    w => w.date >= formatISODate(weekRange.startDate)
  ).length;

  // Calculate workouts this month
  const monthRange = getLastNMonths(1);
  const workoutsThisMonth = workouts.filter(
    w => w.date >= formatISODate(monthRange.startDate)
  ).length;

  return {
    total_workouts: totalWorkouts,
    total_duration_minutes: totalDurationMinutes,
    avg_workout_duration: avgWorkoutDuration,
    workouts_this_week: workoutsThisWeek,
    workouts_this_month: workoutsThisMonth,
    most_frequent_exercises: [],
  };
}

/**
 * Get workout statistics by time range
 * @param userId - User ID
 * @param range - Time range (week, month, 3months, year, all)
 * @returns Promise<WorkoutStats> - Aggregated statistics
 */
export async function getWorkoutStatsByRange(
  userId: string,
  range: TimeRange
): Promise<WorkoutStats> {
  const { startDate, endDate } = getDateRangeForTimeRange(range);
  return getWorkoutStats(userId, startDate, endDate);
}

// ============================================================================
// DAILY WORKOUT COUNTS (For Contribution Calendar)
// ============================================================================

/**
 * Get daily workout counts for date range
 * @param userId - User ID
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @returns Promise<DayData[]> - Array of daily data
 */
export async function getDailyWorkoutCounts(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DayData[]> {
  const workouts = await getWorkoutsByDateRange(userId, startDate, endDate);

  // Create a map of date -> workouts
  const workoutsByDate = new Map<string, WorkoutSession[]>();
  workouts.forEach(workout => {
    const existing = workoutsByDate.get(workout.date) || [];
    workoutsByDate.set(workout.date, [...existing, workout]);
  });

  // Generate array of all dates in range (parse as local to avoid UTC shift)
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  const dates = getDateRange(start, end);

  // Map to DayData
  const dayData: DayData[] = dates.map(date => {
    const dateStr = formatISODate(date);
    const dayWorkouts = workoutsByDate.get(dateStr) || [];

    return {
      date: dateStr,
      count: dayWorkouts.length,
      totalDuration: dayWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0),
      totalVolume: 0, // Will be calculated if needed
    };
  });

  return dayData;
}

/**
 * Get calendar data with daily counts and streaks
 * @param userId - User ID
 * @param weeks - Number of weeks to show (default: 26 for ~6 months)
 * @returns Promise<CalendarData> - Calendar data with streaks
 */
export async function getCalendarData(
  userId: string,
  weeks: number = 26
): Promise<CalendarData> {
  const { startDate: rangeStart, endDate: rangeEnd } = getLastNWeeks(weeks);
  const startDate = formatISODate(rangeStart);
  const endDate = formatISODate(rangeEnd);

  const days = await getDailyWorkoutCounts(userId, startDate, endDate);
  const [currentStreak, longestStreak] = await Promise.all([
    getCurrentStreak(userId),
    getLongestStreak(userId),
  ]);

  return {
    days,
    startDate,
    endDate,
    currentStreak,
    longestStreak,
  };
}

// ============================================================================
// STREAK CALCULATIONS
// ============================================================================

/**
 * Get current workout streak (consecutive days with workouts from today backwards)
 * @param userId - User ID
 * @returns Promise<number> - Current streak in days
 */
export async function getCurrentStreak(userId: string): Promise<number> {
  // Get workouts from last 365 days
  const { startDate, endDate } = getLastNWeeks(52);
  const workouts = await getWorkoutsByDateRange(
    userId,
    formatISODate(startDate),
    formatISODate(endDate)
  );

  if (workouts.length === 0) {
    return 0;
  }

  // Create set of dates with workouts
  const workoutDates = new Set(workouts.map(w => w.date));

  // Start from today and go backwards
  let streak = 0;
  let currentDate = getToday();
  const yesterday = getYesterday();

  // Check if there's a workout today or yesterday (grace period)
  if (!workoutDates.has(formatISODate(currentDate))) {
    currentDate = yesterday;
    if (!workoutDates.has(formatISODate(currentDate))) {
      return 0; // No recent workout
    }
  }

  // Count consecutive days
  while (workoutDates.has(formatISODate(currentDate))) {
    streak++;
    currentDate = subtractDays(currentDate, 1);
  }

  return streak;
}

/**
 * Get longest workout streak in all history
 * @param userId - User ID
 * @returns Promise<number> - Longest streak in days
 */
export async function getLongestStreak(userId: string): Promise<number> {
  // Get all workouts
  const { startDate, endDate } = getDateRangeForTimeRange('all');
  const workouts = await getWorkoutsByDateRange(userId, startDate, endDate);

  if (workouts.length === 0) {
    return 0;
  }

  // Get unique workout dates sorted
  const workoutDates = Array.from(new Set(workouts.map(w => w.date))).sort();

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < workoutDates.length; i++) {
    const prevDate = parseISODate(workoutDates[i - 1]);
    const currDate = parseISODate(workoutDates[i]);

    // Check if dates are consecutive
    const daysDiff = Math.round(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

/**
 * Get both current and longest streaks
 * @param userId - User ID
 * @returns Promise<{current: number, longest: number}>
 */
export async function getStreaks(
  userId: string
): Promise<{ current: number; longest: number }> {
  const [current, longest] = await Promise.all([
    getCurrentStreak(userId),
    getLongestStreak(userId),
  ]);

  return { current, longest };
}

// ============================================================================
// VOLUME CALCULATIONS
// ============================================================================

/**
 * Get total volume (sum of reps × weight) for date range
 * @param userId - User ID
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @returns Promise<number> - Total volume in kg
 */
export async function getTotalVolume(
  userId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const workouts = await getWorkoutsByDateRange(userId, startDate, endDate);

  let totalVolume = 0;

  // Fetch detailed data for each workout and calculate volume
  for (const workout of workouts) {
    const fullWorkout = await getWorkoutSession(workout.id, userId);
    if (!fullWorkout) continue;

    for (const exercise of fullWorkout.exercises) {
      for (const set of exercise.sets) {
        const volume = set.reps * (set.weight_kg || 0);
        totalVolume += volume;
      }
    }
  }

  return Math.round(totalVolume);
}

/**
 * Get volume by exercise category
 * @param userId - User ID
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @returns Promise<Record<ExerciseCategory, number>> - Volume per category
 */
export async function getVolumeByCategory(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Record<ExerciseCategory, number>> {
  const workouts = await getWorkoutsByDateRange(userId, startDate, endDate);

  const volumeByCategory: Record<string, number> = {};

  for (const workout of workouts) {
    const fullWorkout = await getWorkoutSession(workout.id, userId);
    if (!fullWorkout) continue;

    for (const exercise of fullWorkout.exercises) {
      const category = exercise.exercise.category;

      for (const set of exercise.sets) {
        const volume = set.reps * (set.weight_kg || 0);
        volumeByCategory[category] = (volumeByCategory[category] || 0) + volume;
      }
    }
  }

  return volumeByCategory as Record<ExerciseCategory, number>;
}

// ============================================================================
// CATEGORY DISTRIBUTION
// ============================================================================

/**
 * Get category distribution (workout counts per category)
 * @param userId - User ID
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @returns Promise<CategoryDistribution[]> - Array of category stats
 */
export async function getCategoryDistribution(
  userId: string,
  startDate: string,
  endDate: string
): Promise<CategoryDistribution[]> {
  const workouts = await getWorkoutsByDateRange(userId, startDate, endDate);

  const categoryCountMap = new Map<ExerciseCategory, number>();

  for (const workout of workouts) {
    const fullWorkout = await getWorkoutSession(workout.id, userId);
    if (!fullWorkout) continue;

    // Count each unique category once per workout
    const categoriesInWorkout = new Set<ExerciseCategory>();
    for (const exercise of fullWorkout.exercises) {
      categoriesInWorkout.add(exercise.exercise.category);
    }

    categoriesInWorkout.forEach(category => {
      categoryCountMap.set(category, (categoryCountMap.get(category) || 0) + 1);
    });
  }

  // Calculate total and percentages
  const totalCount = Array.from(categoryCountMap.values()).reduce((sum, count) => sum + count, 0);

  const distribution: CategoryDistribution[] = Array.from(categoryCountMap.entries()).map(
    ([category, count]) => ({
      category,
      count,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
    })
  );

  // Sort by count descending
  return distribution.sort((a, b) => b.count - a.count);
}

// ============================================================================
// EXERCISE FREQUENCY
// ============================================================================

/**
 * Get most frequent exercises
 * @param userId - User ID
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @param limit - Number of exercises to return (default: 10)
 * @returns Promise<ExerciseFrequency[]> - Top exercises by frequency
 */
export async function getMostFrequentExercises(
  userId: string,
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<ExerciseFrequency[]> {
  const workouts = await getWorkoutsByDateRange(userId, startDate, endDate);

  const exerciseCountMap = new Map<
    string,
    { exercise_id: string; exercise_name: string; category: ExerciseCategory; count: number }
  >();

  for (const workout of workouts) {
    const fullWorkout = await getWorkoutSession(workout.id, userId);
    if (!fullWorkout) continue;

    for (const exercise of fullWorkout.exercises) {
      const key = exercise.exercise_id;
      const existing = exerciseCountMap.get(key);

      if (existing) {
        existing.count++;
      } else {
        exerciseCountMap.set(key, {
          exercise_id: exercise.exercise_id,
          exercise_name: exercise.exercise.name,
          category: exercise.exercise.category,
          count: 1,
        });
      }
    }
  }

  // Convert to array and sort by count descending
  const exercises = Array.from(exerciseCountMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return exercises;
}

// ============================================================================
// WEEKLY TRENDS
// ============================================================================

/**
 * Get weekly workout counts
 * @param userId - User ID
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @returns Promise<WeeklyCount[]> - Weekly aggregated data
 */
export async function getWeeklyWorkoutCounts(
  userId: string,
  startDate: string,
  endDate: string
): Promise<WeeklyCount[]> {
  const workouts = await getWorkoutsByDateRange(userId, startDate, endDate);

  const weeklyMap = new Map<string, WeeklyCount>();

  for (const workout of workouts) {
    const date = parseISODate(workout.date);
    const weekId = formatWeekIdentifier(date);

    const existing = weeklyMap.get(weekId);

    if (existing) {
      existing.count++;
      existing.totalDuration += workout.duration_minutes || 0;
    } else {
      weeklyMap.set(weekId, {
        week: weekId,
        count: 1,
        totalDuration: workout.duration_minutes || 0,
        totalVolume: 0,
      });
    }
  }

  // Convert to array and sort by week
  return Array.from(weeklyMap.values()).sort((a, b) => a.week.localeCompare(b.week));
}

// ============================================================================
// EXERCISE PROGRESS TRACKING
// ============================================================================

/**
 * Get exercise progress over time (max weight, volume, etc.)
 * @param userId - User ID
 * @param exerciseId - Exercise ID
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @returns Promise<ExerciseProgress[]> - Progress data points
 */
export async function getExerciseProgress(
  userId: string,
  exerciseId: string,
  startDate: string,
  endDate: string
): Promise<ExerciseProgress[]> {
  const workouts = await getWorkoutsByDateRange(userId, startDate, endDate);

  const progressData: ExerciseProgress[] = [];

  for (const workout of workouts) {
    const fullWorkout = await getWorkoutSession(workout.id, userId);
    if (!fullWorkout) continue;

    // Find exercises matching the exerciseId
    const matchingExercises = fullWorkout.exercises.filter(
      ex => ex.exercise_id === exerciseId
    );

    if (matchingExercises.length === 0) continue;

    let maxWeight = 0;
    let totalVolume = 0;
    let totalReps = 0;

    for (const exercise of matchingExercises) {
      for (const set of exercise.sets) {
        const weight = set.weight_kg || 0;
        maxWeight = Math.max(maxWeight, weight);
        totalVolume += set.reps * weight;
        totalReps += set.reps;
      }
    }

    if (matchingExercises.length > 0) {
      progressData.push({
        exercise_id: exerciseId,
        exercise_name: matchingExercises[0].exercise.name,
        date: workout.date,
        max_weight: maxWeight,
        total_volume: totalVolume,
        total_reps: totalReps,
      });
    }
  }

  return progressData.sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================================================
// LAST PERFORMANCE (For showing previous weights during workout)
// ============================================================================

/**
 * Get the last performance data for a specific exercise
 * Shows what weight/reps the user did last time for this exercise
 * @param userId - User ID
 * @param exerciseId - Exercise ID
 * @returns Promise<LastPerformance | null> - Last performance data or null if no history
 */
export async function getLastPerformance(
  userId: string,
  exerciseId: string
): Promise<LastPerformance | null> {
  try {
    // Query to get the most recent workout containing this exercise
    const { data, error } = await supabase
      .from('workout_exercises')
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
      .limit(5); // Get last 5 occurrences to calculate max

    if (error) {
      console.error('Error fetching last performance:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Get the most recent workout with this exercise
    const mostRecent = data[0];
    // Handle both single object and array cases from Supabase
    const exerciseData = mostRecent.exercises;
    const exercise = (Array.isArray(exerciseData) ? exerciseData[0] : exerciseData) as { id: string; name: string } | undefined;
    const sessionData = mostRecent.workout_sessions;
    const session = (Array.isArray(sessionData) ? sessionData[0] : sessionData) as { id: string; date: string; user_id: string } | undefined;
    const sets = mostRecent.exercise_sets as Array<{ weight_kg: number | null; reps: number; completed: boolean }>;

    if (!exercise || !session) {
      return null;
    }

    // Find the last completed set with weight
    const completedSets = sets.filter(s => s.completed && s.reps > 0);
    if (completedSets.length === 0) {
      return null;
    }

    // Get the last set (most recent)
    const lastSet = completedSets[completedSets.length - 1];

    // Calculate max weight and max reps across all historical data
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
 * More efficient than calling getLastPerformance multiple times
 * @param userId - User ID
 * @param exerciseIds - Array of exercise IDs
 * @returns Promise<Map<string, LastPerformance>> - Map of exerciseId to LastPerformance
 */
export async function getLastPerformanceBatch(
  userId: string,
  exerciseIds: string[]
): Promise<Map<string, LastPerformance>> {
  const results = new Map<string, LastPerformance>();

  // Fetch all in parallel
  const promises = exerciseIds.map(async (exerciseId) => {
    const perf = await getLastPerformance(userId, exerciseId);
    if (perf) {
      results.set(exerciseId, perf);
    }
  });

  await Promise.all(promises);
  return results;
}

// ============================================================================
// BADGE-RELATED STAT HELPERS
// ============================================================================

/**
 * Get total number of personal records set by user
 */
export async function getTotalPRCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('personal_records')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error getting PR count:', error);
    return 0;
  }
  return count || 0;
}

/**
 * Get max weight for a specific exercise by name (e.g. 'Bench Press')
 */
export async function getExerciseMaxWeight(userId: string, exerciseName: string): Promise<number> {
  // First get the exercise id
  const { data: exercise } = await supabase
    .from('exercises')
    .select('id')
    .ilike('name', exerciseName)
    .single();

  if (!exercise) return 0;

  const { data, error } = await supabase
    .from('personal_records')
    .select('value')
    .eq('user_id', userId)
    .eq('exercise_id', exercise.id)
    .eq('record_type', 'max_weight')
    .single();

  if (error || !data) return 0;
  return Number(data.value);
}

/**
 * Get count of unique exercises ever performed
 */
export async function getUniqueExerciseCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('workout_exercises')
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
    .from('workout_exercises')
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
    .from('workout_sessions')
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
    .from('workout_sessions')
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
    .from('workout_sessions')
    .select('date')
    .eq('user_id', userId);

  if (error || !data) return 0;

  return data.filter((w) => {
    const day = new Date(w.date + 'T12:00:00').getDay();
    return day === 0 || day === 6;
  }).length;
}
