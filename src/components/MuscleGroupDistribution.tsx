import React, { useState, useCallback } from 'react';
import { useTheme } from '../contexts';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleRowPress = useCallback((index: number) => {
    setSelectedIndex(prev => (prev === index ? null : index));
  }, []);

  const handleDismiss = useCallback(() => {
    setSelectedIndex(null);
  }, []);

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

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Pressable onPress={handleDismiss} style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.barsContainer}>
        {data.map((item, index) => {
          const categoryColor = getCategoryColor(item.category);
          const isSelected = selectedIndex === index;
          
          return (
            <Pressable
              key={index}
              style={[styles.barRow, isSelected && styles.barRowSelected]}
              onPress={(e) => {
                e.stopPropagation?.();
                handleRowPress(index);
              }}
              accessibilityLabel={`${item.category}: ${item.count} workouts, ${item.percentage}%`}
              accessibilityRole="button"
            >
              <View style={styles.labelRow}>
                <View style={[
                  styles.colorDot,
                  { backgroundColor: categoryColor },
                  isSelected && styles.colorDotSelected,
                ]} />
                <Text style={[
                  styles.categoryLabel,
                  isSelected && styles.categoryLabelSelected,
                ]}>
                  {item.category}
                </Text>
                {isSelected && (
                  <Text style={[styles.tooltipBadge, { backgroundColor: categoryColor }]}>
                    {item.count} workout{item.count !== 1 ? 's' : ''} · {item.percentage.toFixed(0)}%
                  </Text>
                )}
              </View>
              
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor: categoryColor,
                      opacity: isSelected ? 1 : 0.8,
                    },
                  ]}
                />
              </View>
              
              <Text style={[
                styles.countText,
                isSelected && { color: categoryColor },
              ]}>
                {item.count}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Summary when something is selected */}
      {selectedIndex !== null && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            Total: {totalCount} workout{totalCount !== 1 ? 's' : ''} this month
          </Text>
        </View>
      )}
    </Pressable>
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
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  barsContainer: {
    gap: spacing.md,
  },
  barRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginHorizontal: -spacing.sm,
  },
  barRowSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
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
  colorDotSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryLabel: {
    ...typography.callout,
    color: colors.textPrimary,
    flex: 1,
  },
  categoryLabelSelected: {
    fontWeight: '600',
  },
  tooltipBadge: {
    ...typography.caption2,
    color: '#FFFFFF',
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  countText: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.purpleLight,
    position: 'absolute',
    right: spacing.sm,
    top: spacing.xs,
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
  summaryRow: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  summaryText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
