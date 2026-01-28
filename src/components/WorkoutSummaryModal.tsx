import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import type { WorkoutSummary, PRDetectionResult, Badge } from '../services/types';

interface WorkoutSummaryModalProps {
  visible: boolean;
  summary: WorkoutSummary | null;
  onClose: () => void;
}

// Format duration from seconds to MM:SS or HH:MM:SS
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m ${secs}s`;
};

// Format volume with K suffix for thousands
const formatVolume = (kg: number): string => {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}K kg`;
  }
  return `${kg.toLocaleString()} kg`;
};

export default function WorkoutSummaryModal({
  visible,
  summary,
  onClose,
}: WorkoutSummaryModalProps) {
  if (!summary) return null;

  const hasNewPRs = summary.newPRs.length > 0;
  const hasNewBadges = summary.newBadges.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header with gradient */}
          <LinearGradient
            colors={colors.gradientPurplePink}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.celebrationIcon}>
              <Ionicons name="trophy" size={48} color={colors.textPrimary} />
            </View>
            <Text style={styles.title}>Workout Complete!</Text>
            <Text style={styles.subtitle}>Great job crushing it today</Text>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={24} color={colors.teal} />
                <Text style={styles.statValue}>{formatDuration(summary.duration)}</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="barbell-outline" size={24} color={colors.orange} />
                <Text style={styles.statValue}>{summary.exerciseCount}</Text>
                <Text style={styles.statLabel}>Exercises</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle-outline" size={24} color={colors.green} />
                <Text style={styles.statValue}>{summary.setCount}</Text>
                <Text style={styles.statLabel}>Sets</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="fitness-outline" size={24} color={colors.purple} />
                <Text style={styles.statValue}>{formatVolume(summary.totalVolume)}</Text>
                <Text style={styles.statLabel}>Volume</Text>
              </View>
            </View>

            {/* XP Earned */}
            {summary.xpEarned > 0 && (
              <View style={styles.xpSection}>
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.xpBadge}
                >
                  <Ionicons name="star" size={20} color={colors.purple} />
                  <Text style={styles.xpText}>+{summary.xpEarned} XP</Text>
                </LinearGradient>
              </View>
            )}

            {/* New PRs Section */}
            {hasNewPRs && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="trophy" size={20} color="#FFD700" />
                  <Text style={styles.sectionTitle}>New Personal Records!</Text>
                </View>
                {summary.newPRs.map((pr, index) => (
                  <View key={index} style={styles.prItem}>
                    <Text style={styles.prExercise}>{pr.exerciseName}</Text>
                    <View style={styles.prDetails}>
                      <Text style={styles.prValue}>
                        {pr.recordType === 'max_weight'
                          ? `${pr.newValue} kg`
                          : pr.recordType === 'max_reps'
                          ? `${pr.newValue} reps`
                          : `${pr.newValue.toFixed(1)} kg (1RM)`}
                      </Text>
                      {pr.improvement && (
                        <Text style={styles.prImprovement}>
                          +{pr.improvement.toFixed(1)}%
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* New Badges Section */}
            {hasNewBadges && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="ribbon" size={20} color={colors.orange} />
                  <Text style={styles.sectionTitle}>Badges Unlocked!</Text>
                </View>
                {summary.newBadges.map((badge, index) => (
                  <View key={index} style={styles.badgeItem}>
                    <View style={styles.badgeIcon}>
                      <Ionicons
                        name={badge.icon_name as any}
                        size={24}
                        color={colors.textPrimary}
                      />
                    </View>
                    <View style={styles.badgeInfo}>
                      <Text style={styles.badgeName}>{badge.name}</Text>
                      <Text style={styles.badgeDesc}>{badge.description}</Text>
                    </View>
                    <Text style={styles.badgeXP}>+{badge.xp_reward} XP</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Close Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <LinearGradient
                colors={colors.gradientTealGreen}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.closeGradient}
              >
                <Text style={styles.closeButtonText}>Done</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
    ...shadows.lg,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  celebrationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statItem: {
    width: '48%',
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statValue: {
    ...typography.title2,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  xpSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  xpText: {
    ...typography.headline,
    color: colors.purple,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  prItem: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  prExercise: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  prDetails: {
    alignItems: 'flex-end',
  },
  prValue: {
    ...typography.headline,
    color: '#FFD700',
  },
  prImprovement: {
    ...typography.caption,
    color: colors.green,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  badgeDesc: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  badgeXP: {
    ...typography.callout,
    color: colors.purple,
  },
  footer: {
    padding: spacing.xl,
    paddingTop: 0,
  },
  closeButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  closeGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  closeButtonText: {
    ...typography.headline,
    color: colors.textPrimary,
  },
});
