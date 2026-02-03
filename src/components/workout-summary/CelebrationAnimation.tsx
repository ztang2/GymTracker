import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#FB923C', '#34D399'];
const PARTICLE_COUNT = 12;

function ConfettiParticle({ index, visible }: { index: number; visible: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
    const distance = 60 + Math.random() * 40;
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance - 30;
    const delay = 100 + Math.random() * 200;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: targetX, duration: 500, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: targetY, duration: 500, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  const size = 6 + Math.random() * 4;
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const isCircle = index % 3 === 0;

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${180 + Math.random() * 360}deg`],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: isCircle ? size : size * 1.5,
        borderRadius: isCircle ? size / 2 : 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateX }, { translateY }, { rotate: spin }, { scale }],
      }}
    />
  );
}

export function CelebrationAnimation({ visible }: { visible: boolean }) {
  const trophyScale = useRef(new Animated.Value(0)).current;
  const trophyRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.sequence([
      Animated.spring(trophyScale, {
        toValue: 1.2,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(trophyScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(200),
      Animated.timing(trophyRotate, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(trophyRotate, { toValue: -1, duration: 100, useNativeDriver: true }),
      Animated.timing(trophyRotate, { toValue: 0.5, duration: 80, useNativeDriver: true }),
      Animated.timing(trophyRotate, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  const wobble = trophyRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  return (
    <Animated.View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: trophyScale }, { rotate: wobble }],
      }}
    >
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <ConfettiParticle key={i} index={i} visible={visible} />
      ))}
    </Animated.View>
  );
}
