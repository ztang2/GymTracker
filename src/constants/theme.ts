// THEME DESIGN SYSTEM - Slate (Apple-inspired, minimal)

// Dark theme colors - Pure black with light gray accents
export const darkColors = {
  // Background colors - True black with subtle elevation
  background: '#000000',
  backgroundElevated: '#0A0A0A',
  cardBackground: '#111111',
  cardBackgroundHover: '#1A1A1A',

  // Text colors - Clean hierarchy
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textMuted: '#475569',

  // Accent colors - Light gray/white (elegant, not colorful)
  purple: '#E2E8F0',      // Primary accent
  purpleLight: '#F1F5F9',
  pink: '#CBD5E1',        // Secondary
  pinkLight: '#E2E8F0',
  green: '#E2E8F0',       // Success (same elegant gray)
  greenLight: '#F1F5F9',
  teal: '#E2E8F0',
  tealLight: '#F1F5F9',
  orange: '#E2E8F0',
  orangeLight: '#F1F5F9',

  // Gradient definitions - Subtle grayscale
  gradientPurplePink: ['#E2E8F0', '#CBD5E1'] as readonly [string, string],
  gradientTealGreen: ['#F1F5F9', '#E2E8F0'] as readonly [string, string],
  gradientOrange: ['#E2E8F0', '#CBD5E1'] as readonly [string, string],
  gradientCyanBlue: ['#F1F5F9', '#E2E8F0'] as readonly [string, string],
  gradientPinkPurple: ['#CBD5E1', '#E2E8F0'] as readonly [string, string],
  gradientPinkCoral: ['#E2E8F0', '#CBD5E1'] as readonly [string, string],

  // Contribution calendar - Subtle progression
  calendarEmpty: '#1E293B',
  calendarLevel1: '#475569',
  calendarLevel2: '#64748B',
  calendarLevel3: '#94A3B8',
  calendarToday: '#F1F5F9',

  // Category colors - Distinct but muted
  categoryChest: '#F1F5F9',
  categoryBack: '#E2E8F0',
  categoryLegs: '#CBD5E1',
  categoryShoulders: '#94A3B8',
  categoryArms: '#F8FAFC',
  categoryCore: '#E2E8F0',
  categoryCardio: '#CBD5E1',

  // UI element colors
  border: '#1E293B',
  borderLight: '#1E293B',
  borderFocus: '#E2E8F0',
  success: '#E2E8F0',
  error: '#F87171',       // Keep red for errors (important)
  warning: '#FBBF24',     // Keep yellow for warnings
  info: '#E2E8F0',
  
  // Input colors
  inputBackground: '#0A0A0A',
  inputBorder: '#1E293B',
  inputPlaceholder: '#475569',
  
  // Tab bar
  tabBarBackground: '#000000',
  tabBarBorder: '#1E293B',
};

// Light theme colors - Pure white with dark gray accents
export const lightColors = {
  // Background colors - Clean white
  background: '#FFFFFF',
  backgroundElevated: '#F8FAFC',
  cardBackground: '#F1F5F9',
  cardBackgroundHover: '#E2E8F0',

  // Text colors - Dark hierarchy
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textMuted: '#CBD5E1',

  // Accent colors - Dark gray/black
  purple: '#334155',      // Primary accent
  purpleLight: '#475569',
  pink: '#64748B',        // Secondary
  pinkLight: '#475569',
  green: '#334155',
  greenLight: '#475569',
  teal: '#334155',
  tealLight: '#475569',
  orange: '#334155',
  orangeLight: '#475569',

  // Gradient definitions
  gradientPurplePink: ['#334155', '#475569'] as readonly [string, string],
  gradientTealGreen: ['#1E293B', '#334155'] as readonly [string, string],
  gradientOrange: ['#334155', '#475569'] as readonly [string, string],
  gradientCyanBlue: ['#1E293B', '#334155'] as readonly [string, string],
  gradientPinkPurple: ['#475569', '#334155'] as readonly [string, string],
  gradientPinkCoral: ['#334155', '#475569'] as readonly [string, string],

  // Contribution calendar
  calendarEmpty: '#F1F5F9',
  calendarLevel1: '#CBD5E1',
  calendarLevel2: '#94A3B8',
  calendarLevel3: '#64748B',
  calendarToday: '#0F172A',

  // Category colors
  categoryChest: '#1E293B',
  categoryBack: '#334155',
  categoryLegs: '#475569',
  categoryShoulders: '#64748B',
  categoryArms: '#0F172A',
  categoryCore: '#334155',
  categoryCardio: '#475569',

  // UI element colors
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#334155',
  success: '#334155',
  error: '#DC2626',
  warning: '#D97706',
  info: '#334155',
  
  // Input colors
  inputBackground: '#F8FAFC',
  inputBorder: '#E2E8F0',
  inputPlaceholder: '#94A3B8',
  
  // Tab bar
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
};

