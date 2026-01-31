import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

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
  // Format data for victory-native
  const chartData = data.map((week, index) => ({
    x: index,
    y: week.volume,
    label: week.week,
  }));

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

  const maxVolume = Math.max(...data.map(d => d.volume), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.chartContainer}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={['y']}
          domainPadding={{ left: 10, right: 10, top: 20, bottom: 10 }}
          axisOptions={{
            labelColor: colors.textSecondary,
            formatYLabel: (value) => `${(value / 1000).toFixed(0)}k`,
            formatXLabel: () => '', // Custom labels below
            lineColor: colors.border,
            lineWidth: 0.5,
          }}
        >
          {({ points }) => (
            <Line
              points={points.y}
              color={colors.purpleLight}
              strokeWidth={3}
              curveType="natural"
              animate={{ type: 'timing', duration: 300 }}
            />
          )}
        </CartesianChart>
      </View>

      {/* Week labels */}
      <View style={styles.labelsContainer}>
        {data.map((week, index) => {
          // Show every 2nd label if more than 8 weeks
          if (data.length > 8 && index % 2 !== 0) return null;
          return (
            <Text key={index} style={styles.weekLabel}>
              {week.week}
            </Text>
          );
        })}
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  weekLabel: {
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
});
