import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

/**
 * Hook that returns an Animated.Value for a staggered fade-in-up entrance.
 * @param index - The item index (used to calculate stagger delay)
 * @param options - Animation configuration
 */
export function useEntranceAnimation(
  index: number,
  options?: {
    delay?: number;
    staggerMs?: number;
    duration?: number;
    translateY?: number;
  }
) {
  const {
    delay = 0,
    staggerMs = 80,
    duration = 300,
    translateY = 16,
  } = options ?? {};

  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(translateY)).current;

  useEffect(() => {
    const totalDelay = delay + index * staggerMs;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay: totalDelay,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration,
        delay: totalDelay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return {
    opacity,
    transform: [{ translateY: translate }],
  };
}
