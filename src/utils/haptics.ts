import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Light haptic feedback for button presses and taps
 */
export const lightTap = (): void => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

/**
 * Success haptic feedback for completing sets, workouts, or achievements
 */
export const successFeedback = (): void => {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};

/**
 * Warning haptic feedback for errors, warnings, or failed validations
 */
export const warningFeedback = (): void => {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
};
