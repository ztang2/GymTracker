import { supabase } from './supabase';
import { TABLES } from '../constants/tables';
import type { WorkoutTemplate, TemplateExercise } from './types';

/**
 * Template Service
 * Manages workout templates for quick-start workouts
 */

// ============================================================================
// TEMPLATE CRUD OPERATIONS
// ============================================================================

/**
 * Get all templates for a user
 */
export async function getUserTemplates(userId: string): Promise<WorkoutTemplate[]> {
  const { data, error } = await supabase
    .from(TABLES.WORKOUT_TEMPLATES)
    .select(`
      *,
      exercises:template_exercises(
        *,
        exercise:exercises(id, name, category)
      )
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }

  return (data || []).map(template => ({
    ...template,
    exercises: template.exercises?.sort(
      (a: TemplateExercise, b: TemplateExercise) => a.order_index - b.order_index
    ),
  }));
}

/**
 * Get a single template by ID
 */
export async function getTemplate(
  templateId: string,
  userId: string
): Promise<WorkoutTemplate | null> {
  const { data, error } = await supabase
    .from(TABLES.WORKOUT_TEMPLATES)
    .select(`
      *,
      exercises:template_exercises(
        *,
        exercise:exercises(id, name, category)
      )
    `)
    .eq('id', templateId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching template:', error);
    return null;
  }

  return {
    ...data,
    exercises: data.exercises?.sort(
      (a: TemplateExercise, b: TemplateExercise) => a.order_index - b.order_index
    ),
  };
}

/**
 * Create a new template
 */
export async function createTemplate(
  userId: string,
  name: string,
  description: string | null = null,
  estimatedDuration: number | null = null
): Promise<WorkoutTemplate | null> {
  const { data, error } = await supabase
    .from(TABLES.WORKOUT_TEMPLATES)
    .insert({
      user_id: userId,
      name,
      description,
      estimated_duration: estimatedDuration,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating template:', error);
    return null;
  }

  return data;
}

/**
 * Update a template
 */
export async function updateTemplate(
  templateId: string,
  updates: Partial<Pick<WorkoutTemplate, 'name' | 'description' | 'estimated_duration'>>
): Promise<WorkoutTemplate | null> {
  const { data, error } = await supabase
    .from(TABLES.WORKOUT_TEMPLATES)
    .update(updates)
    .eq('id', templateId)
    .select()
    .single();

  if (error) {
    console.error('Error updating template:', error);
    return null;
  }

  return data;
}

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: string): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.WORKOUT_TEMPLATES)
    .delete()
    .eq('id', templateId);

  if (error) {
    console.error('Error deleting template:', error);
    return false;
  }

  return true;
}

// ============================================================================
// TEMPLATE EXERCISE OPERATIONS
// ============================================================================

/**
 * Add an exercise to a template
 */
export async function addExerciseToTemplate(
  templateId: string,
  exerciseId: string,
  orderIndex: number,
  targetSets: number = 3,
  targetReps: number = 10,
  targetWeight: number | null = null,
  notes: string | null = null
): Promise<TemplateExercise | null> {
  const { data, error } = await supabase
    .from(TABLES.TEMPLATE_EXERCISES)
    .insert({
      template_id: templateId,
      exercise_id: exerciseId,
      order_index: orderIndex,
      target_sets: targetSets,
      target_reps: targetReps,
      target_weight: targetWeight,
      notes,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding exercise to template:', error);
    return null;
  }

  return data;
}

/**
 * Remove an exercise from a template
 */
export async function removeExerciseFromTemplate(
  templateExerciseId: string
): Promise<boolean> {
  const { error } = await supabase
    .from(TABLES.TEMPLATE_EXERCISES)
    .delete()
    .eq('id', templateExerciseId);

  if (error) {
    console.error('Error removing exercise from template:', error);
    return false;
  }

  return true;
}

/**
 * Update exercise order in a template
 */
export async function reorderTemplateExercises(
  templateId: string,
  exerciseOrders: Array<{ id: string; order_index: number }>
): Promise<boolean> {
  // Update each exercise order
  const updates = exerciseOrders.map(({ id, order_index }) =>
    supabase
      .from(TABLES.TEMPLATE_EXERCISES)
      .update({ order_index })
      .eq('id', id)
      .eq('template_id', templateId)
  );

  try {
    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error('Error reordering template exercises:', error);
    return false;
  }
}

// ============================================================================
// TEMPLATE FROM WORKOUT
// ============================================================================

/**
 * Create a template from an existing workout
 */
export async function createTemplateFromWorkout(
  userId: string,
  name: string,
  workoutExercises: Array<{
    exerciseId: string;
    sets: Array<{
      weight: number;
      reps: number;
    }>;
  }>,
  durationMinutes: number | null = null
): Promise<WorkoutTemplate | null> {
  // Create the template
  const template = await createTemplate(
    userId,
    name,
    null,
    durationMinutes
  );

  if (!template) return null;

  // Add exercises
  for (let i = 0; i < workoutExercises.length; i++) {
    const exercise = workoutExercises[i];

    // Calculate average weight and reps from the sets
    const completedSets = exercise.sets.filter(s => s.reps > 0);
    const avgWeight = completedSets.length > 0
      ? completedSets.reduce((sum, s) => sum + s.weight, 0) / completedSets.length
      : null;
    const avgReps = completedSets.length > 0
      ? Math.round(completedSets.reduce((sum, s) => sum + s.reps, 0) / completedSets.length)
      : 10;

    await addExerciseToTemplate(
      template.id,
      exercise.exerciseId,
      i,
      completedSets.length || 3,
      avgReps,
      avgWeight
    );
  }

  // Fetch and return the full template with exercises
  return getTemplate(template.id, userId);
}

// ============================================================================
// DEFAULT TEMPLATES
// ============================================================================

/**
 * Common workout template names
 */
export const COMMON_TEMPLATES = [
  { name: 'Push Day', description: 'Chest, shoulders, and triceps' },
  { name: 'Pull Day', description: 'Back and biceps' },
  { name: 'Leg Day', description: 'Quads, hamstrings, and calves' },
  { name: 'Upper Body', description: 'Full upper body workout' },
  { name: 'Lower Body', description: 'Full lower body workout' },
  { name: 'Full Body', description: 'Complete full body workout' },
  { name: 'Arms', description: 'Biceps and triceps focus' },
  { name: 'Core', description: 'Abs and core training' },
] as const;
