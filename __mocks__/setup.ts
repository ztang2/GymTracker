/**
 * Jest global setup — mock modules that depend on native/Expo runtime
 */

// Mock supabase client globally so service imports don't trigger expo-constants
jest.mock('../src/services/supabase', () => {
  const chain: any = {};
  chain.from = jest.fn().mockReturnValue(chain);
  chain.select = jest.fn().mockReturnValue(chain);
  chain.insert = jest.fn().mockReturnValue(chain);
  chain.update = jest.fn().mockReturnValue(chain);
  chain.delete = jest.fn().mockReturnValue(chain);
  chain.eq = jest.fn().mockReturnValue(chain);
  chain.in = jest.fn().mockReturnValue(chain);
  chain.gte = jest.fn().mockReturnValue(chain);
  chain.lte = jest.fn().mockReturnValue(chain);
  chain.order = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockReturnValue(chain);
  chain.single = jest.fn().mockResolvedValue({ data: null, error: null });
  chain.then = (res: any) => Promise.resolve({ data: null, error: null }).then(res);
  return { supabase: chain };
});

// Mock statsService (imported by gamificationService)
jest.mock('../src/services/statsService', () => ({
  getCurrentStreak: jest.fn().mockResolvedValue(0),
  getTotalVolume: jest.fn().mockResolvedValue(0),
  getWorkoutStatsByRange: jest.fn().mockResolvedValue({ total_workouts: 0 }),
  getTotalPRCount: jest.fn().mockResolvedValue(0),
  getExerciseMaxWeight: jest.fn().mockResolvedValue(0),
  getUniqueExerciseCount: jest.fn().mockResolvedValue(0),
  getAllMuscleGroupsThisWeek: jest.fn().mockResolvedValue(0),
  getEarlyWorkoutCount: jest.fn().mockResolvedValue(0),
  getNightWorkoutCount: jest.fn().mockResolvedValue(0),
  getWeekendWorkoutCount: jest.fn().mockResolvedValue(0),
}));

// Mock prService (imported by exerciseStatsService)
jest.mock('../src/services/prService', () => ({
  getExercisePRs: jest.fn().mockResolvedValue([]),
}));

// Mock react-native
jest.mock('react-native', () => ({
  Platform: { OS: 'web', select: jest.fn((obj: any) => obj.web || obj.default) },
  Alert: { alert: jest.fn() },
  Dimensions: { get: jest.fn(() => ({ width: 375, height: 812 })) },
  StyleSheet: { create: (styles: any) => styles },
}));

// Mock notificationService (imported by gamificationService)
jest.mock('../src/services/notificationService', () => ({
  sendBadgeUnlockNotification: jest.fn().mockResolvedValue(undefined),
  sendLevelUpNotification: jest.fn().mockResolvedValue(undefined),
}));

// Mock theme constants (getLevelTier)
jest.mock('../src/constants/theme', () => ({
  getLevelTier: (level: number) => {
    if (level >= 100) return { name: 'Legend', color: '#EF4444', minLevel: 100, maxLevel: 100 };
    if (level >= 76) return { name: 'Master', color: '#F59E0B', minLevel: 76, maxLevel: 99 };
    if (level >= 51) return { name: 'Expert', color: '#EC4899', minLevel: 51, maxLevel: 75 };
    if (level >= 36) return { name: 'Advanced', color: '#8B5CF6', minLevel: 36, maxLevel: 50 };
    if (level >= 21) return { name: 'Intermediate', color: '#3B82F6', minLevel: 21, maxLevel: 35 };
    if (level >= 11) return { name: 'Beginner', color: '#10B981', minLevel: 11, maxLevel: 20 };
    return { name: 'Novice', color: '#6B7280', minLevel: 1, maxLevel: 10 };
  },
}));
