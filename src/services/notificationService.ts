import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { TABLES } from '../constants/tables';

/**
 * Notification Service
 * Handles local notifications for:
 * - Workout rest timer alerts
 * - Scheduled workout reminders
 * - Achievement / badge unlock notifications
 * - Level-up notifications
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NOTIFICATION_PREFS_KEY = '@liftarc_notification_prefs';
const WORKOUT_REMINDER_CATEGORY = 'workout-reminder';
const ACHIEVEMENT_CATEGORY = 'achievement';
const LEVEL_UP_CATEGORY = 'level-up';

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationPreferences {
  enabled: boolean;
  days: number[]; // 1=Sunday, 2=Monday, ... 7=Saturday (Expo weekday format)
  hour: number; // 0-23
  minute: number; // 0-59
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  enabled: false,
  days: [2, 4, 6], // Monday, Wednesday, Friday
  hour: 18,
  minute: 0,
};

// Day labels for UI (index matches Expo weekday: 1=Sun, 2=Mon, etc.)
export const DAY_LABELS: { short: string; full: string; weekday: number }[] = [
  { short: 'Sun', full: 'Sunday', weekday: 1 },
  { short: 'Mon', full: 'Monday', weekday: 2 },
  { short: 'Tue', full: 'Tuesday', weekday: 3 },
  { short: 'Wed', full: 'Wednesday', weekday: 4 },
  { short: 'Thu', full: 'Thursday', weekday: 5 },
  { short: 'Fri', full: 'Friday', weekday: 6 },
  { short: 'Sat', full: 'Saturday', weekday: 7 },
];

// ============================================================================
// PERMISSIONS
// ============================================================================

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (!Device.isDevice) {
    console.warn('Notifications require a physical device');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Check if notification permissions are granted
 */
export async function hasNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

// ============================================================================
// PUSH TOKEN MANAGEMENT
// ============================================================================

/**
 * Register for push notifications and store the token in user_profiles
 */
export async function registerForPushNotifications(userId: string): Promise<string | null> {
  const granted = await requestNotificationPermissions();
  if (!granted) return null;

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: undefined, // Uses the projectId from app.config.js automatically
    });
    const token = tokenData.data;

    // Store token in Supabase user_profiles
    await supabase
      .from(TABLES.USER_PROFILES)
      .update({ push_token: token })
      .eq('user_id', userId);

    return token;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
}

// ============================================================================
// NOTIFICATION PREFERENCES (AsyncStorage)
// ============================================================================

/**
 * Load notification preferences from AsyncStorage
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (stored) {
      return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load notification preferences:', error);
  }
  return { ...DEFAULT_NOTIFICATION_PREFS };
}

/**
 * Save notification preferences and reschedule reminders
 */
export async function saveNotificationPreferences(
  prefs: NotificationPreferences
): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
    // Reschedule reminders based on new preferences
    await scheduleWorkoutReminders(prefs);
  } catch (error) {
    console.error('Failed to save notification preferences:', error);
  }
}

// ============================================================================
// WORKOUT REMINDERS (Repeating Local Notifications)
// ============================================================================

/**
 * Cancel all existing workout reminders
 */
async function cancelWorkoutReminders(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const reminderIds = scheduled
      .filter((n) => n.content.data?.category === WORKOUT_REMINDER_CATEGORY)
      .map((n) => n.identifier);

    for (const id of reminderIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  } catch (error) {
    console.error('Failed to cancel workout reminders:', error);
  }
}

/**
 * Schedule repeating workout reminders based on user preferences
 */
export async function scheduleWorkoutReminders(
  prefs?: NotificationPreferences
): Promise<void> {
  if (Platform.OS === 'web') return;

  // Always cancel existing reminders first
  await cancelWorkoutReminders();

  const preferences = prefs || (await getNotificationPreferences());
  if (!preferences.enabled || preferences.days.length === 0) return;

  const hasPermission = await hasNotificationPermissions();
  if (!hasPermission) return;

  const motivationalMessages = [
    "Time to hit the gym! 💪 Your muscles are waiting.",
    "Workout time! 🏋️ Let's crush it today.",
    "Ready to train? 🔥 Your future self will thank you.",
    "Don't skip today! 💪 Every rep counts.",
    "It's gym o'clock! 🏋️ Let's get those gains.",
  ];

  try {
    for (const weekday of preferences.days) {
      const message =
        motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏋️ Workout Reminder',
          body: message,
          sound: true,
          data: { category: WORKOUT_REMINDER_CATEGORY, screen: 'HomeScreen' },
          ...(Platform.OS === 'android' && { channelId: 'workout-reminders' }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour: preferences.hour,
          minute: preferences.minute,
        },
      });
    }
  } catch (error) {
    console.error('Failed to schedule workout reminders:', error);
  }
}

