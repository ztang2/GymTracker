import React from 'react';
import { useTheme } from '../contexts';
import { View, Text, StyleSheet } from 'react-native';
import { typography, spacing, borderRadius ,  type ThemeColors } from '../constants/theme';
import { colorGlow } from '../utils';

export interface WeekOverviewData {
  label: string; // "This Week", "Last Week", etc.
  days: boolean[]; // Array of 7 booleans (Mon-Sun), true if workout happened
  totalWorkouts: number;
}

interface MonthlyOverviewProps {
  weeks: WeekOverviewData[];
  title?: string;
}

export default function MonthlyOverview({
  weeks,
  title = 'Last 4 Weeks',
}: MonthlyOverviewProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {/* Day labels header */}
      <View style={styles.headerRow}>
        <View style={styles.weekLabel} />
        {dayLabels.map((day, index) => (
          <View key={index} style={styles.dayHeaderCell}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
        <View style={styles.countLabel} />
      </View>

      {/* Week rows */}
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          <View style={styles.weekLabel}>
            <Text style={styles.weekLabelText}>{week.label}</Text>
          </View>
          
          <View style={styles.dotsContainer}>
            {week.days.map((hasWorkout, dayIndex) => (
              <View key={dayIndex} style={styles.dayCell}>
                <View
                  style={[
                    styles.dot,
                    hasWorkout ? styles.dotFilled : styles.dotEmpty,
                  ]}
                />
              </View>
            ))}
          </View>

          <View style={styles.countLabel}>
            <Text style={styles.countText}>{week.totalWorkouts}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  weekLabel: {
    width: 100,
  },
  weekLabelText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dotsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayHeaderCell: {
    width: 28,
    alignItems: 'center',
  },
  dayHeaderText: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
  dayCell: {
    width: 28,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotFilled: {
    backgroundColor: colors.teal,
    ...colorGlow(colors.teal, 'sm'),
  },
  dotEmpty: {
    backgroundColor: colors.border,
  },
  countLabel: {
    width: 40,
    alignItems: 'flex-end',
  },
  countText: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.purpleLight,
  },
});
