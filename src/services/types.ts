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
