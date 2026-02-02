import React, { useRef, useEffect } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';

interface AnimatedCardProps {
  index: number;
  staggerMs?: number;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Wraps children in a staggered fade-in-up animation on mount.
 * Uses RN Animated API only — web-compatible, no reanimated.
 */
export default function AnimatedCard({
  index,
  staggerMs = 80,
  duration = 300,
  delay = 0,
  style,
  children,
}: AnimatedCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    const totalDelay = delay + index * staggerMs;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay: totalDelay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay: totalDelay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
