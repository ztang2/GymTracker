import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'gradient';
  gradientColors?: readonly [string, string, ...string[]];
  backgroundColor?: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  gradientColors = colors.gradientPurplePink,
  backgroundColor = colors.cardBackground,
  onPress,
}) => {
  const content = (
    <View style={styles.content}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
        {variant === 'gradient' ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {content}
          </LinearGradient>
        ) : (
          <View style={[styles.card, { backgroundColor }]}>
            {content}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {variant === 'gradient' ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.card, { backgroundColor }]}>
          {content}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.sm,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.sm,
    minHeight: 130,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.statNumber,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
});

export default StatCard;