// Type definition for theme colors
export type ThemeColors = typeof darkColors;

// Helper function to get theme colors based on mode
export function getThemeColors(mode: 'light' | 'dark'): ThemeColors {
  return mode === 'dark' ? darkColors : lightColors;
}

// Default export for backward compatibility
export const colors = darkColors;

// Rarity colors for badges
export const rarityColors = {
  common: '#64748B',
  uncommon: '#94A3B8',
  rare: '#CBD5E1',
  epic: '#E2E8F0',
  legendary: '#F8FAFC',
};

// Rarity gradients
export const rarityGradients = {
  common: ['#475569', '#64748B'] as readonly [string, string],
  uncommon: ['#64748B', '#94A3B8'] as readonly [string, string],
  rare: ['#94A3B8', '#CBD5E1'] as readonly [string, string],
  epic: ['#CBD5E1', '#E2E8F0'] as readonly [string, string],
  legendary: ['#E2E8F0', '#F8FAFC'] as readonly [string, string],
};

// PR colors
export const prColors = {
  gold: '#F8FAFC',
  silver: '#CBD5E1',
  bronze: '#94A3B8',
  goldGradient: ['#F8FAFC', '#E2E8F0'] as readonly [string, string],
  silverGradient: ['#CBD5E1', '#94A3B8'] as readonly [string, string],
  bronzeGradient: ['#94A3B8', '#64748B'] as readonly [string, string],
};

// Badge category icons
export const badgeCategoryIcons = {
  milestone: 'trophy',
  consistency: 'flame',
  strength: 'barbell',
  variety: 'grid',
  dedication: 'medal',
};

// XP gradient
export const xpGradient = ['#F1F5F9', '#CBD5E1'] as readonly [string, string];

// Shadow presets - Subtle, refined
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Get category color by name
export function getCategoryColor(category: string): string {
  const categoryMap: Record<string, string> = {
    chest: '#F1F5F9',
    back: '#E2E8F0',
    legs: '#CBD5E1',
    shoulders: '#94A3B8',
    arms: '#F8FAFC',
    core: '#E2E8F0',
    cardio: '#CBD5E1',
  };
  return categoryMap[category.toLowerCase()] || '#E2E8F0';
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Typography - Clean, refined
export const typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  title2: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  subhead: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  bodySecondary: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
};

// Level tier system
export interface LevelTier {
  name: string;
  color: string;
  minLevel: number;
  maxLevel: number;
}

export function getLevelTier(level: number): LevelTier {
  if (level >= 100) return { name: 'Legend', color: '#F8FAFC', minLevel: 100, maxLevel: 100 };
  if (level >= 76) return { name: 'Master', color: '#E2E8F0', minLevel: 76, maxLevel: 99 };
  if (level >= 51) return { name: 'Expert', color: '#CBD5E1', minLevel: 51, maxLevel: 75 };
  if (level >= 36) return { name: 'Advanced', color: '#94A3B8', minLevel: 36, maxLevel: 50 };
  if (level >= 21) return { name: 'Intermediate', color: '#64748B', minLevel: 21, maxLevel: 35 };
  if (level >= 11) return { name: 'Beginner', color: '#475569', minLevel: 11, maxLevel: 20 };
  return { name: 'Novice', color: '#334155', minLevel: 1, maxLevel: 10 };
}
