import React from 'react';
import { useTheme } from '../contexts';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, spacing, borderRadius ,  type ThemeColors } from '../constants/theme';
import { colorGlow } from '../utils';

interface MonthCalendarProps {
  year: number;
  month: number; // 0-11 (JavaScript month format)
  workoutDays: Set<string>; // Set of ISO date strings (YYYY-MM-DD)
  workoutCounts?: Map<string, number>; // Optional: number of workouts per day
  todayIndicatorColor?: string;
  workoutIndicatorColor?: string;
}

export default function MonthCalendar({
  year,
  month,
  workoutDays,
  workoutCounts,
  todayIndicatorColor,
  workoutIndicatorColor,
}: MonthCalendarProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const todayColor = todayIndicatorColor || colors.pink;
  const workoutColor = workoutIndicatorColor || colors.teal;
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday

  // Build calendar grid
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  // Fill empty cells before first day
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null);
  }

  // Fill days of month
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill remaining cells in last week
  while (currentWeek.length > 0 && currentWeek.length < 7) {
    currentWeek.push(null);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Helper to check if a day has workouts
  const hasWorkout = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return workoutDays.has(dateStr);
  };

  // Helper to check if a day is today
  const isToday = (day: number) => {
    return isCurrentMonth && day === todayDate;
  };

  const getWorkoutCount = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return workoutCounts?.get(dateStr) || 0;
  };

  const renderDay = (day: number | null, index: number) => {
    if (day === null) {
      return <View key={`empty-${index}`} style={styles.dayCell} />;
    }

    const workout = hasWorkout(day);
    const today = isToday(day);
    const count = getWorkoutCount(day);

    return (
      <View key={day} style={styles.dayCell}>
        {/* Glowing ring for workout days (also shown on today if workout exists) */}
        {workout && (
          <View style={[styles.workoutRing, { borderColor: workoutColor }]}>
            <View style={[styles.workoutGlow, { backgroundColor: workoutColor }]} />
          </View>
        )}

        {/* Pink solid circle for today (smaller if also a workout day, so teal ring shows) */}
        {today && (
          <View style={[
            styles.todayCircle,
            { backgroundColor: todayColor },
            workout && styles.todayCircleWithWorkout,
            colorGlow(todayColor, 'sm'),
          ]} />
        )}

        {/* Day number */}
        <View style={styles.dayContent}>
          <Text
            style={[
              styles.dayText,
              (workout || today) && styles.dayTextActive,
            ]}
          >
            {day}
          </Text>
        </View>

        {/* Multiple workout indicators (small dots) */}
        {count > 1 && (
          <View style={styles.multiWorkoutDots}>
            {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.workoutDot,
                  { backgroundColor: today ? '#fff' : workoutIndicatorColor },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((weekday, index) => (
          <View key={index} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{weekday}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((day, dayIndex) => renderDay(day, dayIndex))}
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    // Glassmorphism effect
    backgroundColor: colors.cardBackground, // Semi-transparent dark
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border, // Subtle border
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  weekdayText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  // Glowing ring for workout days
  workoutRing: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: borderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.full,
    opacity: 0.2,
  },
  // Today's solid circle
  todayCircle: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: borderRadius.full,
  },
  // Smaller today circle when overlapping with workout ring
  todayCircleWithWorkout: {
    width: '60%',
    height: '60%',
  },
  dayContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dayText: {
    ...typography.callout,
    color: colors.textSecondary,
    fontSize: 14,
  },
  dayTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  // Multiple workout indicator dots
  multiWorkoutDots: {
    position: 'absolute',
    bottom: 2,
    flexDirection: 'row',
    gap: 2,
  },
  workoutDot: {
    width: 3,
    height: 3,
    borderRadius: borderRadius.full,
  },
});
