import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts';
import { typography, spacing, borderRadius } from '../constants/theme';
import { formatDate, parseISODate } from '../utils/dateUtils';

export interface PRDisplayData {
  id: string;
  exerciseName: string;
  recordType: string; // "Max Weight", "Max Reps", etc.
  value: string; // Formatted value like "100 kg" or "15 reps"
  date: string; // ISO date string
  recency: 'gold' | 'silver' | 'bronze';
}

interface RecentPRsListProps {
  prs: PRDisplayData[];
  title?: string;
}

export default function RecentPRsList({
  prs,
  title = 'Recent PRs',
}: RecentPRsListProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const getTrophyColor = (recency: 'gold' | 'silver' | 'bronze') => {
    switch (recency) {
      case 'gold':
        return '#FFD700';
      case 'silver':
        return '#C0C0C0';
      case 'bronze':
        return '#CD7F32';
    }
  };

  // Handle empty state
  if (prs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="trophy" size={20} color={colors.purpleLight} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="barbell-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyText}>No personal records yet</Text>
          <Text style={styles.emptySubtext}>
            Keep pushing yourself to set new PRs!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={20} color={colors.purpleLight} />
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.listContainer}>
        {prs.map((pr) => (
          <View key={pr.id} style={styles.prItem}>
            <Ionicons
              name="trophy"
              size={24}
              color={getTrophyColor(pr.recency)}
              style={styles.trophyIcon}
            />
            
            <View style={styles.prContent}>
              <Text style={styles.exerciseName}>{pr.exerciseName}</Text>
              <View style={styles.detailsRow}>
                <Text style={styles.recordType}>{pr.recordType}</Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.value}>{pr.value}</Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.date}>
                  {formatDate(parseISODate(pr.date), 'MMM DD')}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  listContainer: {
    gap: spacing.md,
  },
  prItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  trophyIcon: {
    marginRight: spacing.md,
  },
  prContent: {
    flex: 1,
  },
  exerciseName: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recordType: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  separator: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  value: {
    ...typography.caption,
    color: colors.purpleLight,
    fontWeight: '600',
  },
  date: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.callout,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
