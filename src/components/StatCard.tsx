import React from 'react';
import { useTheme } from '../contexts';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, spacing, borderRadius, shadows } from '../constants/theme';

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
  gradientColors,
  backgroundColor,
  onPress,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const gradColors = gradientColors || colors.gradientPurplePink;
  const bgColor = backgroundColor || colors.cardBackground;
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
            colors={gradColors}
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
          colors={gradColors}
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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.sm,
  },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
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
    color: colors.textPrimary,  // Dynamic color based on theme
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
});

export default StatCard;
