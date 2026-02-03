import {
  getWorkoutsByDateRange,
  getWorkoutSession,
} from '../workoutService';
import type {
  WorkoutStats,
  TimeRange,
  DayData,
  ExerciseFrequency,
  CategoryDistribution,
  WeeklyCount,
  ExerciseProgress,
  ExerciseCategory,
  WorkoutSession,
} from '../types';
import {
  formatISODate,
  getLastNWeeks,
  getLastNMonths,
  getDateRange,
  subtractDays,
  formatWeekIdentifier,
  parseISODate,
} from '../../utils/dateUtils';
import { getDateRangeForTimeRange } from './timeHelpers';

/**
 * Get workout statistics for a date range
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

  const weekRange = getLastNWeeks(1);
  const workoutsThisWeek = workouts.filter(
    w => w.date >= formatISODate(weekRange.startDate)
  ).length;

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
 */
export async function getWorkoutStatsByRange(
  userId: string,
  range: TimeRange
): Promise<WorkoutStats> {
  const { startDate, endDate } = getDateRangeForTimeRange(range);
  return getWorkoutStats(userId, startDate, endDate);
}

/**
 * Get daily workout counts for date range
 */
export async function getDailyWorkoutCounts(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DayData[]> {
  const workouts = await getWorkoutsByDateRange(userId, startDate, endDate);

  const workoutsByDate = new Map<string, WorkoutSession[]>();
  workouts.forEach(workout => {
    const existing = workoutsByDate.get(workout.date) || [];
    workoutsByDate.set(workout.date, [...existing, workout]);
  });

  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  const dates = getDateRange(start, end);

  const dayData: DayData[] = dates.map(date => {
    const dateStr = formatISODate(date);
    const dayWorkouts = workoutsByDate.get(dateStr) || [];

    return {
      date: dateStr,
      count: dayWorkouts.length,
      totalDuration: dayWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0),
      totalVolume: 0,
    };
  });

  return dayData;
}

/**
 * Get total volume (sum of reps × weight) for date range
 */
export async function getTotalVolume(
  userId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const workouts = await getWorkoutsByDateRange(userId, startDate, endDate);

  let totalVolume = 0;

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

/**
 * Get category distribution (workout counts per category)
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

    const categoriesInWorkout = new Set<ExerciseCategory>();
    for (const exercise of fullWorkout.exercises) {
      categoriesInWorkout.add(exercise.exercise.category);
    }

    categoriesInWorkout.forEach(category => {
      categoryCountMap.set(category, (categoryCountMap.get(category) || 0) + 1);
    });
  }

  const totalCount = Array.from(categoryCountMap.values()).reduce((sum, count) => sum + count, 0);

  const distribution: CategoryDistribution[] = Array.from(categoryCountMap.entries()).map(
    ([category, count]) => ({
      category,
      count,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
    })
  );

  return distribution.sort((a, b) => b.count - a.count);
}

/**
 * Get most frequent exercises
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

  const exercises = Array.from(exerciseCountMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return exercises;
}

/**
 * Get weekly workout counts
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

  return Array.from(weeklyMap.values()).sort((a, b) => a.week.localeCompare(b.week));
}

/**
 * Get exercise progress over time
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
