import { supabase } from './supabase';
import { TABLES } from '../constants/tables';
import { handleServiceError } from '../utils/errorHandler';
import {
  sendBadgeUnlockNotification,
  sendLevelUpNotification,
} from './notificationService';
import type {
  UserProfile,
  Badge,
  UserBadge,
  BadgeWithStatus,
  LevelInfo,
  XPRewards,
} from './types';
import { getLevelTier } from '../constants/theme';
import {
  getCurrentStreak,
  getTotalVolume,
  getWorkoutStatsByRange,
  getTotalPRCount,
  getExerciseMaxWeight,
  getUniqueExerciseCount,
  getAllMuscleGroupsThisWeek,
  getEarlyWorkoutCount,
  getNightWorkoutCount,
  getWeekendWorkoutCount,
} from './statsService';

/**
 * Gamification Service
 * Handles XP, levels, badges, and user profiles
 */

// ============================================================================
// XP CONFIGURATION
// ============================================================================

export const XP_REWARDS: XPRewards = {
  completeWorkout: 100,
  completeSet: 5,
  streakDayBonus: 25,
  personalRecord: 50,
  badgeUnlock: 25,
};

// XP required per level (increases exponentially)
// Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  // Formula: 50 * (level^2 - level)
  return Math.floor(50 * (level * level - level));
}

// Calculate level from total XP
export function calculateLevel(totalXP: number): number {
  // Inverse of XP formula: level = (1 + sqrt(1 + 4*xp/50)) / 2
  const level = Math.floor((1 + Math.sqrt(1 + (4 * totalXP) / 50)) / 2);
  return Math.max(1, level);
}

// Get detailed level info
export function getLevelInfo(totalXP: number): LevelInfo {
  const level = calculateLevel(totalXP);
  const xpForCurrentLevel = getXPForLevel(level);
  const xpForNextLevel = getXPForLevel(level + 1);
  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const xpProgress = xpNeededForNextLevel > 0 ? xpInCurrentLevel / xpNeededForNextLevel : 1;
  const tier = getLevelTier(level);

  return {
    level,
    currentXP: totalXP,
    xpForCurrentLevel,
    xpForNextLevel,
    xpProgress: Math.min(xpProgress, 1),
    tierName: tier.name,
    tierColor: tier.color,
  };
}

// ============================================================================
// USER PROFILE MANAGEMENT
// ============================================================================

/**
 * Get user profile (create if doesn't exist)
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // Try to get existing profile
  const { data, error } = await supabase
    .from(TABLES.USER_PROFILES)
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    handleServiceError(error, 'getUserProfile');
    return null;
  }

  if (data) {
    return data;
  }

  // Create new profile
  const { data: newProfile, error: createError } = await supabase
    .from(TABLES.USER_PROFILES)
    .insert({
      user_id: userId,
      display_name: null,
      avatar_url: null,
      total_xp: 0,
      current_level: 1,
    })
    .select()
    .single();

  if (createError) {
    handleServiceError(createError, 'getUserProfile.create');
    return null;
  }

  return newProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'display_name' | 'avatar_url'>>
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from(TABLES.USER_PROFILES)
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    handleServiceError(error, 'updateUserProfile');
    return null;
  }

  return data;
}

/**
 * Award XP to user and recalculate level
 * Uses atomic Supabase RPC to prevent XP loss from concurrent calls
 */
export async function awardXP(
  userId: string,
  xpAmount: number
): Promise<{ newXP: number; newLevel: number; leveledUp: boolean } | null> {
  const { data, error } = await supabase
    .rpc('increment_xp', { p_user_id: userId, p_xp_amount: xpAmount })
    .single();

  if (error) {
    handleServiceError(error, 'awardXP');
    // Fallback to read-then-write if RPC not available (migration not run yet)
    return awardXPFallback(userId, xpAmount);
  }

  const result = data as { new_xp: number; new_level: number; leveled_up: boolean };

  // Send level-up notification if applicable
  if (result.leveled_up) {
    sendLevelUpNotification(result.new_level).catch(console.error);
  }

  return {
    newXP: result.new_xp,
    newLevel: result.new_level,
    leveledUp: result.leveled_up,
  };
}

/** Fallback for when the increment_xp RPC is not available */
async function awardXPFallback(
  userId: string,
  xpAmount: number
): Promise<{ newXP: number; newLevel: number; leveledUp: boolean } | null> {
  const profile = await getUserProfile(userId);
  if (!profile) return null;

  const newXP = profile.total_xp + xpAmount;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > profile.current_level;

  const { error } = await supabase
    .from(TABLES.USER_PROFILES)
    .update({ total_xp: newXP, current_level: newLevel })
    .eq('user_id', userId);

  if (error) {
    handleServiceError(error, 'awardXPFallback');
    return null;
  }

  // Send level-up notification if applicable
  if (leveledUp) {
    sendLevelUpNotification(newLevel).catch(console.error);
  }

  return { newXP, newLevel, leveledUp };
}

/**
 * Calculate XP earned from a workout
 */
