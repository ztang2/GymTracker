import React from 'react';
import { useTheme } from '../contexts';
import { TouchableOpacity, Text, StyleSheet, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { typography, borderRadius, spacing } from '../constants/theme';

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
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  if (gradientColors) {
    const glowColor = gradientColors[0] as string;
    const glowStyle = Platform.OS === 'web'
      ? { boxShadow: `0 0 28px 10px ${glowColor}80, 0 0 56px 18px ${glowColor}40` } as any
      : {
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 28,
          elevation: 16,
        };
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.container, glowStyle]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Ionicons name={icon} size={32} color="#FFFFFF" />
            <Text style={styles.titleGradient}>{title}</Text>
          </View>
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
      <View style={styles.content}>
        <Ionicons name={icon} size={32} color={colors.textPrimary} />
        <Text style={styles.title}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.xl,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
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
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
  },
  titleGradient: {
    ...typography.headline,
    color: '#FFFFFF',  // Always white on gradient backgrounds
    textAlign: 'center',
    fontWeight: '600',
  },
});
