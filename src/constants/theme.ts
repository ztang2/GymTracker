// THEME DESIGN SYSTEM

// Dark theme colors (FitFlow-inspired)
export const darkColors = {
  // Background colors (dark theme) - Deep navy-purple
  background: '#0D0B1E',  // Deep navy-purple background (NOT pure black)
  backgroundElevated: '#16133A',  // Slightly lighter purple-navy
  cardBackground: '#2A2560',  // Clearly elevated from #0D0B1E background
  cardBackgroundHover: 'rgba(40, 35, 80, 0.9)',  // Hovered/pressed cards

  // Text colors (dark theme)
  textPrimary: '#FFFFFF',  // Pure white
  textSecondary: '#A59FBF',  // Muted lavender-gray
  textTertiary: '#6B6585',  // Darker muted
  textMuted: '#4b5563',  // Very subtle text

  // Vibrant accent colors
  purple: '#8B5CF6',  // Vibrant purple
  purpleLight: '#A855F7',  // Lighter purple
  pink: '#EC4899',  // Pink accent
  pinkLight: '#F472B6',  // Lighter pink
  green: '#10B981',  // Emerald-500
  greenLight: '#34D399',  // Emerald-400
  teal: '#14B8A6',  // Teal accent
  tealLight: '#2DD4BF',  // Lighter teal
  orange: '#F97316',  // Orange accent
  orangeLight: '#FB923C',  // Lighter orange

  // Gradient definitions (for gradient cards)
  gradientPurplePink: ['#A855F7', '#EC4899'] as readonly ['#A855F7', '#EC4899'],  // Purple to pink
  gradientTealGreen: ['#14B8A6', '#10B981'] as readonly ['#14B8A6', '#10B981'],  // Teal to green
  gradientOrange: ['#F97316', '#FB923C'] as readonly ['#F97316', '#FB923C'],  // Orange gradient
  gradientCyanBlue: ['#06B6D4', '#3B82F6'] as readonly ['#06B6D4', '#3B82F6'],  // Cyan to blue (for workouts icon)
  gradientPinkPurple: ['#EC4899', '#8B5CF6'] as readonly ['#EC4899', '#8B5CF6'],  // Pink to purple (for minutes icon)
  gradientPinkCoral: ['#EC4899', '#F97316'] as readonly ['#EC4899', '#F97316'],  // Pink to coral (for Set Goal button)

  // Contribution calendar colors (dark theme)
  calendarEmpty: '#1a1a1a',  // Dark gray for empty days
  calendarLevel1: '#14B8A6',  // Teal for 1 workout
  calendarLevel2: '#10B981',  // Green for 2 workouts
  calendarLevel3: '#059669',  // Darker green for 3+ workouts
  calendarToday: '#EC4899',  // Pink for today marker

  // Category colors (7 vibrant colors for muscle groups)
  categoryChest: '#F97316',  // Orange
  categoryBack: '#14B8A6',  // Teal
  categoryLegs: '#8B5CF6',  // Purple
  categoryShoulders: '#EC4899',  // Pink
  categoryArms: '#10B981',  // Green
  categoryCore: '#F59E0B',  // Amber
  categoryCardio: '#EF4444',  // Red

  // UI element colors
  border: 'rgba(160, 140, 220, 0.4)',  // Visible glassmorphic border
  borderLight: 'rgba(139, 92, 246, 0.15)',  // Purple-tinted subtle border
  borderFocus: '#8B5CF6',  // Purple border for focus states
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Input colors
  inputBackground: '#1A1635',
  inputBorder: 'rgba(139, 92, 246, 0.15)',
  inputPlaceholder: '#6B6585',
  
  // Tab bar
  tabBarBackground: '#0D0B1E',  // Same deep navy as background
  tabBarBorder: 'rgba(139, 92, 246, 0.15)',  // Purple-tinted border
};

