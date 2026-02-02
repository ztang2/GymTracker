import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, Vibration, Platform } from 'react-native';
import {
  scheduleRestTimerNotification,
  cancelNotification,
  cancelAllNotifications,
  getExerciseRestTimers,
  setExerciseRestTimer,
  getSmartDefaultRestSeconds,
} from '../services';

interface UseRestTimerReturn {
  restTimerVisible: boolean;
  restSeconds: number;
  restTimerDuration: number;
  exerciseRestTimers: Record<string, number>;
  startRestTimer: (exerciseId?: string, exerciseName?: string) => Promise<void>;
  skipRestTimer: () => Promise<void>;
  setRestTimerDuration: (seconds: number) => void;
  adjustRestTime: (deltaSeconds: number) => void;
  getExerciseRestDuration: (exerciseId: string, exerciseName: string) => number;
  setExerciseRestDuration: (exerciseId: string, seconds: number) => Promise<void>;
}

/**
 * Custom hook for managing rest timer between sets
 * Supports per-exercise durations with smart defaults
 */
export const useRestTimer = (initialDuration: number = 90): UseRestTimerReturn => {
  const [restTimerVisible, setRestTimerVisible] = useState(false);
  const [restEndTime, setRestEndTime] = useState<number | null>(null);
  const [restSeconds, setRestSeconds] = useState(initialDuration);
  const [restTimerDuration, setRestTimerDuration] = useState(initialDuration);
  const [exerciseRestTimers, setExerciseRestTimers] = useState<Record<string, number>>({});
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null);

  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIdRef = useRef<string | null>(null);

  // Load per-exercise rest timer preferences on mount
  useEffect(() => {
    const loadTimers = async () => {
      const timers = await getExerciseRestTimers();
      setExerciseRestTimers(timers);
    };
    loadTimers();
  }, []);

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

  /**
   * Get the rest duration for a specific exercise.
   * Checks stored preferences first, then falls back to smart defaults.
   */
  const getExerciseRestDuration = useCallback(
    (exerciseId: string, exerciseName: string): number => {
      if (exerciseId in exerciseRestTimers) {
        return exerciseRestTimers[exerciseId];
      }
      return getSmartDefaultRestSeconds(exerciseName);
    },
    [exerciseRestTimers]
  );

  /**
   * Set and persist the rest duration for a specific exercise.
   */
  const setExerciseRestDurationFn = useCallback(
    async (exerciseId: string, seconds: number): Promise<void> => {
      setExerciseRestTimers((prev) => ({ ...prev, [exerciseId]: seconds }));
      await setExerciseRestTimer(exerciseId, seconds);
    },
    []
  );

  const startRestTimer = async (exerciseId?: string, exerciseName?: string) => {
    // Clear any existing timer and notification
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
    if (notificationIdRef.current) {
      await cancelNotification(notificationIdRef.current);
      notificationIdRef.current = null;
    }

    // Track which exercise started this timer
    setCurrentExerciseId(exerciseId || null);

    // Determine duration: per-exercise if available, else global
    let duration = restTimerDuration;
    if (exerciseId && exerciseName) {
      duration = getExerciseRestDuration(exerciseId, exerciseName);
    }

    // Calculate end time
    const endTime = Date.now() + duration * 1000;
    setRestEndTime(endTime);
    setRestSeconds(duration);
    setRestTimerVisible(true);

    // Schedule notification for when timer ends (for background alert)
    const notificationId = await scheduleRestTimerNotification(duration);
    notificationIdRef.current = notificationId;
  };

  /**
   * Adjust the currently running rest timer by delta seconds (e.g. +30 or -30).
   * Immediately changes the countdown.
   */
  const adjustRestTime = (deltaSeconds: number) => {
    if (!restEndTime || !restTimerVisible) return;

    const newEndTime = restEndTime + deltaSeconds * 1000;
    const now = Date.now();

    if (newEndTime <= now) {
      // If adjusting would make it <= 0, just skip
      setRestTimerVisible(false);
      setRestEndTime(null);
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
      return;
    }

    setRestEndTime(newEndTime);
    // Update the duration to reflect new total (for progress ring)
    const newRemaining = Math.ceil((newEndTime - now) / 1000);
    const elapsed = restTimerDuration - restSeconds;
    setRestTimerDuration(elapsed + newRemaining);
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
    // Also update per-exercise preference if a timer is running for a specific exercise
    if (currentExerciseId) {
      setExerciseRestTimers((prev) => ({ ...prev, [currentExerciseId]: seconds }));
      setExerciseRestTimer(currentExerciseId, seconds);
    }
  };

  return {
    restTimerVisible,
    restSeconds,
    restTimerDuration,
    exerciseRestTimers,
    startRestTimer,
    skipRestTimer,
    setRestTimerDuration: updateRestTimerDuration,
    adjustRestTime,
    getExerciseRestDuration,
    setExerciseRestDuration: setExerciseRestDurationFn,
  };
};