export function calculateWorkoutXP(setCount: number, streakDays: number): number {
  let xp = XP_REWARDS.completeWorkout;
  xp += setCount * XP_REWARDS.completeSet;
  xp += Math.min(streakDays, 7) * XP_REWARDS.streakDayBonus; // Cap streak bonus at 7 days
  return xp;
}

// ============================================================================
// BADGE VALUE HELPERS
// ============================================================================

interface BadgeStatsContext {
  allStats: { total_workouts: number };
  weekStats: { total_workouts: number };
  currentStreak: number;
  totalPRs: number;
  uniqueExercises: number;
  allMuscleGroups: number;
  earlyCount: number;
  nightCount: number;
  weekendCount: number;
  totalVolume: number;
  benchMax: number;
  squatMax: number;
  deadliftMax: number;
}

function getCurrentBadgeValue(
  badge: Badge,
  stats: BadgeStatsContext
): number {
  switch (badge.requirement_type) {
    case 'total_workouts':
      return stats.allStats.total_workouts;
    case 'streak_days':
      return stats.currentStreak;
    case 'weekly_workouts':
      return stats.weekStats.total_workouts;
    case 'total_volume':
      return stats.totalVolume;
    case 'total_prs':
      return stats.totalPRs;
    case 'bench_max':
      return stats.benchMax;
    case 'squat_max':
      return stats.squatMax;
    case 'deadlift_max':
      return stats.deadliftMax;
    case 'unique_exercises':
      return stats.uniqueExercises;
    case 'all_muscle_groups_week':
      return stats.allMuscleGroups;
    case 'early_workouts':
      return stats.earlyCount;
    case 'night_workouts':
      return stats.nightCount;
    case 'weekend_workouts':
      return stats.weekendCount;
    default:
      return 0;
  }
}

// ============================================================================
// BADGE MANAGEMENT
// ============================================================================

/**
 * Get all badges
 */
export async function getAllBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from(TABLES.BADGES)
    .select('*')
    .order('xp_reward', { ascending: true });

  if (error) {
    handleServiceError(error, 'getAllBadges');
    return [];
  }

  return data || [];
}

/**
 * Get user's earned badges
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from(TABLES.USER_BADGES)
    .select(`
      *,
      badge:badges(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    handleServiceError(error, 'getUserBadges');
    return [];
  }

  return data || [];
}

/**
 * Award badge to user (if not already earned)
 */
export async function awardBadge(
  userId: string,
  badgeId: string
): Promise<{ awarded: boolean; badge: Badge | null; xpAwarded: number }> {
  // Check if already earned
  const { data: existing } = await supabase
    .from(TABLES.USER_BADGES)
    .select('id')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .single();

  if (existing) {
    return { awarded: false, badge: null, xpAwarded: 0 };
  }

  // Get badge details
  const { data: badge } = await supabase
    .from(TABLES.BADGES)
    .select('*')
    .eq('id', badgeId)
    .single();

  if (!badge) {
    return { awarded: false, badge: null, xpAwarded: 0 };
  }

  // Award badge
  const { error } = await supabase
    .from(TABLES.USER_BADGES)
    .insert({
      user_id: userId,
      badge_id: badgeId,
    });

  if (error) {
    handleServiceError(error, 'awardBadge');
    return { awarded: false, badge: null, xpAwarded: 0 };
  }

  // Award XP for badge
  await awardXP(userId, badge.xp_reward);

  // Send badge unlock notification
  sendBadgeUnlockNotification(badge.name, badge.description).catch(console.error);

  return { awarded: true, badge, xpAwarded: badge.xp_reward };
}

/**
 * Check and award eligible badges based on user's progress
 */
export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
  const newlyAwardedBadges: Badge[] = [];

  try {
    // Get all badges and user's earned badges
    const [allBadges, earnedBadges] = await Promise.all([
      getAllBadges(),
      getUserBadges(userId),
    ]);

    const earnedBadgeIds = new Set(earnedBadges.map(ub => ub.badge_id));

    // Get user stats for checking eligibility
    const [weekStats, _monthStats, allStats, currentStreak, totalPRs, uniqueExercises, allMuscleGroups, earlyCount, nightCount, weekendCount] = await Promise.all([
      getWorkoutStatsByRange(userId, 'week'),
      getWorkoutStatsByRange(userId, 'month'),
      getWorkoutStatsByRange(userId, 'all'),
      getCurrentStreak(userId),
      getTotalPRCount(userId),
      getUniqueExerciseCount(userId),
      getAllMuscleGroupsThisWeek(userId),
      getEarlyWorkoutCount(userId),
      getNightWorkoutCount(userId),
      getWeekendWorkoutCount(userId),
    ]);

    // Pre-fetch volume and specific exercise maxes for badge checking
    let totalVolume = 0;
    let benchMax = 0;
    let squatMax = 0;
    let deadliftMax = 0;

    const unearnedBadges = allBadges.filter(b => !earnedBadgeIds.has(b.id));
    const needsVolume = unearnedBadges.some(b => b.requirement_type === 'total_volume');
    const needsSpecific = unearnedBadges.some(b =>
      ['bench_max', 'squat_max', 'deadlift_max'].includes(b.requirement_type)
    );

    if (needsVolume) {
      totalVolume = await getTotalVolume(userId, '2020-01-01', new Date().toISOString().split('T')[0]);
    }
    if (needsSpecific) {
      [benchMax, squatMax, deadliftMax] = await Promise.all([
        getExerciseMaxWeight(userId, 'Bench Press'),
        getExerciseMaxWeight(userId, 'Squat'),
        getExerciseMaxWeight(userId, 'Deadlift'),
      ]);
    }

    const statsContext: BadgeStatsContext = {
      allStats, weekStats, currentStreak, totalPRs,
      uniqueExercises, allMuscleGroups, earlyCount, nightCount, weekendCount,
      totalVolume, benchMax, squatMax, deadliftMax,
    };

    // Check each unearned badge
    for (const badge of unearnedBadges) {
      const currentValue = getCurrentBadgeValue(badge, statsContext);
      const isEligible = currentValue >= badge.requirement_value;

      if (isEligible) {
        const result = await awardBadge(userId, badge.id);
        if (result.awarded && result.badge) {
          newlyAwardedBadges.push(result.badge);
        }
      }
    }
  } catch (error) {
    handleServiceError(error, 'checkAndAwardBadges');
  }

  return newlyAwardedBadges;
}

