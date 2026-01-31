import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CartesianChart, Bar } from 'victory-native';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

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
  // Format data for victory-native
  const chartData = weekData.map((day, index) => ({
    x: index,
    y: day.volume || 0.1, // Minimum value to show empty bars
    label: day.day,
    date: day.date,
    hasWorkout: day.workoutCount > 0,
    isToday: day.isToday,
  }));

  const maxVolume = Math.max(...weekData.map(d => d.volume), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.chartContainer}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={['y']}
          domainPadding={{ left: 20, right: 20, top: 20, bottom: 20 }}
          axisOptions={{
            labelColor: colors.textSecondary,
            formatYLabel: (value) => `${Math.round(value)}`,
            formatXLabel: () => '', // We'll draw custom labels below
            lineColor: colors.border,
            lineWidth: 0,
          }}
        >
          {({ points, chartBounds }) => (
            <Bar
              points={points.y}
              chartBounds={chartBounds}
              color={colors.purpleLight}
              roundedCorners={{ topLeft: 4, topRight: 4 }}
              animate={{ type: 'timing', duration: 300 }}
              barWidth={24}
            />
          )}
        </CartesianChart>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(26, 26, 26, 0.6)',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    ...typography.title2,
    marginBottom: spacing.lg,
  },
  chartContainer: {
    height: 180,
    marginBottom: spacing.sm,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
  },
  labelColumn: {
    alignItems: 'center',
  },
  dayLabel: {
    ...typography.caption,
    fontWeight: '600',
  },
  dateLabel: {
    ...typography.caption2,
  },
  todayLabel: {
    color: colors.teal,
  },
});
