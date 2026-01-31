import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts';
import { typography, spacing, borderRadius } from '../constants/theme';

export interface DayActivityData {
  day: string; // "Mon", "Tue", etc.
  date: number; // Day of month (1-31)
  volume: number; // Total volume in kg
  workoutCount: number; // Number of workouts
  isToday: boolean;
}

interface WeeklyActivityChartProps {
  weekData: DayActivityData[];
  title?: string;
}

export default function WeeklyActivityChart({
  weekData,
  title = 'This Week',
}: WeeklyActivityChartProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const maxVolume = Math.max(...weekData.map(d => d.volume), 1);
  const chartHeight = 180;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.chartContainer}>
        <View style={styles.barsRow}>
          {weekData.map((day, index) => {
            const heightPercentage = day.volume > 0 ? (day.volume / maxVolume) * 0.85 : 0.05;
            const barHeight = chartHeight * heightPercentage;
            const hasWorkout = day.workoutCount > 0;

            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  {hasWorkout ? (
                    <LinearGradient
                      colors={[colors.purpleLight, colors.purple]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={[
                        styles.bar,
                        { height: barHeight },
                        day.isToday && styles.todayBar,
                      ]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.bar,
                        styles.emptyBar,
                        { height: barHeight },
                        day.isToday && styles.todayBar,
                      ]}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Custom day labels */}
      <View style={styles.labelsContainer}>
        {weekData.map((day, index) => (
          <View key={index} style={styles.labelColumn}>
            <Text style={[styles.dayLabel, day.isToday && styles.todayLabel]}>
              {day.day}
            </Text>
            <Text style={[styles.dateLabel, day.isToday && styles.todayLabel]}>
              {day.date}
            </Text>
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
  title: {
    ...typography.title2,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  chartContainer: {
    height: 180,
    marginBottom: spacing.sm,
    justifyContent: 'flex-end',
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
    paddingHorizontal: spacing.md,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barWrapper: {
    width: 24,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  emptyBar: {
    backgroundColor: colors.border,
  },
  todayBar: {
    borderWidth: 2,
    borderColor: colors.teal,
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
  },
  labelColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dateLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
  todayLabel: {
    color: colors.teal,
  },
});
