import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Custom hook for managing workout duration timer
 * Uses timestamp-based calculations for accuracy even when app is backgrounded
 */
export const useWorkoutTimer = (startTime: Date) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const updateElapsedTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);
    };

    // Update immediately
    updateElapsedTime();

    // Set up interval for UI updates
    const timer = setInterval(updateElapsedTime, 1000);

    // Handle app state changes (background/foreground)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Update immediately when app comes to foreground
        updateElapsedTime();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [startTime]);

  return elapsedSeconds;
};
