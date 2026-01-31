import React from 'react';
import { useTheme } from '../contexts';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line as SvgLine } from 'react-native-svg';
import { typography, spacing, borderRadius } from '../constants/theme';

export interface WeekVolumeData {
  week: string; // Week label like "W1", "W2" or "Jan 6"
  volume: number; // Total volume in kg
  weekNumber: number; // For x-axis positioning
}

interface VolumeTrendChartProps {
  data: WeekVolumeData[];
  title?: string;
}

export default function VolumeTrendChart({
  data,
  title = 'Volume Trend',
}: VolumeTrendChartProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  // Handle empty data
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No volume data yet</Text>
          <Text style={styles.emptySubtext}>Keep lifting to see your progress!</Text>
        </View>
      </View>
    );
  }

  // Handle insufficient data (< 2 points)
  if (data.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.listContainer}>
          {data.map((week, index) => {
            const barWidth = week.volume > 0 ? Math.min((week.volume / 10000) * 100, 100) : 0;
            return (
              <View key={index} style={styles.weekRow}>
                <Text style={styles.weekLabel}>{week.week}</Text>
                <View style={styles.barContainer}>
                  <View style={[styles.horizontalBar, { width: `${barWidth}%` }]} />
                </View>
                <Text style={styles.volumeText}>
                  {week.volume >= 1000
                    ? `${(week.volume / 1000).toFixed(1)}k kg`
                    : `${week.volume} kg`}
                </Text>
              </View>
            );
          })}
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
  const maxVolume = Math.max(...data.map(d => d.volume), 1);
  const minVolume = Math.min(...data.map(d => d.volume), 0);
  const volumeRange = maxVolume - minVolume || 1;

  // Convert data to SVG points
  const points = data.map((week, index) => {
    const x = padding.left + (index / (data.length - 1)) * plotWidth;
    const y = padding.top + plotHeight - ((week.volume - minVolume) / volumeRange) * plotHeight;
    return { x, y, volume: week.volume };
  });

  // Create SVG path
  let pathData = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    // Simple line segments (no curves for simplicity)
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }

  // Show every nth label based on data length
  const labelInterval = data.length > 8 ? 2 : 1;

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
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
              />
            );
          })}

          {/* Line path */}
          <Path
            d={pathData}
            stroke={colors.purpleLight}
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
              stroke={colors.purpleLight}
              strokeWidth={2}
            />
          ))}
        </Svg>
      </View>

      {/* Week labels */}
      <View style={styles.labelsContainer}>
        {data.map((week, index) => {
          // Show every nth label to avoid crowding
          if (index % labelInterval !== 0 && index !== data.length - 1) {
            return <View key={index} style={styles.labelSpacer} />;
          }
          return (
            <Text key={index} style={styles.weekLabelBottom}>
              {week.week}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
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
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  labelSpacer: {
    flex: 1,
  },
  weekLabelBottom: {
    ...typography.caption2,
    color: colors.textTertiary,
    flex: 1,
    textAlign: 'center',
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
  listContainer: {
    paddingVertical: spacing.md,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  weekLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 60,
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  horizontalBar: {
    height: '100%',
    backgroundColor: colors.purpleLight,
    borderRadius: 4,
  },
  volumeText: {
    ...typography.caption,
    color: colors.textPrimary,
    width: 70,
    textAlign: 'right',
  },
});
