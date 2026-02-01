import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, spacing, borderRadius, rarityColors, rarityGradients } from '../constants/theme';
import type { Badge } from '../services/types';
import { colorGlow } from '../utils';

interface BadgeUnlockedModalProps {
  visible: boolean;
  badge: Badge | null;
  onClose: () => void;
}

export default function BadgeUnlockedModal({
  visible,
  badge,
  onClose,
}: BadgeUnlockedModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && badge) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);

      // Start celebration animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, badge]);

  if (!badge) return null;

  const rarityColor = rarityColors[badge.rarity];
  const rarityGradient = rarityGradients[badge.rarity];

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '-5deg', '0deg'],
  });

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
            {
              transform: [{ scale: scaleAnim }, { rotate }],
            },
          ]}
        >
          {/* Celebration Header */}
          <View style={styles.header}>
            <Text style={styles.celebrationText}>BADGE UNLOCKED!</Text>
          </View>

          {/* Badge Icon */}
          <View style={styles.badgeContainer}>
            <LinearGradient
              colors={rarityGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.badgeGlow, colorGlow(rarityColor, 'md')]}
            >
              <View style={styles.badgeInner}>
                <Ionicons name={badge.icon_name as any} size={64} color={colors.textPrimary} />
              </View>
            </LinearGradient>
          </View>

          {/* Badge Info */}
          <Text style={styles.badgeName}>{badge.name}</Text>
          <View style={[styles.rarityBadge, { backgroundColor: `${rarityColor}30` }]}>
            <Text style={[styles.rarityText, { color: rarityColor }]}>
              {badge.rarity.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.description}>{badge.description}</Text>

          {/* XP Reward */}
          <View style={styles.xpContainer}>
            <Ionicons name="star" size={20} color={colors.purple} />
            <Text style={styles.xpText}>+{badge.xp_reward} XP</Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <LinearGradient
              colors={rarityGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.closeGradient}
            >
              <Text style={styles.closeButtonText}>Awesome!</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    padding: spacing.xxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  header: {
    marginBottom: spacing.xl,
  },
  celebrationText: {
    ...typography.caption,
    color: colors.orange,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
  },
  badgeContainer: {
    marginBottom: spacing.xl,
  },
  badgeGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeName: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  rarityBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  rarityText: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 1,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xl,
  },
  xpText: {
    ...typography.headline,
    color: colors.purple,
  },
  closeButton: {
    width: '100%',
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
