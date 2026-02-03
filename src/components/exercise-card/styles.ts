import { StyleSheet } from 'react-native';
import { typography, spacing, borderRadius, shadows, type ThemeColors } from '../../constants/theme';
import { colorGlow } from '../../utils';

export const createExerciseCardStyles = (colors: ThemeColors) => StyleSheet.create({
  exerciseCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  reorderControls: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dragHandle: {
    fontSize: 16,
    color: colors.textTertiary,
    lineHeight: 16,
  },
  reorderButton: {
    padding: 2,
    borderRadius: borderRadius.sm,
  },
  reorderButtonDisabled: {
    opacity: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  restTimerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  restTimerLabel: {
    ...typography.caption2,
    color: colors.orange,
    fontWeight: '600',
  },
  lastPerfContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  lastPerfText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  maxPerfText: {
    ...typography.caption,
    color: colors.teal,
  },
  exerciseName: {
    ...typography.headline,
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
  exerciseCategory: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  setHeaderText: {
    ...typography.caption2,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  setNumber: {
    ...typography.callout,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  setInput: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  setInputCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  setActions: {
    flex: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.green,
    borderColor: colors.green,
    ...colorGlow(colors.green, 'sm'),
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  addSetText: {
    ...typography.callout,
    color: colors.teal,
  },
  notesContainer: {
    marginBottom: spacing.md,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  notesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  notesHeaderText: {
    ...typography.callout,
  },
  notesInput: {
    ...typography.body,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    marginTop: spacing.xs,
    minHeight: 80,
  },
});
