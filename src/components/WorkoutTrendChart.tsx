import React from 'react';
import { useTheme } from '../contexts';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { typography, spacing, borderRadius ,  type ThemeColors } from '../constants/theme';

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
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  // Format data for Victory Native (needs x and y properties)
  const chartData = data.map((item, index) => ({
    x: index,
    y: item.value,
  }));

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
      <View style={[styles.chartContainer, { width, height }]}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={['y']}
          axisOptions={{
            lineColor: colors.border,
            labelColor: colors.textSecondary,
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
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  chartContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
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
