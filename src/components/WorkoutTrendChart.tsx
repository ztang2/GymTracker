import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

interface WorkoutTrendChartProps {
  data: Array<{ label: string; value: number }>;
  width?: number;
  height?: number;
  title?: string;
}

const WorkoutTrendChart: React.FC<WorkoutTrendChartProps> = ({
  data,
  width = Dimensions.get('window').width - 40,
  height = 220,
  title,
}) => {
  // Format data for chart-kit
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        data: data.map(d => d.value),
        color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`, // Purple gradient
        strokeWidth: 3,
      },
    ],
  };

  // Chart configuration for dark theme
  const chartConfig = {
    backgroundColor: colors.cardBackground,
    backgroundGradientFrom: colors.cardBackground,
    backgroundGradientTo: colors.cardBackground,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: {
      borderRadius: borderRadius.lg,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.border,
      strokeWidth: 1,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.purpleLight,
      fill: colors.cardBackground,
    },
  };

  // Handle empty data
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={[styles.emptyContainer, { width, height }]}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <LineChart
        data={chartData}
        width={width}
        height={height}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines
        withOuterLines
        withVerticalLabels
        withHorizontalLabels
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  title: {
    ...typography.headline,
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: borderRadius.lg,
  },
  emptyContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
});

export default WorkoutTrendChart;
