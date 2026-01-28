import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Svg, { Rect, G, Text as SvgText } from 'react-native-svg';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { DayData } from '../services/types';
import { getDayOfWeek, isToday } from '../utils/dateUtils';

interface ContributionCalendarProps {
  data: DayData[];
  onDayPress?: (date: string) => void;
  currentStreak: number;
  longestStreak: number;
  colorScale?: string[];
  showMonthLabels?: boolean;
  showWeekdayLabels?: boolean;
}

const ContributionCalendar: React.FC<ContributionCalendarProps> = ({
  data,
  onDayPress,
  currentStreak,
  longestStreak,
  colorScale = [
    colors.calendarEmpty,
    colors.calendarLevel1,
    colors.calendarLevel2,
    colors.calendarLevel3,
  ],
  showMonthLabels = true,
  showWeekdayLabels = true,
}) => {
  // Constants for calendar layout
  const cellSize = 14;
  const cellSpacing = 3;
  const cellRadius = 4;
  const weekdayLabelWidth = 20;
  const monthLabelHeight = 20;

  // Get color based on workout count
  const getColor = (count: number): string => {
    if (count === 0) return colorScale[0];
    if (count === 1) return colorScale[1];
    if (count === 2) return colorScale[2];
    return colorScale[3];
  };

  // Group data by week
  const weeks: DayData[][] = [];
  let currentWeek: DayData[] = [];

  // Start with empty days if first day is not a Sunday
  if (data.length > 0) {
    const firstDate = new Date(data[0].date);
    const dayOfWeek = firstDate.getDay();

    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push({
        date: '',
        count: 0,
        totalDuration: 0,
        totalVolume: 0,
      });
    }
  }

  // Group data into weeks (Sunday to Saturday)
  data.forEach((day, index) => {
    currentWeek.push(day);

    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  // Add remaining days to last week
  if (currentWeek.length > 0) {
    // Fill remaining days with empty cells
    while (currentWeek.length < 7) {
      currentWeek.push({
        date: '',
        count: 0,
        totalDuration: 0,
        totalVolume: 0,
      });
    }
    weeks.push(currentWeek);
  }

  // Calculate SVG dimensions
  const svgWidth = weeks.length * (cellSize + cellSpacing) + (showWeekdayLabels ? weekdayLabelWidth : 0);
  const svgHeight = 7 * (cellSize + cellSpacing) + (showMonthLabels ? monthLabelHeight : 0);

  // Weekday labels
  const weekdayLabels = ['', 'M', '', 'W', '', 'F', ''];

  // Get month from week data
  const getMonthLabel = (weekData: DayData[]): string | null => {
    const validDay = weekData.find(d => d.date !== '');
    if (!validDay) return null;

    const date = new Date(validDay.date);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[date.getMonth()];
  };

  // Determine if this is the first week of a month
  const isFirstWeekOfMonth = (weekIndex: number): boolean => {
    if (weekIndex === 0) return true;

    const currentWeekMonth = getMonthLabel(weeks[weekIndex]);
    const prevWeekMonth = weekIndex > 0 ? getMonthLabel(weeks[weekIndex - 1]) : null;

    return currentWeekMonth !== prevWeekMonth;
  };

  return (
    <View style={styles.container}>
      <View style={styles.calendarCard}>
        <Text style={styles.title}>Workout Consistency</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
          <Svg width={svgWidth} height={svgHeight}>
            {/* Month labels */}
            {showMonthLabels && (
              <G>
                {weeks.map((week, weekIndex) => {
                  if (!isFirstWeekOfMonth(weekIndex)) return null;

                  const monthLabel = getMonthLabel(week);
                  if (!monthLabel) return null;

                  const x = weekIndex * (cellSize + cellSpacing) + (showWeekdayLabels ? weekdayLabelWidth : 0);

                  return (
                    <SvgText
                      key={`month-${weekIndex}`}
                      x={x}
                      y={15}
                      fill={colors.textSecondary}
                      fontSize={10}
                    >
                      {monthLabel}
                    </SvgText>
                  );
                })}
              </G>
            )}

            {/* Weekday labels */}
            {showWeekdayLabels && (
              <G>
                {weekdayLabels.map((label, dayIndex) => {
                  if (!label) return null;

                  const y = dayIndex * (cellSize + cellSpacing) + (showMonthLabels ? monthLabelHeight : 0) + cellSize;

                  return (
                    <SvgText
                      key={`day-${dayIndex}`}
                      x={10}
                      y={y}
                      fill={colors.textTertiary}
                      fontSize={10}
                      textAnchor="middle"
                    >
                      {label}
                    </SvgText>
                  );
                })}
              </G>
            )}

            {/* Calendar cells */}
            {weeks.map((week, weekIndex) => (
              <G key={`week-${weekIndex}`}>
                {week.map((day, dayIndex) => {
                  const x = weekIndex * (cellSize + cellSpacing) + (showWeekdayLabels ? weekdayLabelWidth : 0);
                  const y = dayIndex * (cellSize + cellSpacing) + (showMonthLabels ? monthLabelHeight : 0);

                  // Skip empty cells
                  if (!day.date) {
                    return null;
                  }

                  const fillColor = getColor(day.count);
                  const isCurrentDay = isToday(new Date(day.date));
                  const strokeColor = isCurrentDay ? colors.calendarToday : 'transparent';
                  const strokeWidth = isCurrentDay ? 2 : 0;

                  return (
                    <Rect
                      key={`cell-${weekIndex}-${dayIndex}`}
                      x={x}
                      y={y}
                      width={cellSize}
                      height={cellSize}
                      rx={cellRadius}
                      ry={cellRadius}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      onPress={() => onDayPress?.(day.date)}
                    />
                  );
                })}
              </G>
            ))}
          </Svg>
        </ScrollView>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendText}>Less</Text>
          {colorScale.map((color, index) => (
            <View
              key={`legend-${index}`}
              style={[styles.legendCell, { backgroundColor: color }]}
            />
          ))}
          <Text style={styles.legendText}>More</Text>
        </View>
      </View>

      {/* Streak Card */}
      <View style={styles.streakCard}>
        <View style={styles.streakItem}>
          <Text style={styles.streakValue}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Current Streak</Text>
        </View>
        <View style={styles.streakDivider} />
        <View style={styles.streakItem}>
          <Text style={styles.streakValue}>{longestStreak}</Text>
          <Text style={styles.streakLabel}>Longest Streak</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  calendarCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  title: {
    ...typography.headline,
    marginBottom: spacing.lg,
  },
  scrollView: {
    marginBottom: spacing.md,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
  legendText: {
    ...typography.caption2,
    marginHorizontal: spacing.xs,
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  streakCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginTop: spacing.md,
    justifyContent: 'space-around',
  },
  streakItem: {
    alignItems: 'center',
    flex: 1,
  },
  streakValue: {
    ...typography.statNumber,
    fontSize: 36,
    color: colors.orange,
  },
  streakLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  streakDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
});

export default ContributionCalendar;
