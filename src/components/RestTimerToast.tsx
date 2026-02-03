import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '../services/workoutLogger';
import { REST_TIMER_OPTIONS } from '../services';
import { useTheme } from '../contexts';
import { typography, spacing, borderRadius, shadows ,  type ThemeColors } from '../constants/theme';
import { colorGlow } from '../utils';

interface RestTimerToastProps {
  visible: boolean;
  restSeconds: number;
  restTimerDuration: number;
  bottomOffset: number;
  onSkip: () => void;
  onLongPress: () => void;
  onAdjustTime: (deltaSeconds: number) => void;
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
  onAdjustTime,
  showOptions,
  onCloseOptions,
  onSelectDuration,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (!visible) return null;

  // Progress ring calculations
  const size = 64;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = restTimerDuration > 0 ? restSeconds / restTimerDuration : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <>
      <Pressable
        style={[styles.container, { bottom: bottomOffset }]}
        onLongPress={onLongPress}
        delayLongPress={500}
      >
        {/* -30s button */}
        <TouchableOpacity
          onPress={() => onAdjustTime(-30)}
          style={styles.adjustButton}
          activeOpacity={0.7}
        >
          <Text style={styles.adjustText}>−30</Text>
        </TouchableOpacity>

        {/* Circular timer */}
        <View style={styles.timerRing}>
          <Svg width={size} height={size} style={styles.svgRing}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.border}
              strokeWidth={strokeWidth}
              fill="none"
              opacity={0.3}
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.orange}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90, ${size / 2}, ${size / 2})`}
            />
          </Svg>
          <View style={styles.timerTextContainer}>
            <Text style={styles.timerValue}>{formatDuration(restSeconds)}</Text>
          </View>
        </View>

        {/* +30s button */}
        <TouchableOpacity
          onPress={() => onAdjustTime(30)}
          style={styles.adjustButton}
          activeOpacity={0.7}
        >
          <Text style={styles.adjustText}>+30</Text>
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Ionicons name="play-forward" size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      </Pressable>

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

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.orange + '30',
    ...shadows.md,
  },
  adjustButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustText: {
    ...typography.caption,
    color: colors.orange,
    fontWeight: '700',
    fontSize: 12,
  },
  timerRing: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgRing: {
    position: 'absolute',
  },
  timerTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerValue: {
    ...typography.headline,
    color: colors.orange,
    fontVariant: ['tabular-nums'],
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.orange + '20',
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '80%',
    maxWidth: 300,
  },
  restOptionsTitle: {
    ...typography.headline,
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: colors.textPrimary,
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
    borderRadius: borderRadius.full,
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
