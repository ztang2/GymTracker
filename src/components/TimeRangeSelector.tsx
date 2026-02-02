import React from 'react';
import { useTheme } from '../contexts';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, spacing, borderRadius } from '../constants/theme';
import { TimeRange } from '../services/types';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onSelectRange: (range: TimeRange) => void;
  ranges?: TimeRange[];
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedRange,
  onSelectRange,
  ranges = ['week', 'month', '3months', 'year', 'all'],
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const getRangeLabel = (range: TimeRange): string => {
    switch (range) {
      case 'week':
        return 'Week';
      case 'month':
        return 'Month';
      case '3months':
        return '3 Months';
      case 'year':
        return 'Year';
      case 'all':
        return 'All Time';
      default:
        return range;
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {ranges.map((range) => {
        const isSelected = range === selectedRange;

        return (
          <TouchableOpacity
            key={range}
            onPress={() => onSelectRange(range)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${getRangeLabel(range)} time range`}
            accessibilityState={{ selected: isSelected }}
          >
            {isSelected ? (
              <LinearGradient
                colors={colors.gradientPurplePink}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                <Text style={styles.selectedText}>{getRangeLabel(range)}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.button}>
                <Text style={styles.text}>{getRangeLabel(range)}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.xs,
  },
  text: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  selectedText: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

export default TimeRangeSelector;
