import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '../services/workoutLogger';
import { REST_TIMER_OPTIONS } from '../services';
import { useTheme } from '../contexts';
import { typography, spacing, borderRadius, shadows } from '../constants/theme';
import { colorGlow } from '../utils';

interface RestTimerToastProps {
  visible: boolean;
  restSeconds: number;
  restTimerDuration: number;
  bottomOffset: number;
  onSkip: () => void;
  onLongPress: () => void;
  showOptions: boolean;
  onCloseOptions: () => void;
  onSelectDuration: (seconds: number) => void;
}

export const RestTimerToast: React.FC<RestTimerToastProps> = ({
  visible,
  restSeconds,
  restTimerDuration,
  bottomOffset,
  onSkip,
  onLongPress,
  showOptions,
  onCloseOptions,
  onSelectDuration,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (!visible) return null;

  return (
    <>
      <View style={[styles.restTimerToast, { bottom: bottomOffset }]}>
        <Pressable
          style={styles.restTimerContent}
          onLongPress={onLongPress}
          delayLongPress={500}
        >
          <Ionicons name="timer-outline" size={24} color={colors.orange} />
          <View style={styles.restTimerInfo}>
            <Text style={styles.restTimerLabel}>Rest Timer (hold to change)</Text>
            <Text style={styles.restTimerValue}>{formatDuration(restSeconds)}</Text>
          </View>
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </Pressable>
      </View>

      {/* Rest Timer Options Modal */}
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={onCloseOptions}
      >
        <Pressable style={styles.restOptionsOverlay} onPress={onCloseOptions}>
          <View style={styles.restOptionsContainer}>
            <Text style={styles.restOptionsTitle}>Rest Timer Duration</Text>
            <View style={styles.restOptionsGrid}>
              {REST_TIMER_OPTIONS.map((seconds) => (
                <TouchableOpacity
                  key={seconds}
                  style={[
                    styles.restOptionButton,
                    restTimerDuration === seconds && styles.restOptionButtonActive,
                  ]}
                  onPress={() => onSelectDuration(seconds)}
                >
                  <Text
                    style={[
                      styles.restOptionText,
                      restTimerDuration === seconds && styles.restOptionTextActive,
                    ]}
                  >
                    {seconds}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  restTimerToast: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  restTimerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  restTimerInfo: {
    flex: 1,
  },
  restTimerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  restTimerValue: {
    ...typography.title2,
    color: colors.orange,
    fontVariant: ['tabular-nums'],
    ...colorGlow(colors.orange, 'sm'),
  },
  skipButton: {
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  skipButtonText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  // Rest Timer Options Modal
  restOptionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restOptionsContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '80%',
    maxWidth: 300,
  },
  restOptionsTitle: {
    ...typography.headline,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  restOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  restOptionButton: {
    backgroundColor: colors.backgroundElevated,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  restOptionButtonActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
    ...colorGlow(colors.orange, 'sm'),
  },
  restOptionText: {
    ...typography.headline,
    color: colors.textSecondary,
  },
  restOptionTextActive: {
    color: colors.textPrimary,
  },
});
