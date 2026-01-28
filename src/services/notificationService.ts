import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * Notification Service
 * Handles local notifications for workout rest timer alerts
 */

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

/**
 * Request notification permissions from the user
 * @returns Promise<boolean> - True if permissions granted
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  // Web doesn't support push notifications
  if (Platform.OS === 'web') {
    return false;
  }

  // Check if we're on a physical device (required for iOS)
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
 * @returns Promise<boolean>
 */
export async function hasNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule a local notification for when rest timer ends
 * @param seconds - Number of seconds until notification fires
 * @returns Promise<string | null> - Notification identifier for cancellation, or null if failed
 */
export async function scheduleRestTimerNotification(
  seconds: number
): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  const hasPermission = await hasNotificationPermissions();
  if (!hasPermission) {
    return null;
  }

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rest Complete!',
        body: 'Time to start your next set',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
        ...(Platform.OS === 'android' && {
          channelId: 'rest-timer',
        }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, seconds), // Minimum 1 second
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
 * @param identifier - Notification identifier from scheduleRestTimerNotification
 */
export async function cancelNotification(identifier: string | null): Promise<void> {
  if (!identifier || Platform.OS === 'web') {
    return;
  }

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
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
}

/**
 * Set up Android notification channel (call once on app startup)
 * Required for Android 8.0+ to display notifications
 */
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('rest-timer', {
    name: 'Rest Timer',
    description: 'Notifications for workout rest timer completion',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#14B8A6',
    sound: 'default',
    enableVibrate: true,
    enableLights: true,
  });
}
