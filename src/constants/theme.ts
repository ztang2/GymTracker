// THEME DESIGN SYSTEM - Pure Monochrome

// Dark theme colors - Pure black & white
export const darkColors = {
  // Background colors (dark theme) - Pure black
  background: '#000000',
  backgroundElevated: '#0A0A0A',
  cardBackground: '#111111',
  cardBackgroundHover: '#1A1A1A',

  // Text colors (dark theme)
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textTertiary: '#666666',
  textMuted: '#444444',

  // Accent colors - white/gray only
  purple: '#FFFFFF',  // Primary accent (white)
  purpleLight: '#E0E0E0',
  pink: '#CCCCCC',  // Secondary accent (light gray)
  pinkLight: '#B0B0B0',
  green: '#FFFFFF',  // Success uses white
  greenLight: '#E0E0E0',
  teal: '#FFFFFF',
  tealLight: '#E0E0E0',
  orange: '#FFFFFF',
  orangeLight: '#E0E0E0',

  // Gradient definitions (grayscale)
  gradientPurplePink: ['#FFFFFF', '#CCCCCC'] as readonly [string, string],
  gradientTealGreen: ['#FFFFFF', '#E0E0E0'] as readonly [string, string],
  gradientOrange: ['#FFFFFF', '#E0E0E0'] as readonly [string, string],
  gradientCyanBlue: ['#FFFFFF', '#CCCCCC'] as readonly [string, string],
  gradientPinkPurple: ['#CCCCCC', '#FFFFFF'] as readonly [string, string],
  gradientPinkCoral: ['#FFFFFF', '#E0E0E0'] as readonly [string, string],

  // Contribution calendar colors (grayscale)
  calendarEmpty: '#1A1A1A',
  calendarLevel1: '#444444',
  calendarLevel2: '#777777',
  calendarLevel3: '#AAAAAA',
  calendarToday: '#FFFFFF',

  // Category colors (different gray shades for distinction)
  categoryChest: '#E0E0E0',
  categoryBack: '#C0C0C0',
  categoryLegs: '#A0A0A0',
  categoryShoulders: '#888888',
  categoryArms: '#D0D0D0',
  categoryCore: '#B0B0B0',
  categoryCardio: '#909090',

  // UI element colors
  border: '#222222',
  borderLight: '#1A1A1A',
  borderFocus: '#FFFFFF',
  success: '#FFFFFF',
  error: '#FFFFFF',
  warning: '#FFFFFF',
  info: '#FFFFFF',
  
  // Input colors
  inputBackground: '#0A0A0A',
  inputBorder: '#222222',
  inputPlaceholder: '#555555',
  
  // Tab bar
  tabBarBackground: '#000000',
  tabBarBorder: '#1A1A1A',
};

// Light theme colors - Pure white & black
export const lightColors = {
  // Background colors (light theme) - Pure white
  background: '#FFFFFF',
  backgroundElevated: '#FAFAFA',
  cardBackground: '#F5F5F5',
  cardBackgroundHover: '#EEEEEE',

  // Text colors (light theme)
  textPrimary: '#000000',
  textSecondary: '#555555',
  textTertiary: '#888888',
  textMuted: '#AAAAAA',

  // Accent colors - black/gray only
  purple: '#000000',  // Primary accent (black)
  purpleLight: '#333333',
  pink: '#444444',  // Secondary accent (dark gray)
  pinkLight: '#555555',
  green: '#000000',  // Success uses black
  greenLight: '#333333',
  teal: '#000000',
  tealLight: '#333333',
  orange: '#000000',
  orangeLight: '#333333',

  // Gradient definitions (grayscale)
  gradientPurplePink: ['#000000', '#333333'] as readonly [string, string],
  gradientTealGreen: ['#000000', '#222222'] as readonly [string, string],
  gradientOrange: ['#000000', '#222222'] as readonly [string, string],
  gradientCyanBlue: ['#000000', '#333333'] as readonly [string, string],
  gradientPinkPurple: ['#333333', '#000000'] as readonly [string, string],
  gradientPinkCoral: ['#000000', '#222222'] as readonly [string, string],

  // Contribution calendar colors (grayscale)
  calendarEmpty: '#EEEEEE',
  calendarLevel1: '#CCCCCC',
  calendarLevel2: '#999999',
  calendarLevel3: '#666666',
  calendarToday: '#000000',

  // Category colors (different gray shades for distinction)
  categoryChest: '#333333',
  categoryBack: '#444444',
  categoryLegs: '#555555',
  categoryShoulders: '#666666',
  categoryArms: '#3A3A3A',
  categoryCore: '#4A4A4A',
  categoryCardio: '#5A5A5A',

  // UI element colors
  border: '#E0E0E0',
  borderLight: '#EEEEEE',
  borderFocus: '#000000',
  success: '#000000',
  error: '#000000',
  warning: '#000000',
  info: '#000000',
  
  // Input colors
  inputBackground: '#FAFAFA',
  inputBorder: '#E0E0E0',
  inputPlaceholder: '#AAAAAA',
  
  // Tab bar
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#EEEEEE',
};

