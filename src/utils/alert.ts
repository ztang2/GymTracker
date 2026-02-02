import { Alert, Platform } from 'react-native';

type AlertButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

/**
 * Cross-platform alert that works on web (where Alert.alert only shows window.alert).
 * For simple messages (no buttons or single OK), uses window.alert on web.
 * For confirm dialogs (2+ buttons), uses window.confirm on web.
 */
export function showAlert(
  title: string,
  message: string,
  buttons?: AlertButton[]
) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  // Web fallback
  if (!buttons || buttons.length <= 1) {
    window.alert(`${title}\n\n${message}`);
    buttons?.[0]?.onPress?.();
    return;
  }

  const confirmButton = buttons.find((b) => b.style !== 'cancel');
  const cancelButton = buttons.find((b) => b.style === 'cancel');

  if (confirmButton && cancelButton) {
    if (window.confirm(`${title}\n\n${message}`)) {
      confirmButton.onPress?.();
    } else {
      cancelButton.onPress?.();
    }
  } else {
    window.alert(`${title}\n\n${message}`);
    buttons[0]?.onPress?.();
  }
}
