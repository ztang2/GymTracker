import React, { useState, useCallback } from 'react';
import { useTheme } from '../contexts';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Path, Circle, Line as SvgLine, Rect } from 'react-native-svg';
import { typography, spacing, borderRadius ,  type ThemeColors } from '../constants/theme';
import { useWeightUnit } from '../hooks';

export interface WeekVolumeData {
  week: string; // Week label like "W1", "W2" or "Jan 6"
  volume: number; // Total volume in display unit
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
  const { unit } = useWeightUnit();
  const styles = createStyles(colors);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleDismiss = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handlePointPress = useCallback((index: number) => {
    setSelectedIndex(prev => (prev === index ? null : index));
  }, []);

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
                    ? `${(week.volume / 1000).toFixed(1)}k ${unit}`
                    : `${week.volume} ${unit}`}
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
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }

  // Show every nth label based on data length
  const labelInterval = data.length > 8 ? 2 : 1;

  // Tooltip positioning
  const selectedPoint = selectedIndex !== null ? points[selectedIndex] : null;
  const selectedWeek = selectedIndex !== null ? data[selectedIndex] : null;

  // Calculate tooltip position relative to chart container
  const tooltipLeft = selectedPoint
    ? Math.max(10, Math.min(selectedPoint.x - 50, chartWidth - 110))
    : 0;
  const tooltipAbove = selectedPoint ? selectedPoint.y > chartHeight / 2 : true;

  return (
    <Pressable onPress={handleDismiss} style={styles.container}>
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
            stroke={colors.purpleLight}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Tap targets (larger invisible rects) + visible dots */}
          {points.map((point, index) => {
            const isSelected = selectedIndex === index;
            return (
              <React.Fragment key={index}>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? colors.purpleLight : colors.purple}
                  stroke={isSelected ? colors.textPrimary : colors.purpleLight}
                  strokeWidth={isSelected ? 3 : 2}
                />
                {/* Invisible larger tap target */}
                <Rect
                  x={point.x - 16}
                  y={point.y - 16}
                  width={32}
                  height={32}
                  fill="transparent"
                  onPress={() => handlePointPress(index)}
                />
              </React.Fragment>
            );
          })}
        </Svg>

        {/* Tooltip overlay */}
        {selectedPoint !== null && selectedWeek !== null && (
          <View style={[
            styles.tooltip,
            {
              left: tooltipLeft,
              ...(tooltipAbove ? { top: selectedPoint.y - 60 } : { top: selectedPoint.y + 14 }),
            },
          ]}>
            <Text style={styles.tooltipLabel}>{selectedWeek.week}</Text>
            <Text style={styles.tooltipValue}>
              {selectedWeek.volume >= 1000
                ? `${(selectedWeek.volume / 1000).toFixed(1)}k ${unit}`
                : `${selectedWeek.volume} ${unit}`}
            </Text>
          </View>
        )}
      </View>

      {/* Week labels */}
      <View style={styles.labelsContainer}>
        {data.map((week, index) => {
          if (index % labelInterval !== 0 && index !== data.length - 1) {
            return <View key={index} style={styles.labelSpacer} />;
          }
          return (
            <Text
              key={index}
              style={[
                styles.weekLabelBottom,
                selectedIndex === index && styles.selectedLabelText,
              ]}
            >
              {week.week}
            </Text>
          );
        })}
      </View>
    </Pressable>
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
  chartContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
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
  selectedLabelText: {
    color: colors.purpleLight,
    fontWeight: '600',
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
  tooltip: {
    position: 'absolute',
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.purpleLight,
    zIndex: 10,
    minWidth: 80,
  },
  tooltipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tooltipValue: {
    ...typography.headline,
    color: colors.textPrimary,
    marginTop: 2,
  },
});
