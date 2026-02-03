import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line as SvgLine } from 'react-native-svg';
import { useTheme } from '../contexts';
import { typography, spacing, borderRadius ,  type ThemeColors } from '../constants/theme';

export interface ProgressChartDataPoint {
  date: string; // YYYY-MM-DD or any date string
  value: number;
}

interface ExerciseProgressChartProps {
  data: ProgressChartDataPoint[];
  title: string;
  unit: string; // e.g., "kg", "reps", "volume"
  color?: string; // Line color (defaults to theme purple)
}

export default function ExerciseProgressChart({
  data,
  title,
  unit,
  color,
}: ExerciseProgressChartProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const lineColor = color || colors.purpleLight;

  // Handle empty data
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data yet</Text>
          <Text style={styles.emptySubtext}>Start logging this exercise!</Text>
        </View>
      </View>
    );
  }

  // Handle single data point
  if (data.length === 1) {
    const point = data[0];
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.singlePointContainer}>
          <View style={[styles.singlePointDot, { backgroundColor: lineColor }]} />
          <View style={styles.singlePointInfo}>
            <Text style={styles.singlePointValue}>
              {point.value.toFixed(unit === 'reps' ? 0 : 1)} {unit}
            </Text>
            <Text style={styles.singlePointDate}>
              {formatDateLabel(point.date)}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const chartWidth = 320;
  const chartHeight = 150;
  const padding = { top: 20, right: 10, bottom: 10, left: 10 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Calculate scales
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const valueRange = maxValue - minValue || 1;

  // Convert data to SVG points
  const points = data.map((point, index) => {
    const x = padding.left + (index / (data.length - 1)) * plotWidth;
    const y = padding.top + plotHeight - ((point.value - minValue) / valueRange) * plotHeight;
    return { x, y, value: point.value };
  });

  // Create SVG path
  let pathData = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }

  // Show every nth label based on data length
  const labelInterval = data.length > 8 ? Math.ceil(data.length / 6) : 1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((fraction, i) => {
            const y = padding.top + plotHeight * (1 - fraction);
            return (
              <SvgLine
                key={i}
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke={colors.border}
                strokeWidth="1"
              />
            );
          })}

          {/* Line path */}
          <Path
            d={pathData}
            stroke={lineColor}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={colors.purple}
              stroke={lineColor}
              strokeWidth={2}
            />
          ))}
        </Svg>
      </View>

      {/* Date labels */}
      <View style={styles.labelsContainer}>
        {data.map((point, index) => {
          // Show every nth label to avoid crowding
          if (index % labelInterval !== 0 && index !== data.length - 1) {
            return <View key={index} style={styles.labelSpacer} />;
          }
          return (
            <Text key={index} style={styles.dateLabel}>
              {formatDateLabel(point.date)}
            </Text>
          );
        })}
      </View>

      {/* Value range info */}
      <View style={styles.rangeInfo}>
        <Text style={styles.rangeText}>
          Min: {minValue.toFixed(unit === 'reps' ? 0 : 1)} {unit}
        </Text>
        <Text style={styles.rangeText}>
          Max: {maxValue.toFixed(unit === 'reps' ? 0 : 1)} {unit}
        </Text>
      </View>
    </View>
  );
}

/**
 * Format date for axis labels (e.g., "Jan 15" or "1/15")
 */
function formatDateLabel(dateStr: string): string {
  // If already formatted (e.g., "W1"), return as-is
  if (dateStr.length <= 4) return dateStr;
  
  // Extract month and day from YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    return `${month}/${day}`;
  }
  
  // Fallback: return last 5 chars (MM-DD)
  return dateStr.substring(5);
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
  chartContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  labelSpacer: {
    flex: 1,
  },
  dateLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
    flex: 1,
    textAlign: 'center',
  },
  rangeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
  },
  rangeText: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
  emptyContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  singlePointContainer: {
    height: 180,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  singlePointDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  singlePointInfo: {
    alignItems: 'flex-start',
  },
  singlePointValue: {
    ...typography.title,
    color: colors.textPrimary,
  },
  singlePointDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
