import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, spacing, borderRadius, prColors } from '../constants/theme';
import type { PRDetectionResult } from '../services/types';
import { getPRTypeName, formatPRValue } from '../services/prService';

interface PRCelebrationModalProps {
  visible: boolean;
  prs: PRDetectionResult[];
  onClose: () => void;
}

export default function PRCelebrationModal({
  visible,
  prs,
  onClose,
}: PRCelebrationModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && prs.length > 0) {
      scaleAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, prs]);

  if (prs.length === 0) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Header */}
          <LinearGradient
            colors={prColors.goldGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.trophyContainer}>
              <Ionicons name="trophy" size={48} color={colors.textPrimary} />
            </View>
            <Text style={styles.title}>
              {prs.length === 1 ? 'NEW PERSONAL RECORD!' : 'NEW PERSONAL RECORDS!'}
            </Text>
            <Text style={styles.subtitle}>
              You've crushed your previous bests
            </Text>
          </LinearGradient>

          {/* PRs List */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: spacing.lg }}
          >
            {prs.map((pr, index) => (
              <View key={`${pr.exerciseId}-${pr.recordType}-${index}`} style={styles.prCard}>
                <View style={styles.prHeader}>
                  <Text style={styles.exerciseName}>{pr.exerciseName}</Text>
                  <View style={styles.prTypeBadge}>
                    <Text style={styles.prTypeText}>
                      {getPRTypeName(pr.recordType)}
                    </Text>
                  </View>
                </View>

                <View style={styles.prValues}>
                  <View style={styles.newValue}>
                    <Text style={styles.newValueLabel}>New</Text>
                    <Text style={styles.newValueText}>
                      {formatPRValue(pr.newValue, pr.recordType)}
                    </Text>
                  </View>

                  {pr.previousValue && (
                    <>
                      <View style={styles.arrow}>
                        <Ionicons name="arrow-forward" size={20} color={colors.textTertiary} />
                      </View>
                      <View style={styles.oldValue}>
                        <Text style={styles.oldValueLabel}>Previous</Text>
                        <Text style={styles.oldValueText}>
                          {formatPRValue(pr.previousValue, pr.recordType)}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                {pr.improvement && (
                  <View style={styles.improvementBadge}>
                    <Ionicons name="trending-up" size={14} color={colors.green} />
                    <Text style={styles.improvementText}>
                      +{pr.improvement.toFixed(1)}% improvement
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Close Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <LinearGradient
                colors={prColors.goldGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.closeGradient}
              >
                <Text style={styles.closeButtonText}>Keep Crushing It!</Text>
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
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  trophyContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    maxHeight: 300,
  },
  prCard: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: prColors.gold,
  },
  prHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  exerciseName: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  prTypeBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  prTypeText: {
    ...typography.caption2,
    color: prColors.gold,
    fontWeight: '600',
  },
  prValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  newValue: {
    flex: 1,
  },
  newValueLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  newValueText: {
    ...typography.title2,
    color: prColors.gold,
  },
  arrow: {
    paddingHorizontal: spacing.sm,
  },
  oldValue: {
    flex: 1,
    alignItems: 'flex-end',
  },
  oldValueLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  oldValueText: {
    ...typography.body,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  improvementText: {
    ...typography.caption,
    color: colors.green,
  },
  footer: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
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
