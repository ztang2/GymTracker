import { supabase } from './supabase';

// TODO: type these with proper Supabase table row types instead of any
export interface ExportData {
  user_profile: any;
  workout_sessions: any[];
  workout_exercises: any[];
  exercise_sets: any[];
  personal_records: any[];
  user_goals: any[];
  user_badges: any[];
  workout_templates: any[];
  template_exercises: any[];
  exported_at: string;
  total_workouts: number;
  total_exercises: number;
  total_sets: number;
}

/**
 * Export all user data as a structured JSON object
 */
export async function exportUserData(userId: string): Promise<ExportData | null> {
  try {
    // Fetch user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch workout sessions
    const { data: workouts } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Fetch workout exercises
    const workoutIds = workouts?.map(w => w.id) || [];
    const { data: workoutExercises } = await supabase
      .from('workout_exercises')
      .select('*')
      .in('workout_id', workoutIds.length > 0 ? workoutIds : ['']);

    // Fetch exercise sets
    const workoutExerciseIds = workoutExercises?.map(we => we.id) || [];
    const { data: exerciseSets } = await supabase
      .from('exercise_sets')
      .select('*')
      .in('workout_exercise_id', workoutExerciseIds.length > 0 ? workoutExerciseIds : ['']);

    // Fetch personal records
    const { data: personalRecords } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false });

    // Fetch user goals
    const { data: userGoals } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Fetch user badges
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    // Fetch workout templates
    const { data: templates } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Fetch template exercises
    const templateIds = templates?.map(t => t.id) || [];
    const { data: templateExercises } = await supabase
      .from('template_exercises')
      .select('*')
      .in('template_id', templateIds.length > 0 ? templateIds : ['']);

    return {
      user_profile: profile || null,
      workout_sessions: workouts || [],
      workout_exercises: workoutExercises || [],
      exercise_sets: exerciseSets || [],
      personal_records: personalRecords || [],
      user_goals: userGoals || [],
      user_badges: userBadges || [],
      workout_templates: templates || [],
      template_exercises: templateExercises || [],
      exported_at: new Date().toISOString(),
      total_workouts: workouts?.length || 0,
      total_exercises: workoutExercises?.length || 0,
      total_sets: exerciseSets?.length || 0,
    };
  } catch (error) {
    console.error('Error exporting user data:', error);
    return null;
  }
}

/**
 * Format workout data as CSV string
 */
export function formatAsCSV(data: ExportData): string {
  const lines: string[] = [];
  
  // CSV Header
  lines.push('Date,Workout Name,Exercise Name,Set Number,Weight (lbs),Reps,Notes');

  // Build a map of workout exercises with their sets
  const workoutExerciseMap = new Map();
  data.workout_exercises.forEach(we => {
    workoutExerciseMap.set(we.id, we);
  });

  // Build a map of workouts
  const workoutMap = new Map();
  data.workout_sessions.forEach(w => {
    workoutMap.set(w.id, w);
  });

  // Process each set
  data.exercise_sets.forEach(set => {
    const workoutExercise = workoutExerciseMap.get(set.workout_exercise_id);
    if (!workoutExercise) return;

    const workout = workoutMap.get(workoutExercise.workout_id);
    if (!workout) return;

    const date = new Date(workout.created_at).toLocaleDateString();
    const workoutName = workout.name || 'Untitled Workout';
    const exerciseName = workoutExercise.exercise_name || 'Unknown Exercise';
    const setNumber = set.set_number || 0;
    const weight = set.weight || 0;
    const reps = set.reps || 0;
    const notes = (set.notes || '').replace(/,/g, ';').replace(/\n/g, ' ');

    lines.push(`${date},"${workoutName}","${exerciseName}",${setNumber},${weight},${reps},"${notes}"`);
  });

  return lines.join('\n');
}
