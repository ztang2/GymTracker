// Database row types (matches Supabase schema exactly)

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  description: string | null;
  instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string | null;
  date: string; // ISO date string (YYYY-MM-DD)
  start_time: string; // ISO datetime string
  end_time: string | null;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  order_index: number;
  notes: string | null;
  created_at: string;
}

export interface ExerciseSet {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  reps: number;
  weight_kg: number | null;
  rest_seconds: number | null;
  completed: boolean;
  notes: string | null;
  created_at: string;
}

// Enums
export type ExerciseCategory =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'cardio';

// Composite types for querying (with joins)
export interface WorkoutExerciseWithDetails extends WorkoutExercise {
  exercise: Exercise;
  sets: ExerciseSet[];
}

export interface WorkoutSessionWithExercises extends WorkoutSession {
  exercises: WorkoutExerciseWithDetails[];
}

// Input types for mutations (without generated fields)
export type CreateWorkoutSessionInput = Omit<
  WorkoutSession,
  'id' | 'created_at' | 'updated_at'
>;

export type CreateWorkoutExerciseInput = Omit<
  WorkoutExercise,
  'id' | 'created_at'
>;

export type CreateExerciseSetInput = Omit<ExerciseSet, 'id' | 'created_at'>;

export type CreateExerciseInput = Omit<Exercise, 'id' | 'created_at' | 'updated_at'>;

// Progress tracking types
export interface ExerciseProgress {
  exercise_id: string;
  exercise_name: string;
  date: string;
  max_weight: number;
  total_volume: number; // sum(reps * weight)
  total_reps: number;
}

export interface WorkoutStats {
  total_workouts: number;
  total_duration_minutes: number;
  avg_workout_duration: number;
  workouts_this_week: number;
  workouts_this_month: number;
  most_frequent_exercises: Array<{
    exercise_name: string;
    count: number;
  }>;
}

// Time ranges for filtering
export type TimeRange = 'week' | 'month' | '3months' | 'year' | 'all';

// Daily workout data for contribution calendar
export interface DayData {
  date: string;  // YYYY-MM-DD
  count: number;  // workout count
  totalDuration: number;  // minutes
  totalVolume: number;  // kg
}

// Calendar data with streak info
export interface CalendarData {
  days: DayData[];
  startDate: string;
  endDate: string;
  currentStreak: number;
  longestStreak: number;
}

// Exercise frequency data
export interface ExerciseFrequency {
  exercise_id: string;
  exercise_name: string;
  category: ExerciseCategory;
  count: number;
}

// Category distribution for charts
export interface CategoryDistribution {
  category: ExerciseCategory;
  count: number;
  percentage: number;
}

// Weekly aggregated data
export interface WeeklyCount {
  week: string;  // ISO week or YYYY-WW
  count: number;
  totalDuration: number;
  totalVolume: number;
}

// ============================================================================
// GAMIFICATION TYPES (Phase 2)
// ============================================================================

// Badge rarity levels
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// Badge categories
export type BadgeCategory = 'streak' | 'volume' | 'strength' | 'milestone' | 'consistency' | 'variety';

// Badge definition (from badges table)
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  category: BadgeCategory;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  rarity: BadgeRarity;
  created_at: string;
}

// User earned badge (from user_badges table with badge join)
export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

// User profile (from user_profiles table)
export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_xp: number;
  current_level: number;
  created_at: string;
  updated_at: string;
}

// Personal record types
export type PRRecordType = 'max_weight' | 'max_reps' | 'estimated_1rm' | 'max_volume';

// Personal record entry
export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_id: string;
  record_type: PRRecordType;
  value: number;
  achieved_at: string;
  workout_session_id: string | null;
  previous_value: number | null;
  created_at: string;
  exercise?: Exercise; // Optional join
}

// Workout template
export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  estimated_duration: number | null;
  created_at: string;
  updated_at: string;
  exercises?: TemplateExercise[]; // Optional join
}

// Template exercise
export interface TemplateExercise {
  id: string;
  template_id: string;
  exercise_id: string;
  order_index: number;
  target_sets: number;
  target_reps: number;
  target_weight: number | null;
  notes: string | null;
  created_at: string;
  exercise?: Exercise; // Optional join
}

// Goal types
export type GoalType = 'workout_days' | 'total_volume' | 'streak_days' | 'total_workouts';
export type GoalPeriod = 'weekly' | 'monthly';

// User goal
export interface UserGoal {
  id: string;
  user_id: string;
  goal_type: GoalType;
  target_value: number;
  period_type: GoalPeriod;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// User settings
export interface UserSettings {
  id: string;
  user_id: string;
  rest_timer_seconds: number;
  notifications_enabled: boolean;
  haptic_feedback_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// GAMIFICATION HELPER TYPES
// ============================================================================

// XP rewards configuration
export interface XPRewards {
  completeWorkout: number;
  completeSet: number;
  streakDayBonus: number;
  personalRecord: number;
  badgeUnlock: number;
}

// Level calculation result
export interface LevelInfo {
  level: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpProgress: number; // 0-1 progress to next level
  tierName: string;
  tierColor: string;
}

// Badge with unlock status (for achievements screen)
export interface BadgeWithStatus extends Badge {
  isUnlocked: boolean;
  earnedAt: string | null;
  progress: number; // 0-1 progress towards unlocking
  currentValue: number; // Current progress value
}

// PR detection result
export interface PRDetectionResult {
  exerciseId: string;
  exerciseName: string;
  recordType: PRRecordType;
  newValue: number;
  previousValue: number | null;
  improvement: number | null; // percentage improvement
}

// Workout summary (for completion modal)
export interface WorkoutSummary {
  duration: number; // seconds
  exerciseCount: number;
  setCount: number;
  totalVolume: number; // kg
  totalReps: number;
  xpEarned: number;
  newPRs: PRDetectionResult[];
  newBadges: Badge[];
}

// Last performance data (for showing previous weights)
export interface LastPerformance {
  exerciseId: string;
  exerciseName: string;
  lastWeight: number | null;
  lastReps: number | null;
  lastDate: string;
  maxWeight: number;
  maxReps: number;
}

// Goal progress
export interface GoalProgress {
  goal: UserGoal;
  currentValue: number;
  progress: number; // 0-1 percentage
  isComplete: boolean;
  periodStart: string;
  periodEnd: string;
}
