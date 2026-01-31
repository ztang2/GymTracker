import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Vibration, Platform } from 'react-native';
import {
  scheduleRestTimerNotification,
  cancelNotification,
  cancelAllNotifications,
} from '../services';

interface UseRestTimerReturn {
  restTimerVisible: boolean;
  restSeconds: number;
  restTimerDuration: number;
  startRestTimer: () => Promise<void>;
  skipRestTimer: () => Promise<void>;
  setRestTimerDuration: (seconds: number) => void;
}

/**
 * Custom hook for managing rest timer between sets
 * Uses timestamp-based calculations and schedules local notifications
 */
export const useRestTimer = (initialDuration: number = 90): UseRestTimerReturn => {
  const [restTimerVisible, setRestTimerVisible] = useState(false);
  const [restEndTime, setRestEndTime] = useState<number | null>(null);
  const [restSeconds, setRestSeconds] = useState(initialDuration);
  const [restTimerDuration, setRestTimerDuration] = useState(initialDuration);
  
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIdRef = useRef<string | null>(null);

  // Rest timer update effect - uses timestamp for accuracy
  useEffect(() => {
    if (!restEndTime || !restTimerVisible) {
      return;
    }

    const updateRestTime = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((restEndTime - now) / 1000));
      setRestSeconds(remaining);

      if (remaining <= 0) {
        // Timer finished
        if (restTimerRef.current) {
          clearInterval(restTimerRef.current);
          restTimerRef.current = null;
        }
        // Vibrate when timer ends (in foreground)
        if (Platform.OS !== 'web') {
          Vibration.vibrate([0, 500, 200, 500]);
        }
        setRestTimerVisible(false);
        setRestEndTime(null);
        notificationIdRef.current = null;
      }
    };

    // Update immediately
    updateRestTime();

    // Set up interval for UI updates (100ms for smooth countdown)
    restTimerRef.current = setInterval(updateRestTime, 100);

    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        updateRestTime();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
      subscription.remove();
    };
  }, [restEndTime, restTimerVisible]);

  // Cleanup notifications on unmount
  useEffect(() => {
    return () => {
      if (notificationIdRef.current) {
        cancelNotification(notificationIdRef.current);
      }
      cancelAllNotifications();
    };
  }, []);

  const startRestTimer = async () => {
    // Clear any existing timer and notification
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
    if (notificationIdRef.current) {
      await cancelNotification(notificationIdRef.current);
      notificationIdRef.current = null;
    }

    // Calculate end time using user's preferred duration
    const endTime = Date.now() + restTimerDuration * 1000;
    setRestEndTime(endTime);
    setRestSeconds(restTimerDuration);
    setRestTimerVisible(true);

    // Schedule notification for when timer ends (for background alert)
    const notificationId = await scheduleRestTimerNotification(restTimerDuration);
    notificationIdRef.current = notificationId;
  };

  const skipRestTimer = async () => {
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
    // Cancel the scheduled notification
    if (notificationIdRef.current) {
      await cancelNotification(notificationIdRef.current);
      notificationIdRef.current = null;
    }
    setRestTimerVisible(false);
    setRestEndTime(null);
  };

  const updateRestTimerDuration = (seconds: number) => {
    setRestTimerDuration(seconds);
  };

  return {
    restTimerVisible,
    restSeconds,
    restTimerDuration,
    startRestTimer,
    skipRestTimer,
    setRestTimerDuration: updateRestTimerDuration,
  };
};
