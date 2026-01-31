import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { CalendarScreenProps } from '../navigation/types';
import { getDailyWorkoutCounts, getCurrentStreak } from '../services/statsService';
import { MonthCalendar, LoadingState } from '../components';
import { typography, spacing, borderRadius } from '../constants/theme';
import { useAuth , useTheme } from '../contexts';

export default function CalendarScreen({ navigation }: CalendarScreenProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workoutDays, setWorkoutDays] = useState<Set<string>>(new Set());
  const [workoutCounts, setWorkoutCounts] = useState<Map<string, number>>(new Map());
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      // Get date range for the last year to include all workout days
      // Use local date formatting to avoid UTC timezone shift
      const now = new Date();
      const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
      const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;

      const [dailyCounts, streak] = await Promise.all([
        getDailyWorkoutCounts(user!.id, startDateStr, endDate),
        getCurrentStreak(user!.id),
      ]);

      // Convert dailyCounts to Set of ISO date strings and Map for counts
      const workoutDaysSet = new Set<string>(
        dailyCounts.filter(day => day.count > 0).map(day => day.date)
      );

      const countsMap = new Map<string, number>();
      dailyCounts.forEach(day => {
        if (day.count > 0) {
          countsMap.set(day.date, day.count);
        }
      });

      setWorkoutDays(workoutDaysSet);
      setWorkoutCounts(countsMap);
      setCurrentStreak(streak);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (loading) {
    return <LoadingState />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <Text style={styles.subtitle}>Track your consistency</Text>
      </View>

      {/* Month Navigation */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{monthName}</Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <MonthCalendar
          year={selectedDate.getFullYear()}
          month={selectedDate.getMonth()}
          workoutDays={workoutDays}
          workoutCounts={workoutCounts}
          todayIndicatorColor={colors.pink}
          workoutIndicatorColor={colors.teal}
        />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.pink }]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.teal }]} />
          <Text style={styles.legendText}>Workout Day</Text>
        </View>
      </View>

      {/* Current Streak Card */}
      <View style={styles.streakContainer}>
        <LinearGradient
          colors={colors.gradientOrange}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.streakCard}
        >
          <View style={styles.streakContent}>
            <View>
              <Text style={styles.streakLabel}>Current Streak</Text>
              <View style={styles.streakValueRow}>
                <Text style={styles.streakValue}>{currentStreak}</Text>
                <Text style={styles.streakUnit}>days</Text>
              </View>
              {currentStreak > 0 && (
                <Text style={styles.streakMessage}>
                  {currentStreak >= 7 ? 'Amazing! 🔥' : 'Keep it up! 💪'}
                </Text>
              )}
            </View>
            {/* Flame icon */}
            <View style={styles.streakIcon}>
              <Ionicons name="flame" size={48} color="rgba(255, 255, 255, 0.3)" />
            </View>
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.largeTitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  monthText: {
    ...typography.title2,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  calendarContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xxl,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  streakContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  streakCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  streakContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakIcon: {
    opacity: 0.3,
  },
  streakLabel: {
    ...typography.headline,
    color: '#FFFFFF',  // Always white on gradient backgrounds
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  streakValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  streakValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',  // Always white on gradient backgrounds
  },
  streakUnit: {
    ...typography.title2,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  streakMessage: {
    ...typography.callout,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
