import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
const STORAGE_KEYS = {
  REST_TIMER_SECONDS: '@fittrack/rest_timer_seconds',
  HAPTIC_FEEDBACK_ENABLED: '@fittrack/haptic_feedback_enabled',
  NOTIFICATIONS_ENABLED: '@fittrack/notifications_enabled',
  THEME_MODE: '@fittrack/theme_mode',
  EXERCISE_REST_TIMERS: '@fittrack/exercise_rest_timers',
} as const;

// Default settings values
export const DEFAULT_SETTINGS = {
  restTimerSeconds: 90,
  hapticFeedbackEnabled: true,
  notificationsEnabled: true,
  themeMode: 'system' as const,
} as const;

// Available rest timer options
export const REST_TIMER_OPTIONS = [60, 90, 120, 180] as const;

// Per-exercise rest timer options (expanded set for the modal)
export const PER_EXERCISE_REST_TIMER_OPTIONS = [30, 60, 90, 120, 180, 300] as const;

// Compound exercise names that default to longer rest (120s)
const COMPOUND_EXERCISE_PATTERNS = [
  'bench press', 'squat', 'deadlift', 'front squat', 'overhead press',
  'barbell row', 'pendlay row', 'leg press', 'romanian deadlift',
  'rack pull', 'military press', 'clean', 'snatch', 'hip thrust',
  'dips', 'pull-ups', 'chin-ups', 't-bar row',
];

/**
 * Get the smart default rest timer for an exercise based on its name/category.
 * Compound movements default to 120s, isolation exercises to 60s.
 */
export function getSmartDefaultRestSeconds(exerciseName: string): number {
  const lowerName = exerciseName.toLowerCase();
  const isCompound = COMPOUND_EXERCISE_PATTERNS.some((pattern) =>
    lowerName.includes(pattern)
  );
  return isCompound ? 120 : 60;
}

/**
 * Get all stored per-exercise rest timer preferences
 */
export async function getExerciseRestTimers(): Promise<Record<string, number>> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.EXERCISE_REST_TIMERS);
    if (value !== null) {
      return JSON.parse(value);
    }
    return {};
  } catch (error) {
    console.error('Error reading exercise rest timers:', error);
    return {};
  }
}

/**
 * Get the rest timer duration for a specific exercise
 * Falls back to smart default if no preference is stored
 */
export async function getExerciseRestTimer(
  exerciseId: string,
  exerciseName: string
): Promise<number> {
  try {
    const timers = await getExerciseRestTimers();
    if (exerciseId in timers) {
      return timers[exerciseId];
    }
    return getSmartDefaultRestSeconds(exerciseName);
  } catch (error) {
    console.error('Error reading exercise rest timer:', error);
    return getSmartDefaultRestSeconds(exerciseName);
  }
}

/**
 * Set the rest timer duration for a specific exercise
 */
export async function setExerciseRestTimer(
  exerciseId: string,
  seconds: number
): Promise<void> {
  try {
    const timers = await getExerciseRestTimers();
    timers[exerciseId] = seconds;
    await AsyncStorage.setItem(
      STORAGE_KEYS.EXERCISE_REST_TIMERS,
      JSON.stringify(timers)
    );
  } catch (error) {
    console.error('Error saving exercise rest timer:', error);
  }
}

/**
 * Settings Service
 * Handles local storage of user preferences using AsyncStorage
 * Falls back to defaults if no value is stored
 */

// ============================================================================
// REST TIMER SETTINGS
// ============================================================================

/**
 * Get the user's preferred rest timer duration
 * @returns Promise<number> - Rest timer duration in seconds
 */
export async function getRestTimerSeconds(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.REST_TIMER_SECONDS);
    if (value !== null) {
      const parsed = parseInt(value, 10);
      if (REST_TIMER_OPTIONS.includes(parsed as typeof REST_TIMER_OPTIONS[number])) {
        return parsed;
      }
    }
    return DEFAULT_SETTINGS.restTimerSeconds;
  } catch (error) {
    console.error('Error reading rest timer setting:', error);
    return DEFAULT_SETTINGS.restTimerSeconds;
  }
}

