import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
const STORAGE_KEYS = {
  REST_TIMER_SECONDS: '@fittrack/rest_timer_seconds',
  HAPTIC_FEEDBACK_ENABLED: '@fittrack/haptic_feedback_enabled',
  NOTIFICATIONS_ENABLED: '@fittrack/notifications_enabled',
} as const;

// Default settings values
export const DEFAULT_SETTINGS = {
  restTimerSeconds: 90,
  hapticFeedbackEnabled: true,
  notificationsEnabled: true,
} as const;

// Available rest timer options
export const REST_TIMER_OPTIONS = [60, 90, 120, 180] as const;

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
// BULK SETTINGS
// ============================================================================

export interface LocalSettings {
  restTimerSeconds: number;
  hapticFeedbackEnabled: boolean;
  notificationsEnabled: boolean;
}

/**
 * Get all settings at once
 * @returns Promise<LocalSettings> - All local settings
 */
export async function getAllSettings(): Promise<LocalSettings> {
  const [restTimerSeconds, hapticFeedbackEnabled, notificationsEnabled] = await Promise.all([
    getRestTimerSeconds(),
    isHapticFeedbackEnabled(),
    isNotificationsEnabled(),
  ]);

  return {
    restTimerSeconds,
    hapticFeedbackEnabled,
    notificationsEnabled,
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
    ]);
  } catch (error) {
    console.error('Error resetting settings:', error);
  }
}
