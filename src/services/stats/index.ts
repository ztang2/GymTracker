// Stats barrel — re-exports everything for backward compatibility
export { getDateRangeForTimeRange } from './timeHelpers';

export {
  getWorkoutStats,
  getWorkoutStatsByRange,
  getDailyWorkoutCounts,
  getTotalVolume,
  getVolumeByCategory,
  getCategoryDistribution,
  getMostFrequentExercises,
  getWeeklyWorkoutCounts,
  getExerciseProgress,
} from './coreStats';

export {
  getCurrentStreak,
  getLongestStreak,
  getStreaks,
  getCalendarData,
} from './streakStats';

export {
  getLastPerformance,
  getLastPerformanceBatch,
  getTotalPRCount,
  getExerciseMaxWeight,
} from './prStats';

export {
  getUniqueExerciseCount,
  getAllMuscleGroupsThisWeek,
  getEarlyWorkoutCount,
  getNightWorkoutCount,
  getWeekendWorkoutCount,
} from './badgeStats';
