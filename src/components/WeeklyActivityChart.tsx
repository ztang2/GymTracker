import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts';
import { typography, spacing, borderRadius } from '../constants/theme';
import { colorGlow } from '../utils';

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

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const totalWorkouts = weekData.reduce((sum, day) => sum + day.workoutCount, 0);
  const totalVolume = weekData.reduce((sum, day) => sum + day.volume, 0);

  const handleBarPress = useCallback((index: number) => {
    setSelectedIndex(prev => (prev === index ? null : index));
  }, []);

  const handleDismiss = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const selectedDay = selectedIndex !== null ? weekData[selectedIndex] : null;

  return (
    <Pressable
      onPress={handleDismiss}
      style={styles.container}
      accessibilityLabel={`${title} activity chart: ${totalWorkouts} workouts, ${totalVolume} kilograms total volume`}
    >
      <Text style={styles.title} accessibilityRole="header">{title}</Text>

      {/* Tooltip */}
      {selectedDay !== null && selectedIndex !== null && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipDay}>{selectedDay.day} {selectedDay.date}</Text>
          <Text style={styles.tooltipValue}>
            {selectedDay.volume > 0
              ? `${selectedDay.volume.toLocaleString()} kg`
              : 'Rest day'}
          </Text>
          {selectedDay.workoutCount > 0 && (
            <Text style={styles.tooltipSub}>
              {selectedDay.workoutCount} workout{selectedDay.workoutCount > 1 ? 's' : ''}
            </Text>
          )}
        </View>
      )}

      <View style={styles.chartContainer}>
        <View style={styles.barsRow}>
          {weekData.map((day, index) => {
            const heightPercentage = day.volume > 0 ? (day.volume / maxVolume) * 0.85 : 0.05;
            const barHeight = chartHeight * heightPercentage;
            const hasWorkout = day.workoutCount > 0;
            const isSelected = selectedIndex === index;

            return (
              <Pressable
                key={index}
                style={styles.barColumn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  handleBarPress(index);
                }}
                accessibilityLabel={`${day.day}: ${day.volume} kg, ${day.workoutCount} workouts`}
                accessibilityRole="button"
              >
                <View style={styles.barWrapper}>
                  {hasWorkout ? (
                    <LinearGradient
                      colors={[colors.purpleLight, colors.purple]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={[
                        styles.bar,
                        { height: barHeight },
                        day.isToday && [styles.todayBar, colorGlow(colors.teal, 'md')],
                        isSelected && styles.selectedBar,
                      ]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.bar,
                        styles.emptyBar,
                        { height: barHeight },
                        day.isToday && [styles.todayBar, colorGlow(colors.teal, 'md')],
                        isSelected && styles.selectedBar,
                      ]}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Custom day labels */}
      <View style={styles.labelsContainer}>
        {weekData.map((day, index) => (
          <View key={index} style={styles.labelColumn}>
            <Text style={[
              styles.dayLabel,
              day.isToday && styles.todayLabel,
              selectedIndex === index && styles.selectedLabel,
            ]}>
              {day.day}
            </Text>
            <Text style={[
              styles.dateLabel,
              day.isToday && styles.todayLabel,
              selectedIndex === index && styles.selectedLabel,
            ]}>
              {day.date}
            </Text>
          </View>
        ))}
      </View>
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
  },
  selectedBar: {
    opacity: 0.85,
    borderWidth: 2,
    borderColor: colors.purpleLight,
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
  selectedLabel: {
    color: colors.purpleLight,
  },
  tooltip: {
    position: 'absolute',
    top: spacing.xl + 28, // below title
    right: spacing.xl,
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.purpleLight,
    zIndex: 10,
    minWidth: 100,
  },
  tooltipDay: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tooltipValue: {
    ...typography.headline,
    color: colors.textPrimary,
    marginTop: 2,
  },
  tooltipSub: {
    ...typography.caption2,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
