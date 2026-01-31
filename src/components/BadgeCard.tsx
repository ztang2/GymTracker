import React from 'react';
import { useTheme } from '../contexts';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius, rarityColors, rarityGradients } from '../constants/theme';
import type { BadgeWithStatus, BadgeRarity } from '../services/types';
import ProgressBar from './ProgressBar';

interface BadgeCardProps {
  badge: BadgeWithStatus;
  compact?: boolean;
}

// Format date for earned display
const formatEarnedDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function BadgeCard({ badge, compact = false }: BadgeCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const rarityColor = rarityColors[badge.rarity];
  const rarityGradient = rarityGradients[badge.rarity];

  if (compact) {
    return (
      <View style={[styles.compactContainer, !badge.isUnlocked && styles.locked]}>
        <View style={[styles.compactIcon, { backgroundColor: badge.isUnlocked ? rarityColor : colors.backgroundElevated }]}>
          <Ionicons
            name={badge.icon_name as any}
            size={24}
            color={badge.isUnlocked ? colors.textPrimary : colors.textMuted}
          />
          {!badge.isUnlocked && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={12} color={colors.textTertiary} />
            </View>
          )}
        </View>
        <Text style={[styles.compactName, !badge.isUnlocked && styles.lockedText]} numberOfLines={1}>
          {badge.name}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, !badge.isUnlocked && styles.locked]}>
      <View style={styles.row}>
        {/* Badge Icon */}
        <View style={styles.iconContainer}>
          {badge.isUnlocked ? (
            <LinearGradient
              colors={rarityGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Ionicons name={badge.icon_name as any} size={28} color={colors.textPrimary} />
            </LinearGradient>
          ) : (
            <View style={styles.lockedIcon}>
              <Ionicons name={badge.icon_name as any} size={28} color={colors.textMuted} />
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={12} color={colors.textTertiary} />
              </View>
            </View>
          )}
        </View>

        {/* Badge Info */}
        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={[styles.name, !badge.isUnlocked && styles.lockedText]}>
              {badge.name}
            </Text>
            <View style={[styles.rarityBadge, { backgroundColor: `${rarityColor}30` }]}>
              <Text style={[styles.rarityText, { color: rarityColor }]}>
                {badge.rarity.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={[styles.description, !badge.isUnlocked && styles.lockedText]}>
            {badge.description}
          </Text>

          {/* Progress or Earned Date */}
          {badge.isUnlocked ? (
            <View style={styles.earnedContainer}>
              <Ionicons name="checkmark-circle" size={14} color={colors.green} />
              <Text style={styles.earnedText}>
                Earned {formatEarnedDate(badge.earnedAt!)}
              </Text>
            </View>
          ) : (
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={badge.progress}
                height={4}
                backgroundColor={colors.backgroundElevated}
                gradientColors={rarityGradient}
              />
              <Text style={styles.progressText}>
                {badge.currentValue} / {badge.requirement_value}
              </Text>
            </View>
          )}
        </View>

        {/* XP Reward */}
        <View style={styles.xpContainer}>
          <Text style={[styles.xpValue, !badge.isUnlocked && styles.lockedText]}>
            +{badge.xp_reward}
          </Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  locked: {
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  lockBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  lockedText: {
    color: colors.textTertiary,
  },
  rarityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  rarityText: {
    ...typography.caption2,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  earnedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  earnedText: {
    ...typography.caption,
    color: colors.green,
  },
  progressContainer: {
    gap: spacing.xs,
  },
  progressText: {
    ...typography.caption2,
    color: colors.textTertiary,
    alignSelf: 'flex-end',
  },
  xpContainer: {
    alignItems: 'center',
  },
  xpValue: {
    ...typography.headline,
    color: colors.purple,
  },
  xpLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
  // Compact styles
  compactContainer: {
    alignItems: 'center',
    width: 80,
    gap: spacing.xs,
  },
  compactIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  compactName: {
    ...typography.caption2,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
