import { supabase } from './supabase';
import type {
  UserProfile,
  Badge,
  UserBadge,
  BadgeWithStatus,
  LevelInfo,
  XPRewards,
} from './types';
import { getLevelTier } from '../constants/theme';
import { getCurrentStreak, getTotalVolume, getWorkoutStatsByRange } from './statsService';

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
  const xpProgress = xpInCurrentLevel / xpNeededForNextLevel;
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
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user profile:', error);
    return null;
  }

  if (data) {
    return data;
  }

  // Create new profile
  const { data: newProfile, error: createError } = await supabase
    .from('user_profiles')
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
    console.error('Error creating user profile:', createError);
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
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data;
}

/**
 * Award XP to user and recalculate level
 */
export async function awardXP(
  userId: string,
  xpAmount: number
): Promise<{ newXP: number; newLevel: number; leveledUp: boolean } | null> {
  // Get current profile
  const profile = await getUserProfile(userId);
  if (!profile) return null;

  const newXP = profile.total_xp + xpAmount;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > profile.current_level;

  // Update profile
  const { error } = await supabase
    .from('user_profiles')
    .update({
      total_xp: newXP,
      current_level: newLevel,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error awarding XP:', error);
    return null;
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
// BADGE MANAGEMENT
// ============================================================================

/**
 * Get all badges
 */
export async function getAllBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('xp_reward', { ascending: true });

  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }

  return data || [];
}

/**
 * Get user's earned badges
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      *,
      badge:badges(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching user badges:', error);
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
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .single();

  if (existing) {
    return { awarded: false, badge: null, xpAwarded: 0 };
  }

  // Get badge details
  const { data: badge } = await supabase
    .from('badges')
    .select('*')
    .eq('id', badgeId)
    .single();

  if (!badge) {
    return { awarded: false, badge: null, xpAwarded: 0 };
  }

  // Award badge
  const { error } = await supabase
    .from('user_badges')
    .insert({
      user_id: userId,
      badge_id: badgeId,
    });

  if (error) {
    console.error('Error awarding badge:', error);
    return { awarded: false, badge: null, xpAwarded: 0 };
  }

  // Award XP for badge
  await awardXP(userId, badge.xp_reward);

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
    const [weekStats, monthStats, allStats, currentStreak] = await Promise.all([
      getWorkoutStatsByRange(userId, 'week'),
      getWorkoutStatsByRange(userId, 'month'),
      getWorkoutStatsByRange(userId, 'all'),
      getCurrentStreak(userId),
    ]);

    // Check each unearned badge
    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let isEligible = false;

      switch (badge.requirement_type) {
        case 'total_workouts':
          isEligible = allStats.total_workouts >= badge.requirement_value;
          break;
        case 'streak_days':
          isEligible = currentStreak >= badge.requirement_value;
          break;
        case 'weekly_workouts':
          isEligible = weekStats.total_workouts >= badge.requirement_value;
          break;
        case 'total_volume':
          const volume = await getTotalVolume(userId, '2020-01-01', new Date().toISOString().split('T')[0]);
          isEligible = volume >= badge.requirement_value;
          break;
        // Add more requirement types as needed
      }

      if (isEligible) {
        const result = await awardBadge(userId, badge.id);
        if (result.awarded && result.badge) {
          newlyAwardedBadges.push(result.badge);
        }
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }

  return newlyAwardedBadges;
}

/**
 * Get all badges with unlock status for achievements screen
 */
export async function getBadgesWithStatus(userId: string): Promise<BadgeWithStatus[]> {
  const [allBadges, earnedBadges, weekStats, allStats, currentStreak] = await Promise.all([
    getAllBadges(),
    getUserBadges(userId),
    getWorkoutStatsByRange(userId, 'week'),
    getWorkoutStatsByRange(userId, 'all'),
    getCurrentStreak(userId),
  ]);

  const earnedMap = new Map(earnedBadges.map(ub => [ub.badge_id, ub]));

  const badgesWithStatus: BadgeWithStatus[] = allBadges.map(badge => {
    const earned = earnedMap.get(badge.id);
    let currentValue = 0;

    // Calculate current progress based on requirement type
    switch (badge.requirement_type) {
      case 'total_workouts':
        currentValue = allStats.total_workouts;
        break;
      case 'streak_days':
        currentValue = currentStreak;
        break;
      case 'weekly_workouts':
        currentValue = weekStats.total_workouts;
        break;
      // Add more as needed
    }

    const progress = Math.min(currentValue / badge.requirement_value, 1);

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
    .from('user_profiles')
    .select('user_id, display_name, total_xp, current_level')
    .order('total_xp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
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
