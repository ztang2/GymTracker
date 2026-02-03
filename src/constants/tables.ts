/**
 * Centralized Supabase table name constants
 * Prevents typos and makes table renames trivial
 */
export const TABLES = {
  EXERCISES: 'exercises',
  EXERCISE_SETS: 'exercise_sets',
  WORKOUT_SESSIONS: 'workout_sessions',
  WORKOUT_EXERCISES: 'workout_exercises',
  PERSONAL_RECORDS: 'personal_records',
  USER_BADGES: 'user_badges',
  USER_GOALS: 'user_goals',
  WORKOUT_TEMPLATES: 'workout_templates',
  TEMPLATE_EXERCISES: 'template_exercises',
  USER_PROFILES: 'user_profiles',
  BADGES: 'badges',
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];
