import React from 'react';
import { useTheme } from '../contexts';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, borderRadius, spacing } from '../constants/theme';

export interface DayProgress {
  day: string; // "Mon", "Tue", etc.
  date: number; // Day of month (1-31)
  completed: boolean;
  workoutCount?: number; // Number of workouts (optional, can affect bar height)
}

interface DailyProgressBarProps {
  weekData: DayProgress[];
  title?: string;
}

export default function DailyProgressBar({
  weekData,
  title = 'This Week',
}: DailyProgressBarProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  // Normalize bar heights based on workout count (1-3+)
  const getBarHeight = (dayData: DayProgress) => {
    if (!dayData.completed) return 0;
    const count = dayData.workoutCount || 1;
    if (count >= 3) return 100;
    if (count === 2) return 70;
    return 50;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.barsContainer}>
        {weekData.map((dayData, index) => {
          const barHeight = getBarHeight(dayData);
          return (
            <View key={index} style={styles.dayColumn}>
              {/* Bar container */}
              <View style={styles.barContainer}>
                {dayData.completed ? (
                  <LinearGradient
                    colors={colors.gradientPurplePink}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.bar, { height: `${barHeight}%` }]}
                  />
                ) : (
                  <View style={[styles.bar, styles.barInactive]} />
                )}
              </View>
              {/* Day label */}
              <Text style={styles.dayText}>{dayData.day}</Text>
              <Text style={styles.dateText}>{dayData.date}</Text>
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
  },
  title: {
    ...typography.title2,
    marginBottom: spacing.xl,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  barContainer: {
    width: '80%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: borderRadius.sm,
    minHeight: 4,
  },
  barInactive: {
    height: 4,
    backgroundColor: colors.border,
  },
  dayText: {
    ...typography.caption,
    fontWeight: '600',
  },
  dateText: {
    ...typography.caption2,
  },
});