// Light theme colors (FitFlow-inspired)
export const lightColors = {
  // Background colors (light theme) - Soft lavender-white
  background: '#FAF8FF',  // Soft off-white with lavender tint
  backgroundElevated: '#EDE8FF',  // Elevated surfaces with lavender
  cardBackground: '#FFFFFF',  // Pure white cards
  cardBackgroundHover: '#F5F5F5',  // Hovered/pressed cards

  // Text colors (light theme) - Purple undertones
  textPrimary: '#1E1533',  // Dark charcoal with purple tint
  textSecondary: '#6B5B8A',  // Muted purple-gray
  textTertiary: '#A394C0',  // Lighter purple-gray
  textMuted: '#D1D5DB',  // Very subtle text

  // Vibrant accent colors (same as dark)
  purple: '#8B5CF6',  // Vibrant purple
  purpleLight: '#A855F7',  // Lighter purple
  pink: '#EC4899',  // Pink accent
  pinkLight: '#F472B6',  // Lighter pink
  green: '#10B981',  // Emerald-500
  greenLight: '#34D399',  // Emerald-400
  teal: '#14B8A6',  // Teal accent
  tealLight: '#2DD4BF',  // Lighter teal
  orange: '#F97316',  // Orange accent
  orangeLight: '#FB923C',  // Lighter orange

  // Gradient definitions (same as dark)
  gradientPurplePink: ['#A855F7', '#EC4899'] as readonly ['#A855F7', '#EC4899'],
  gradientTealGreen: ['#14B8A6', '#10B981'] as readonly ['#14B8A6', '#10B981'],
  gradientOrange: ['#F97316', '#FB923C'] as readonly ['#F97316', '#FB923C'],
  gradientCyanBlue: ['#06B6D4', '#3B82F6'] as readonly ['#06B6D4', '#3B82F6'],  // Cyan to blue
  gradientPinkPurple: ['#EC4899', '#8B5CF6'] as readonly ['#EC4899', '#8B5CF6'],  // Pink to purple
  gradientPinkCoral: ['#EC4899', '#F97316'] as readonly ['#EC4899', '#F97316'],  // Pink to coral

  // Contribution calendar colors (light theme)
  calendarEmpty: '#F5F5F5',  // Light gray for empty days
  calendarLevel1: '#14B8A6',  // Teal for 1 workout
  calendarLevel2: '#10B981',  // Green for 2 workouts
  calendarLevel3: '#059669',  // Darker green for 3+ workouts
  calendarToday: '#EC4899',  // Pink for today marker

  // Category colors (same vibrant colors work in both modes)
  categoryChest: '#F97316',  // Orange
  categoryBack: '#14B8A6',  // Teal
  categoryLegs: '#8B5CF6',  // Purple
  categoryShoulders: '#EC4899',  // Pink
  categoryArms: '#10B981',  // Green
  categoryCore: '#F59E0B',  // Amber
  categoryCardio: '#EF4444',  // Red

  // UI element colors
  border: 'rgba(139, 92, 246, 0.18)',  // Purple-tinted border
  borderLight: 'rgba(139, 92, 246, 0.12)',  // Purple-tinted subtle border
  borderFocus: '#8B5CF6',  // Purple border for focus states
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Input colors
  inputBackground: '#F0ECFF',
  inputBorder: 'rgba(139, 92, 246, 0.12)',
  inputPlaceholder: '#A394C0',
  
  // Tab bar
  tabBarBackground: '#FFFFFF',  // White background
  tabBarBorder: 'rgba(139, 92, 246, 0.12)',  // Purple-tinted border
};

// Type definition for theme colors
export type ThemeColors = typeof darkColors;

// Helper function to get theme colors based on mode
export function getThemeColors(mode: 'light' | 'dark'): ThemeColors {
  return mode === 'dark' ? darkColors : lightColors;
}

