import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '../constants/theme';

interface ActionButtonProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  gradientColors?: readonly [string, string, ...string[]];
}

export default function ActionButton({
  title,
  icon,
  onPress,
  color,
  gradientColors,
}: ActionButtonProps) {
  const buttonContent = (
    <View style={styles.content}>
      <Ionicons name={icon} size={32} color={colors.textPrimary} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );

  if (gradientColors) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.8}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, styles.solidButton, { backgroundColor: color || colors.cardBackground }]}
      activeOpacity={0.8}
    >
      {buttonContent}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  solidButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    ...typography.headline,
    textAlign: 'center',
    fontWeight: '600',
  },
});
