import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CartesianChart, Bar, PolarChart, Pie } from 'victory-native';
import { colors, typography, spacing, borderRadius, getCategoryColor } from '../constants/theme';
import { CategoryDistribution } from '../services/types';

interface CategoryChartProps {
  data: CategoryDistribution[];
  type?: 'pie' | 'bar';
  width?: number;
  height?: number;
  title?: string;
}

const CategoryChart: React.FC<CategoryChartProps> = ({
  data,
  type = 'pie',
  width = Dimensions.get('window').width - 40,
  height = 220,
  title,
}) => {
  // Format data with colors
  const formattedData = data.map((item) => {
    const categoryName = item.category.charAt(0).toUpperCase() + item.category.slice(1);
    return {
      category: categoryName,
      count: item.count,
      percentage: item.percentage,
      color: getCategoryColor(categoryName),
    };
  });

  // Format data for bar chart (needs x and y properties)
  const barData = formattedData.map((item, index) => ({
    x: index,
    y: item.count,
  }));

  // Format data for pie chart (needs label, value, and color keys)
  const pieData = formattedData.map((item) => ({
    label: item.category,
    value: item.count,
    color: item.color,
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

      {type === 'pie' ? (
        <View style={[styles.pieOuterContainer, { width, height }]}>
          <View style={styles.pieContainer}>
            {/* Pie Chart */}
            <View style={[styles.pieChart, { width: height * 0.7, height: height * 0.7 }]}>
              <PolarChart
                data={pieData}
                labelKey="label"
                valueKey="value"
                colorKey="color"
              >
                <Pie.Chart />
              </PolarChart>
            </View>

            {/* Legend */}
            <View style={styles.pieLegend}>
              {formattedData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.legendText}>{item.category}</Text>
                  <Text style={styles.legendValue}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <>
          <View style={[styles.chartContainer, { width, height }]}>
            <CartesianChart
              data={barData}
              xKey="x"
              yKeys={['y']}
              axisOptions={{
                lineColor: colors.border,
                labelColor: colors.textSecondary,
              }}
            >
              {({ points, chartBounds }) => (
                <Bar
                  points={points.y}
                  chartBounds={chartBounds}
                  color={colors.purpleLight}
                  roundedCorners={{ topLeft: 4, topRight: 4 }}
                  animate={{ type: 'timing', duration: 300 }}
                />
              )}
            </CartesianChart>
          </View>

          {/* Legend for bar chart */}
          <View style={styles.legend}>
            {formattedData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: item.color }]}
                />
                <Text style={styles.legendText}>{item.category}</Text>
                <Text style={styles.legendValue}>{item.percentage}%</Text>
              </View>
            ))}
          </View>
        </>
      )}
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
  pieOuterContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  chartContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  pieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  pieChart: {
    marginRight: spacing.md,
  },
  pieLegend: {
    flex: 1,
    justifyContent: 'center',
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
  legend: {
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  legendText: {
    ...typography.callout,
    flex: 1,
  },
  legendValue: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.purpleLight,
  },
});

export default CategoryChart;