// Default export for backward compatibility (will be replaced by context)
export const colors = darkColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Typography helpers (use with colors from useTheme)
export const typography = {
  // Large headings
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
    fontSize: 16,
    fontWeight: '400' as const,
  },
  bodySecondary: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  callout: {
    fontSize: 14,
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
  // Stat card number style
  statNumber: {
    fontSize: 40,
    fontWeight: '700' as const,
  },
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
  // Purple glow for dark mode cards
  purpleGlow: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Helper function to get category color
export const getCategoryColor = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    Chest: colors.categoryChest,
    Back: colors.categoryBack,
    Legs: colors.categoryLegs,
    Shoulders: colors.categoryShoulders,
    Arms: colors.categoryArms,
    Core: colors.categoryCore,
    Cardio: colors.categoryCardio,
  };
  return categoryMap[category] || colors.purple;
};

// ============================================================================
// GAMIFICATION COLORS
// ============================================================================

// Rarity colors for badges and achievements
export const rarityColors = {
  common: '#9CA3AF',      // Gray
  uncommon: '#10B981',    // Green
  rare: '#3B82F6',        // Blue
  epic: '#8B5CF6',        // Purple
  legendary: '#F59E0B',   // Gold
} as const;

// Rarity gradients for badge backgrounds
export const rarityGradients = {
  common: ['#6B7280', '#9CA3AF'] as readonly ['#6B7280', '#9CA3AF'],
  uncommon: ['#059669', '#10B981'] as readonly ['#059669', '#10B981'],
  rare: ['#2563EB', '#3B82F6'] as readonly ['#2563EB', '#3B82F6'],
  epic: ['#7C3AED', '#8B5CF6'] as readonly ['#7C3AED', '#8B5CF6'],
  legendary: ['#D97706', '#F59E0B'] as readonly ['#D97706', '#F59E0B'],
} as const;

// XP bar gradient
export const xpGradient = ['#8B5CF6', '#EC4899'] as readonly ['#8B5CF6', '#EC4899'];

// Level colors (for level badge backgrounds)
export const levelColors = {
  novice: '#9CA3AF',      // Level 1-10: Gray
  beginner: '#10B981',    // Level 11-20: Green
  intermediate: '#3B82F6', // Level 21-35: Blue
  advanced: '#8B5CF6',    // Level 36-50: Purple
  expert: '#EC4899',      // Level 51-75: Pink
  master: '#F59E0B',      // Level 76-99: Gold
  legend: '#EF4444',      // Level 100: Red/Fire
} as const;

// Helper function to get level tier info
export const getLevelTier = (level: number): { name: string; color: string; minLevel: number; maxLevel: number } => {
  if (level >= 100) return { name: 'Legend', color: levelColors.legend, minLevel: 100, maxLevel: 100 };
  if (level >= 76) return { name: 'Master', color: levelColors.master, minLevel: 76, maxLevel: 99 };
  if (level >= 51) return { name: 'Expert', color: levelColors.expert, minLevel: 51, maxLevel: 75 };
  if (level >= 36) return { name: 'Advanced', color: levelColors.advanced, minLevel: 36, maxLevel: 50 };
  if (level >= 21) return { name: 'Intermediate', color: levelColors.intermediate, minLevel: 21, maxLevel: 35 };
  if (level >= 11) return { name: 'Beginner', color: levelColors.beginner, minLevel: 11, maxLevel: 20 };
  return { name: 'Novice', color: levelColors.novice, minLevel: 1, maxLevel: 10 };
};

// Badge category icons (Ionicons names)
export const badgeCategoryIcons = {
  streak: 'flame',
  volume: 'barbell',
  strength: 'trophy',
  milestone: 'ribbon',
  consistency: 'calendar',
  variety: 'grid',
  dedication: 'time',
} as const;

// PR celebration colors
export const prColors = {
  gold: '#FFD700',
  goldGradient: ['#FFD700', '#FFA500'] as readonly ['#FFD700', '#FFA500'],
  firework: '#EC4899',
} as const;