// ============================================================================
// ACHIEVEMENT / BADGE NOTIFICATIONS
// ============================================================================

/**
 * Send a local notification when a badge is unlocked
 */
export async function sendBadgeUnlockNotification(
  badgeName: string,
  badgeDescription: string
): Promise<void> {
  if (Platform.OS === 'web') return;

  const hasPermission = await hasNotificationPermissions();
  if (!hasPermission) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏆 Badge Unlocked!',
        body: `${badgeName} — ${badgeDescription}`,
        sound: true,
        data: { category: ACHIEVEMENT_CATEGORY, screen: 'AchievementsScreen' },
        ...(Platform.OS === 'android' && { channelId: 'achievements' }),
      },
      trigger: null, // Fire immediately
    });
  } catch (error) {
    console.error('Failed to send badge notification:', error);
  }
}

/**
 * Send a local notification when the user levels up
 */
export async function sendLevelUpNotification(newLevel: number): Promise<void> {
  if (Platform.OS === 'web') return;

  const hasPermission = await hasNotificationPermissions();
  if (!hasPermission) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⬆️ Level Up!',
        body: `Congratulations! You've reached Level ${newLevel}! Keep pushing! 💪`,
        sound: true,
        data: { category: LEVEL_UP_CATEGORY, screen: 'ProfileScreen' },
        ...(Platform.OS === 'android' && { channelId: 'achievements' }),
      },
      trigger: null, // Fire immediately
    });
  } catch (error) {
    console.error('Failed to send level up notification:', error);
  }
}

// ============================================================================
// REST TIMER NOTIFICATIONS (existing functionality)
// ============================================================================

/**
 * Schedule a local notification for when rest timer ends
 */
export async function scheduleRestTimerNotification(
  seconds: number
): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const hasPermission = await hasNotificationPermissions();
  if (!hasPermission) return null;

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rest Complete!',
        body: 'Time to start your next set',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
        ...(Platform.OS === 'android' && { channelId: 'rest-timer' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, seconds),
        repeats: false,
      },
    });

    return identifier;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
}

/**
 * Cancel a scheduled notification by its identifier
 */
export async function cancelNotification(identifier: string | null): Promise<void> {
  if (!identifier || Platform.OS === 'web') return;

  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
}

// ============================================================================
// ANDROID NOTIFICATION CHANNELS
// ============================================================================

/**
 * Set up Android notification channels (call once on app startup)
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Promise.all([
    Notifications.setNotificationChannelAsync('rest-timer', {
      name: 'Rest Timer',
      description: 'Notifications for workout rest timer completion',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#14B8A6',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
    }),
    Notifications.setNotificationChannelAsync('workout-reminders', {
      name: 'Workout Reminders',
      description: 'Scheduled reminders for your workout days',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#8B5CF6',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
    }),
    Notifications.setNotificationChannelAsync('achievements', {
      name: 'Achievements',
      description: 'Badge unlocks and level-up notifications',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#F59E0B',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
    }),
  ]);
}

// Keep backward compat alias
export const setupNotificationChannel = setupNotificationChannels;

// ============================================================================
// NOTIFICATION TAP HANDLER
// ============================================================================

/**
 * Add a listener for notification taps. Returns a cleanup function.
 * The callback receives the screen name to navigate to (if any).
 */
export function addNotificationResponseListener(
  callback: (screen: string | null) => void
): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data as
        | { screen?: string }
        | undefined;
      callback(data?.screen ?? null);
    }
  );

  return () => subscription.remove();
}

/**
 * Check if there was a notification that launched the app
 */
export async function getLastNotificationResponse(): Promise<string | null> {
  const response = await Notifications.getLastNotificationResponseAsync();
  if (!response) return null;

  const data = response.notification.request.content.data as
    | { screen?: string }
    | undefined;
  return data?.screen ?? null;
}