// Type definition for theme colors
export type ThemeColors = typeof darkColors;

// Helper function to get theme colors based on mode
export function getThemeColors(mode: 'light' | 'dark'): ThemeColors {
  return mode === 'dark' ? darkColors : lightColors;
}

// Default export for backward compatibility
export const colors = darkColors;

// Rarity colors for badges (monochrome)
export const rarityColors = {
  common: '#888888',
  uncommon: '#AAAAAA',
  rare: '#CCCCCC',
  epic: '#DDDDDD',
  legendary: '#FFFFFF',
};

// Rarity gradients (monochrome)
export const rarityGradients = {
  common: ['#666666', '#888888'] as readonly [string, string],
  uncommon: ['#888888', '#AAAAAA'] as readonly [string, string],
  rare: ['#AAAAAA', '#CCCCCC'] as readonly [string, string],
  epic: ['#CCCCCC', '#EEEEEE'] as readonly [string, string],
  legendary: ['#EEEEEE', '#FFFFFF'] as readonly [string, string],
};

// PR colors (monochrome)
export const prColors = {
  gold: '#FFFFFF',
  silver: '#CCCCCC',
  bronze: '#999999',
  goldGradient: ['#FFFFFF', '#E0E0E0'] as readonly [string, string],
  silverGradient: ['#CCCCCC', '#AAAAAA'] as readonly [string, string],
  bronzeGradient: ['#999999', '#777777'] as readonly [string, string],
};

// Badge category icons (keep existing)
export const badgeCategoryIcons = {
  milestone: 'trophy',
  consistency: 'flame',
  strength: 'barbell',
  variety: 'grid',
  dedication: 'medal',
};

// XP gradient (monochrome)
export const xpGradient = ['#FFFFFF', '#CCCCCC'] as readonly [string, string];

// Shadow presets (minimal)
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Get category color by name (returns gray shade for monochrome)
export function getCategoryColor(category: string): string {
  const categoryMap: Record<string, string> = {
    chest: '#E0E0E0',
    back: '#C0C0C0',
    legs: '#A0A0A0',
    shoulders: '#888888',
    arms: '#D0D0D0',
    core: '#B0B0B0',
    cardio: '#909090',
  };
  return categoryMap[category.toLowerCase()] || '#AAAAAA';
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

// Typography helpers
export const typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  title2: {
    fontSize: 20,
    fontWeight: '600' as const,
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
  // Monochrome tiers - use text descriptions, same color
  if (level >= 100) return { name: 'Legend', color: '#FFFFFF', minLevel: 100, maxLevel: 100 };
  if (level >= 76) return { name: 'Master', color: '#E0E0E0', minLevel: 76, maxLevel: 99 };
  if (level >= 51) return { name: 'Expert', color: '#C0C0C0', minLevel: 51, maxLevel: 75 };
  if (level >= 36) return { name: 'Advanced', color: '#A0A0A0', minLevel: 36, maxLevel: 50 };
  if (level >= 21) return { name: 'Intermediate', color: '#808080', minLevel: 21, maxLevel: 35 };
  if (level >= 11) return { name: 'Beginner', color: '#606060', minLevel: 11, maxLevel: 20 };
  return { name: 'Novice', color: '#404040', minLevel: 1, maxLevel: 10 };
}
