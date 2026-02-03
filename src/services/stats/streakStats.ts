import { getWorkoutsByDateRange } from '../workoutService';
import type { CalendarData } from '../types';
import {
  formatISODate,
  getLastNWeeks,
  subtractDays,
  getToday,
  getYesterday,
  parseISODate,
} from '../../utils/dateUtils';
import { getDateRangeForTimeRange } from './timeHelpers';
import { getDailyWorkoutCounts } from './coreStats';

/**
 * Get current workout streak (consecutive days with workouts from today backwards)
 */
export async function getCurrentStreak(userId: string): Promise<number> {
  const { startDate, endDate } = getLastNWeeks(52);
  const workouts = await getWorkoutsByDateRange(
    userId,
    formatISODate(startDate),
    formatISODate(endDate)
  );

  if (workouts.length === 0) {
    return 0;
  }

  const workoutDates = new Set(workouts.map(w => w.date));

  let streak = 0;
  let currentDate = getToday();
  const yesterday = getYesterday();

  if (!workoutDates.has(formatISODate(currentDate))) {
    currentDate = yesterday;
    if (!workoutDates.has(formatISODate(currentDate))) {
      return 0;
    }
  }

  while (workoutDates.has(formatISODate(currentDate))) {
    streak++;
    currentDate = subtractDays(currentDate, 1);
  }

  return streak;
}

/**
 * Get longest workout streak in all history
 */
export async function getLongestStreak(userId: string): Promise<number> {
  const { startDate, endDate } = getDateRangeForTimeRange('all');
  const workouts = await getWorkoutsByDateRange(userId, startDate, endDate);

  if (workouts.length === 0) {
    return 0;
  }

  const workoutDates = Array.from(new Set(workouts.map(w => w.date))).sort();

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < workoutDates.length; i++) {
    const prevDate = parseISODate(workoutDates[i - 1]);
    const currDate = parseISODate(workoutDates[i]);

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

/**
 * Get calendar data with daily counts and streaks
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
