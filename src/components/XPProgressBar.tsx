import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, xpGradient } from '../constants/theme';
import type { LevelInfo } from '../services/types';

interface XPProgressBarProps {
  levelInfo: LevelInfo;
  compact?: boolean;
}

export default function XPProgressBar({ levelInfo, compact = false }: XPProgressBarProps) {
  const xpInLevel = levelInfo.currentXP - levelInfo.xpForCurrentLevel;
  const xpNeeded = levelInfo.xpForNextLevel - levelInfo.xpForCurrentLevel;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactLevel}>Lv. {levelInfo.level}</Text>
          <Text style={styles.compactXP}>{xpInLevel}/{xpNeeded} XP</Text>
        </View>
        <View style={styles.compactBarContainer}>
          <LinearGradient
            colors={xpGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.compactBar, { width: `${levelInfo.xpProgress * 100}%` }]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Level Badge */}
      <View style={[styles.levelBadge, { backgroundColor: levelInfo.tierColor }]}>
        <Text style={styles.levelNumber}>{levelInfo.level}</Text>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.tierName}>{levelInfo.tierName}</Text>
            <Text style={styles.levelLabel}>Level {levelInfo.level}</Text>
          </View>
          <View style={styles.xpInfo}>
            <Text style={styles.currentXP}>{levelInfo.currentXP.toLocaleString()}</Text>
            <Text style={styles.xpLabel}> XP</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.barContainer}>
          <LinearGradient
            colors={xpGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.bar, { width: `${levelInfo.xpProgress * 100}%` }]}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.progressText}>
            {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP to next level
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    ...typography.title,
    color: colors.textPrimary,
  },
  progressSection: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  tierName: {
    ...typography.caption,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  levelLabel: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  xpInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentXP: {
    ...typography.headline,
    color: colors.purple,
  },
  xpLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  barContainer: {
    height: 8,
    backgroundColor: colors.backgroundElevated,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    alignItems: 'flex-end',
  },
  progressText: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
  // Compact styles
  compactContainer: {
    gap: spacing.xs,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactLevel: {
    ...typography.caption,
    color: colors.purple,
    fontWeight: '600',
  },
  compactXP: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
  compactBarContainer: {
    height: 4,
    backgroundColor: colors.backgroundElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactBar: {
    height: '100%',
    borderRadius: 2,
  },
});
