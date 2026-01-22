import { supabase } from './supabase';
import type { Exercise, ExerciseCategory } from './types';

/**
 * Exercise Service
 * Provides read-only access to the exercise library for browsing and selecting exercises
 */

/**
 * Get all exercises ordered alphabetically by name
 * @returns Promise<Exercise[]> - Array of all exercises
 * @throws Error if database query fails
 */
export async function getAllExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch exercises: ${error.message}`);
  }

  return data || [];
}

/**
 * Get exercises filtered by category, ordered alphabetically
 * @param category - Exercise category to filter by
 * @returns Promise<Exercise[]> - Array of exercises in the specified category
 * @throws Error if database query fails
 */
export async function getExercisesByCategory(
  category: ExerciseCategory
): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('category', category)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch exercises by category: ${error.message}`);
  }

  return data || [];
}

/**
 * Search exercises by name (case-insensitive partial match)
 * @param searchTerm - Search string to match against exercise names
 * @returns Promise<Exercise[]> - Array of matching exercises
 * @throws Error if database query fails
 */
export async function searchExercises(searchTerm: string): Promise<Exercise[]> {
  // If search term is empty, return all exercises
  if (!searchTerm.trim()) {
    return getAllExercises();
  }

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to search exercises: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single exercise by ID
 * @param id - Exercise ID
 * @returns Promise<Exercise | null> - Exercise if found, null if not found
 * @throws Error if database query fails (except for not found)
 */
export async function getExerciseById(id: string): Promise<Exercise | null> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    // PGRST116 is the "not found" error code in Supabase
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch exercise by ID: ${error.message}`);
  }

  return data;
}

/**
 * Get multiple exercises by IDs (batch fetch)
 * @param ids - Array of exercise IDs
 * @returns Promise<Exercise[]> - Array of found exercises (may be fewer than requested if some IDs don't exist)
 * @throws Error if database query fails
 */
export async function getExercisesByIds(ids: string[]): Promise<Exercise[]> {
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .in('id', ids)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch exercises by IDs: ${error.message}`);
  }

  return data || [];
}

/**
 * Get count of exercises per category
 * @returns Promise<Record<string, number>> - Object mapping category names to counts
 * @throws Error if database query fails
 */
export async function getExerciseCategoryCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('exercises')
    .select('category');

  if (error) {
    throw new Error(`Failed to fetch exercise category counts: ${error.message}`);
  }

  // Count exercises per category
  const counts: Record<string, number> = {};

  if (data) {
    for (const exercise of data) {
      const category = exercise.category;
      counts[category] = (counts[category] || 0) + 1;
    }
  }

  return counts;
}