/**
 * Set the user's preferred rest timer duration
 * @param seconds - Rest timer duration in seconds
 */
export async function setRestTimerSeconds(seconds: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REST_TIMER_SECONDS, seconds.toString());
  } catch (error) {
    console.error('Error saving rest timer setting:', error);
  }
}

// ============================================================================
// HAPTIC FEEDBACK SETTINGS
// ============================================================================

/**
 * Check if haptic feedback is enabled
 * @returns Promise<boolean> - Whether haptic feedback is enabled
 */
export async function isHapticFeedbackEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.HAPTIC_FEEDBACK_ENABLED);
    if (value !== null) {
      return value === 'true';
    }
    return DEFAULT_SETTINGS.hapticFeedbackEnabled;
  } catch (error) {
    console.error('Error reading haptic feedback setting:', error);
    return DEFAULT_SETTINGS.hapticFeedbackEnabled;
  }
}

/**
 * Set haptic feedback enabled/disabled
 * @param enabled - Whether to enable haptic feedback
 */
export async function setHapticFeedbackEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HAPTIC_FEEDBACK_ENABLED, enabled.toString());
  } catch (error) {
    console.error('Error saving haptic feedback setting:', error);
  }
}

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

/**
 * Check if notifications are enabled
 * @returns Promise<boolean> - Whether notifications are enabled
 */
export async function isNotificationsEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
    if (value !== null) {
      return value === 'true';
    }
    return DEFAULT_SETTINGS.notificationsEnabled;
  } catch (error) {
    console.error('Error reading notifications setting:', error);
    return DEFAULT_SETTINGS.notificationsEnabled;
  }
}

/**
 * Set notifications enabled/disabled
 * @param enabled - Whether to enable notifications
 */
export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, enabled.toString());
  } catch (error) {
    console.error('Error saving notifications setting:', error);
  }
}

// ============================================================================
// THEME MODE SETTINGS
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Get the user's preferred theme mode
 * @returns Promise<ThemeMode> - Theme mode ('light' | 'dark' | 'system')
 */
export async function getThemeMode(): Promise<ThemeMode> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }
    return DEFAULT_SETTINGS.themeMode;
  } catch (error) {
    console.error('Error reading theme mode setting:', error);
    return DEFAULT_SETTINGS.themeMode;
  }
}

/**
 * Set the user's preferred theme mode
 * @param mode - Theme mode ('light' | 'dark' | 'system')
 */
export async function setThemeMode(mode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  } catch (error) {
    console.error('Error saving theme mode setting:', error);
  }
}

// ============================================================================
// BULK SETTINGS
// ============================================================================

export interface LocalSettings {
  restTimerSeconds: number;
  hapticFeedbackEnabled: boolean;
  notificationsEnabled: boolean;
  themeMode: ThemeMode;
}

/**
 * Get all settings at once
 * @returns Promise<LocalSettings> - All local settings
 */
export async function getAllSettings(): Promise<LocalSettings> {
  const [restTimerSeconds, hapticFeedbackEnabled, notificationsEnabled, themeMode] = await Promise.all([
    getRestTimerSeconds(),
    isHapticFeedbackEnabled(),
    isNotificationsEnabled(),
    getThemeMode(),
  ]);

  return {
    restTimerSeconds,
    hapticFeedbackEnabled,
    notificationsEnabled,
    themeMode,
  };
}

/**
 * Reset all settings to defaults
 */
export async function resetAllSettings(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.REST_TIMER_SECONDS,
      STORAGE_KEYS.HAPTIC_FEEDBACK_ENABLED,
      STORAGE_KEYS.NOTIFICATIONS_ENABLED,
      STORAGE_KEYS.THEME_MODE,
    ]);
  } catch (error) {
    console.error('Error resetting settings:', error);
  }
}
