import { supabase } from './supabase';
import type { UserGoal, GoalType, GoalPeriod, GoalProgress } from './types';
import { getWorkoutStatsByRange, getTotalVolume, getCurrentStreak } from './statsService';
import { formatISODate, subtractDays, getWeekStart, getMonthStart } from '../utils/dateUtils';

/**
 * Goal Service
 * Manages user fitness goals (weekly/monthly targets)
 */

// ============================================================================
// GOAL CRUD OPERATIONS
// ============================================================================

/**
 * Get all active goals for a user
 * @param userId - User ID
 * @returns Promise<UserGoal[]> - Array of active goals
 */
export async function getActiveGoals(userId: string): Promise<UserGoal[]> {
  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching goals:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all goals for a user (including inactive)
 * @param userId - User ID
 * @returns Promise<UserGoal[]> - Array of all goals
 */
export async function getAllGoals(userId: string): Promise<UserGoal[]> {
  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all goals:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a new goal
 * @param userId - User ID
 * @param goalType - Type of goal
 * @param targetValue - Target value to achieve
 * @param periodType - Period type (weekly/monthly)
 * @returns Promise<UserGoal | null> - Created goal or null on error
 */
export async function createGoal(
  userId: string,
  goalType: GoalType,
  targetValue: number,
  periodType: GoalPeriod
): Promise<UserGoal | null> {
  // Deactivate any existing goal of the same type and period
  await supabase
    .from('user_goals')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('goal_type', goalType)
    .eq('period_type', periodType)
    .eq('is_active', true);

  // Create the new goal
  const { data, error } = await supabase
    .from('user_goals')
    .insert({
      user_id: userId,
      goal_type: goalType,
      target_value: targetValue,
      period_type: periodType,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating goal:', error);
    return null;
  }

  return data;
}

/**
 * Update an existing goal
 * @param goalId - Goal ID
 * @param updates - Partial updates to apply
 * @returns Promise<UserGoal | null> - Updated goal or null on error
 */
export async function updateGoal(
  goalId: string,
  updates: Partial<Pick<UserGoal, 'target_value' | 'is_active'>>
): Promise<UserGoal | null> {
  const { data, error } = await supabase
    .from('user_goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single();

  if (error) {
    console.error('Error updating goal:', error);
    return null;
  }

  return data;
}

/**
 * Delete a goal
 * @param goalId - Goal ID
 * @returns Promise<boolean> - Success status
 */
export async function deleteGoal(goalId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_goals')
    .delete()
    .eq('id', goalId);

  if (error) {
    console.error('Error deleting goal:', error);
    return false;
  }

  return true;
}

// ============================================================================
// GOAL PROGRESS CALCULATION
// ============================================================================

/**
 * Get the date range for a goal's period
 * @param periodType - Period type (weekly/monthly)
 * @returns Object with startDate and endDate
 */
function getGoalPeriodRange(periodType: GoalPeriod): { startDate: string; endDate: string } {
  const today = new Date();
  const endDate = formatISODate(today);

  if (periodType === 'weekly') {
    const weekStart = getWeekStart(today);
    return { startDate: formatISODate(weekStart), endDate };
  } else {
    const monthStart = getMonthStart(today);
    return { startDate: formatISODate(monthStart), endDate };
  }
}

/**
 * Calculate progress for a single goal
 * @param userId - User ID
 * @param goal - Goal to calculate progress for
 * @returns Promise<GoalProgress> - Goal progress data
 */
export async function calculateGoalProgress(
  userId: string,
  goal: UserGoal
): Promise<GoalProgress> {
  const { startDate, endDate } = getGoalPeriodRange(goal.period_type);
  let currentValue = 0;

  try {
    switch (goal.goal_type) {
      case 'workout_days':
      case 'total_workouts': {
        const stats = await getWorkoutStatsByRange(
          userId,
          goal.period_type === 'weekly' ? 'week' : 'month'
        );
        currentValue = stats.total_workouts;
        break;
      }

      case 'total_volume': {
        currentValue = await getTotalVolume(userId, startDate, endDate);
        break;
      }

      case 'streak_days': {
        currentValue = await getCurrentStreak(userId);
        break;
      }
    }
  } catch (error) {
    console.error('Error calculating goal progress:', error);
  }

  const progress = Math.min(currentValue / goal.target_value, 1);
  const isComplete = currentValue >= goal.target_value;

  return {
    goal,
    currentValue,
    progress,
    isComplete,
    periodStart: startDate,
    periodEnd: endDate,
  };
}

/**
 * Calculate progress for all active goals
 * @param userId - User ID
 * @returns Promise<GoalProgress[]> - Array of goal progress data
 */
export async function calculateAllGoalProgress(userId: string): Promise<GoalProgress[]> {
  const goals = await getActiveGoals(userId);
  const progressPromises = goals.map(goal => calculateGoalProgress(userId, goal));
  return Promise.all(progressPromises);
}

// ============================================================================
// GOAL SUGGESTIONS
// ============================================================================

/**
 * Get suggested goals based on user's workout history
 * @param userId - User ID
 * @returns Promise<Array<{goalType: GoalType, periodType: GoalPeriod, suggestedValue: number, description: string}>>
 */
export async function getGoalSuggestions(userId: string): Promise<Array<{
  goalType: GoalType;
  periodType: GoalPeriod;
  suggestedValue: number;
  description: string;
}>> {
  const suggestions: Array<{
    goalType: GoalType;
    periodType: GoalPeriod;
    suggestedValue: number;
    description: string;
  }> = [];

  try {
    // Get recent stats
    const weekStats = await getWorkoutStatsByRange(userId, 'week');
    const monthStats = await getWorkoutStatsByRange(userId, 'month');

    // Suggest weekly workout goal (aim for improvement)
    const weeklyWorkoutSuggestion = Math.max(3, weekStats.total_workouts + 1);
    suggestions.push({
      goalType: 'workout_days',
      periodType: 'weekly',
      suggestedValue: weeklyWorkoutSuggestion,
      description: `Work out ${weeklyWorkoutSuggestion} days this week`,
    });

    // Suggest monthly workout goal
    const monthlyWorkoutSuggestion = Math.max(12, Math.ceil(monthStats.total_workouts * 1.2));
    suggestions.push({
      goalType: 'total_workouts',
      periodType: 'monthly',
      suggestedValue: monthlyWorkoutSuggestion,
      description: `Complete ${monthlyWorkoutSuggestion} workouts this month`,
    });

    // Suggest streak goal
    const currentStreak = await getCurrentStreak(userId);
    const streakSuggestion = Math.max(7, currentStreak + 3);
    suggestions.push({
      goalType: 'streak_days',
      periodType: 'weekly',
      suggestedValue: streakSuggestion,
      description: `Build a ${streakSuggestion}-day workout streak`,
    });

  } catch (error) {
    console.error('Error getting goal suggestions:', error);
    // Return default suggestions on error
    suggestions.push(
      { goalType: 'workout_days', periodType: 'weekly', suggestedValue: 3, description: 'Work out 3 days this week' },
      { goalType: 'total_workouts', periodType: 'monthly', suggestedValue: 12, description: 'Complete 12 workouts this month' },
      { goalType: 'streak_days', periodType: 'weekly', suggestedValue: 7, description: 'Build a 7-day workout streak' }
    );
  }

  return suggestions;
}

// ============================================================================
// GOAL TYPE LABELS
// ============================================================================

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  workout_days: 'Workout Days',
  total_workouts: 'Total Workouts',
  total_volume: 'Total Volume (kg)',
  streak_days: 'Streak Days',
};

export const GOAL_PERIOD_LABELS: Record<GoalPeriod, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export const GOAL_TYPE_ICONS: Record<GoalType, string> = {
  workout_days: 'calendar',
  total_workouts: 'barbell',
  total_volume: 'fitness',
  streak_days: 'flame',
};
