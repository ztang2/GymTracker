import { supabase } from './supabase';
import { TABLES } from '../constants/tables';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<{ user: User | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      return { user: null, error };
    }

    // Create user profile in user_profiles table (use upsert to handle conflicts)
    if (data.user) {
      const { error: profileError } = await supabase
        .from(TABLES.USER_PROFILES)
        .upsert({
          user_id: data.user.id,
          display_name: displayName || email.split('@')[0],
          total_xp: 0,
          current_level: 1,
        }, {
          onConflict: 'user_id',
        });

      if (profileError) {
        console.warn('Failed to create user profile:', profileError);
      }
    }

    return { user: data.user, error: null };
  } catch (err) {
    return { user: null, error: err as Error };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (err) {
    return { user: null, error: err as Error };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    console.error('Error getting current user:', err);
    return null;
  }
}

/**
 * Get the current session
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (err) {
    console.error('Error getting current session:', err);
    return null;
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}

/**
 * Delete user account and all associated data
 * NOTE: In production, user deletion should be handled server-side via a Supabase Edge Function
 * with proper admin access. This client-side approach deletes all user data but leaves the
 * auth user record (orphaned). Consider implementing proper cascade deletion with RLS policies.
 */
export async function deleteUserAccount(userId: string): Promise<{ error: Error | null }> {
  try {
    // Delete data in order to respect foreign key constraints
    // Note: Some tables may have ON DELETE CASCADE set up, but we do explicit deletes for safety
    
    // First, get all workout session IDs for this user
    const { data: workoutSessions } = await supabase
      .from(TABLES.WORKOUT_SESSIONS)
      .select('id')
      .eq('user_id', userId);
    
    const workoutIds = workoutSessions?.map(w => w.id) || [];

    if (workoutIds.length > 0) {
      // Get all workout exercise IDs
      const { data: workoutExercises } = await supabase
        .from(TABLES.WORKOUT_EXERCISES)
        .select('id')
        .in('workout_id', workoutIds);
      
      const workoutExerciseIds = workoutExercises?.map(we => we.id) || [];

      // 1. Delete exercise_sets
      if (workoutExerciseIds.length > 0) {
        const { error: setsError } = await supabase
          .from(TABLES.EXERCISE_SETS)
          .delete()
          .in('workout_exercise_id', workoutExerciseIds);
        if (setsError) console.warn('Error deleting exercise_sets:', setsError);
      }

      // 2. Delete workout_exercises
      const { error: workoutExercisesError } = await supabase
        .from(TABLES.WORKOUT_EXERCISES)
        .delete()
        .in('workout_id', workoutIds);
      if (workoutExercisesError) console.warn('Error deleting workout_exercises:', workoutExercisesError);
    }

    // 3. Delete personal_records
    const { error: prsError } = await supabase
      .from(TABLES.PERSONAL_RECORDS)
      .delete()
      .eq('user_id', userId);
    if (prsError) console.warn('Error deleting personal_records:', prsError);

    // 4. Delete user_badges
    const { error: badgesError } = await supabase
      .from(TABLES.USER_BADGES)
      .delete()
      .eq('user_id', userId);
    if (badgesError) console.warn('Error deleting user_badges:', badgesError);

    // 5. Delete user_goals
    const { error: goalsError } = await supabase
      .from(TABLES.USER_GOALS)
      .delete()
      .eq('user_id', userId);
    if (goalsError) console.warn('Error deleting user_goals:', goalsError);

    // Get all template IDs for this user
    const { data: templates } = await supabase
      .from(TABLES.WORKOUT_TEMPLATES)
      .select('id')
      .eq('user_id', userId);
    
    const templateIds = templates?.map(t => t.id) || [];

    // 6. Delete template_exercises
    if (templateIds.length > 0) {
      const { error: templateExercisesError } = await supabase
        .from(TABLES.TEMPLATE_EXERCISES)
        .delete()
        .in('template_id', templateIds);
      if (templateExercisesError) console.warn('Error deleting template_exercises:', templateExercisesError);
    }

    // 7. Delete workout_templates
    const { error: templatesError } = await supabase
      .from(TABLES.WORKOUT_TEMPLATES)
      .delete()
      .eq('user_id', userId);
    if (templatesError) console.warn('Error deleting workout_templates:', templatesError);

    // 8. Delete workout_sessions
    const { error: workoutsError } = await supabase
      .from(TABLES.WORKOUT_SESSIONS)
      .delete()
      .eq('user_id', userId);
    if (workoutsError) console.warn('Error deleting workout_sessions:', workoutsError);

    // 9. Delete user_profiles
    const { error: profileError } = await supabase
      .from(TABLES.USER_PROFILES)
      .delete()
      .eq('user_id', userId);
    if (profileError) console.warn('Error deleting user_profiles:', profileError);

    // Sign out the user (auth user record remains in database)
    await signOut();

    return { error: null };
  } catch (err) {
    console.error('Error deleting user account:', err);
    return { error: err as Error };
  }
}
