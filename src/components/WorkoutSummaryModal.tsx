import React, { useRef, useEffect } from 'react';
import { useTheme } from '../contexts';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, spacing, borderRadius, shadows } from '../constants/theme';
import { buildShareTextFromSummary, shareWorkoutText } from '../utils/shareWorkout';
import type { WorkoutSummary, PRDetectionResult, Badge } from '../services/types';

interface WorkoutSummaryModalProps {
  visible: boolean;
  summary: WorkoutSummary | null;
  onClose: () => void;
  onSaveAsTemplate?: () => void;
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

// Confetti particle component
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

    // Random direction and distance
    const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
    const distance = 60 + Math.random() * 40;
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance - 30; // bias upward
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

function CelebrationAnimation({ visible }: { visible: boolean }) {
  const trophyScale = useRef(new Animated.Value(0)).current;
  const trophyRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    // Trophy bounce-in
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

    // Gentle wiggle
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
      {/* Confetti particles */}
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <ConfettiParticle key={i} index={i} visible={visible} />
      ))}
    </Animated.View>
  );
}

export default function WorkoutSummaryModal({
  visible,
  summary,
  onClose,
  onSaveAsTemplate,
}: WorkoutSummaryModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  if (!summary) return null;

  const hasNewPRs = summary.newPRs.length > 0;
  const hasNewBadges = summary.newBadges.length > 0;

  const handleShare = () => {
    const text = buildShareTextFromSummary(summary);
    shareWorkoutText(text);
  };

  // Container scale-up entrance animation
  const containerScale = useRef(new Animated.Value(0.9)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      containerScale.setValue(0.9);
      containerOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(containerScale, {
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(containerOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <View style={styles.overlay} accessible={false}>
        <Animated.View style={[styles.container, { opacity: containerOpacity, transform: [{ scale: containerScale }] }]}>
          {/* Header with gradient */}
          <LinearGradient
            colors={colors.gradientPurplePink}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.celebrationIcon}>
              <CelebrationAnimation visible={visible} />
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

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel="Share workout summary"
            >
              <Ionicons name="share-social-outline" size={18} color={colors.teal} />
              <Text style={styles.shareButtonText}>Share Workout</Text>
            </TouchableOpacity>
            {onSaveAsTemplate && (
              <TouchableOpacity
                style={styles.saveTemplateButton}
                onPress={onSaveAsTemplate}
                accessibilityRole="button"
                accessibilityLabel="Save workout as template"
              >
                <Ionicons name="bookmark-outline" size={18} color={colors.purple} />
                <Text style={styles.saveTemplateButtonText}>Save as Template</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close workout summary"
            >
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
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
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
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.teal,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  shareButtonText: {
    ...typography.headline,
    color: colors.teal,
  },
  saveTemplateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.purple,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  saveTemplateButtonText: {
    ...typography.headline,
    color: colors.purple,
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
