import React from 'react';
import { useTheme } from '../contexts';
import { View, Text, StyleSheet } from 'react-native';
import { typography, spacing, borderRadius, getCategoryColor } from '../constants/theme';

export interface CategoryWorkoutData {
  category: string;
  count: number;
  percentage: number;
}

interface MuscleGroupDistributionProps {
  data: CategoryWorkoutData[];
  title?: string;
}

export default function MuscleGroupDistribution({
  data,
  title = 'This Month\'s Focus',
}: MuscleGroupDistributionProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  // Handle empty state
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No workout data this month</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.barsContainer}>
        {data.map((item, index) => {
          const categoryColor = getCategoryColor(item.category);
          
          return (
            <View key={index} style={styles.barRow}>
              <View style={styles.labelRow}>
                <View style={[styles.colorDot, { backgroundColor: categoryColor }]} />
                <Text style={styles.categoryLabel}>{item.category}</Text>
              </View>
              
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${item.percentage}%`, backgroundColor: categoryColor },
                  ]}
                />
              </View>
              
              <Text style={styles.countText}>{item.count}</Text>
            </View>
          );
        })}
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
  title: {
    ...typography.title2,
    marginBottom: spacing.lg,
  },
  barsContainer: {
    gap: spacing.md,
  },
  barRow: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  categoryLabel: {
    ...typography.callout,
    flex: 1,
  },
  countText: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.purpleLight,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  barTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
});
