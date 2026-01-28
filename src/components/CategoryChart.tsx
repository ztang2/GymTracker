import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
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
  // Format data for pie chart
  const pieData = data.map((item, index) => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    count: item.count,
    color: getCategoryColor(item.category.charAt(0).toUpperCase() + item.category.slice(1)),
    legendFontColor: colors.textSecondary,
    legendFontSize: 12,
  }));

  // Format data for bar chart
  const barData = {
    labels: data.map(item => item.category.slice(0, 3).toUpperCase()),
    datasets: [
      {
        data: data.map(item => item.count),
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

      {type === 'pie' ? (
        <PieChart
          data={pieData}
          width={width}
          height={height}
          chartConfig={chartConfig}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          style={styles.chart}
        />
      ) : (
        <BarChart
          data={barData}
          width={width}
          height={height}
          chartConfig={chartConfig}
          yAxisLabel=""
          yAxisSuffix=""
          verticalLabelRotation={0}
          style={styles.chart}
          fromZero
          showBarTops={false}
          withInnerLines
        />
      )}

      {/* Legend for bar chart (pie chart has built-in legend) */}
      {type === 'bar' && (
        <View style={styles.legend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor: getCategoryColor(
                      item.category.charAt(0).toUpperCase() + item.category.slice(1)
                    ),
                  },
                ]}
              />
              <Text style={styles.legendText}>
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </Text>
              <Text style={styles.legendValue}>{item.percentage}%</Text>
            </View>
          ))}
        </View>
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
  chart: {
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
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
