import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '../services/workoutLogger';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

interface WorkoutHeaderProps {
  elapsedSeconds: number;
  onCancel: () => void;
}

export const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({
  elapsedSeconds,
  onCancel,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onCancel}>
        <Ionicons name="close" size={28} color={colors.textPrimary} />
      </TouchableOpacity>
      <View style={styles.timerContainer}>
        <Ionicons name="time-outline" size={20} color={colors.teal} />
        <Text style={styles.timerText}>{formatDuration(elapsedSeconds)}</Text>
      </View>
      <View style={{ width: 28 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  timerText: {
    ...typography.headline,
    color: colors.teal,
    fontVariant: ['tabular-nums'],
  },
});
