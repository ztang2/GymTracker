import { StyleSheet } from 'react-native';
import { typography, spacing, borderRadius, shadows, type ThemeColors } from '../../constants/theme';

export const createSummaryStyles = (colors: ThemeColors) => StyleSheet.create({
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