/**
 * Get all badges with unlock status for achievements screen
 */
export async function getBadgesWithStatus(userId: string): Promise<BadgeWithStatus[]> {
  const [allBadges, earnedBadges, weekStats, allStats, currentStreak, totalPRs, uniqueExercises, allMuscleGroups, earlyCount, nightCount, weekendCount] = await Promise.all([
    getAllBadges(),
    getUserBadges(userId),
    getWorkoutStatsByRange(userId, 'week'),
    getWorkoutStatsByRange(userId, 'all'),
    getCurrentStreak(userId),
    getTotalPRCount(userId),
    getUniqueExerciseCount(userId),
    getAllMuscleGroupsThisWeek(userId),
    getEarlyWorkoutCount(userId),
    getNightWorkoutCount(userId),
    getWeekendWorkoutCount(userId),
  ]);

  // Pre-fetch specific exercise maxes (only if needed)
  let benchMax = 0;
  let squatMax = 0;
  let deadliftMax = 0;
  const needsSpecific = allBadges.some(b =>
    ['bench_max', 'squat_max', 'deadlift_max'].includes(b.requirement_type)
  );
  if (needsSpecific) {
    [benchMax, squatMax, deadliftMax] = await Promise.all([
      getExerciseMaxWeight(userId, 'Bench Press'),
      getExerciseMaxWeight(userId, 'Squat'),
      getExerciseMaxWeight(userId, 'Deadlift'),
    ]);
  }

  // Pre-fetch total volume
  let totalVolume = 0;
  const needsVolume = allBadges.some(b => b.requirement_type === 'total_volume');
  if (needsVolume) {
    totalVolume = await getTotalVolume(userId, '2020-01-01', new Date().toISOString().split('T')[0]);
  }

  const earnedMap = new Map(earnedBadges.map(ub => [ub.badge_id, ub]));

  const statsContext: BadgeStatsContext = {
    allStats, weekStats, currentStreak, totalPRs,
    uniqueExercises, allMuscleGroups, earlyCount, nightCount, weekendCount,
    totalVolume, benchMax, squatMax, deadliftMax,
  };

  const badgesWithStatus: BadgeWithStatus[] = allBadges.map(badge => {
    const earned = earnedMap.get(badge.id);
    const currentValue = getCurrentBadgeValue(badge, statsContext);
    const progress = badge.requirement_value > 0 ? Math.min(currentValue / badge.requirement_value, 1) : 1;

    return {
      ...badge,
      isUnlocked: !!earned,
      earnedAt: earned?.earned_at || null,
      progress,
      currentValue,
    };
  });

  // Sort: unlocked first (by date), then locked (by progress)
  return badgesWithStatus.sort((a, b) => {
    if (a.isUnlocked && !b.isUnlocked) return -1;
    if (!a.isUnlocked && b.isUnlocked) return 1;
    if (a.isUnlocked && b.isUnlocked) {
      return new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime();
    }
    return b.progress - a.progress;
  });
}

// ============================================================================
// LEADERBOARD (Future feature)
// ============================================================================

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  totalXP: number;
  level: number;
  rank: number;
}

/**
 * Get XP leaderboard (top users)
 */
export async function getXPLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from(TABLES.USER_PROFILES)
    .select('user_id, display_name, total_xp, current_level')
    .order('total_xp', { ascending: false })
    .limit(limit);

  if (error) {
    handleServiceError(error, 'getXPLeaderboard');
    return [];
  }

  return (data || []).map((entry, index) => ({
    userId: entry.user_id,
    displayName: entry.display_name || 'Anonymous',
    totalXP: entry.total_xp,
    level: entry.current_level,
    rank: index + 1,
  }));
}
