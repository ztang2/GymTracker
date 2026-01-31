import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts';
import { typography, spacing, borderRadius } from '../constants/theme';

export interface SummaryCardData {
  label: string;
  value: number | string;
  unit?: string;
  comparison: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
}

interface SummaryCardRowProps {
  cards: SummaryCardData[];
}

export default function SummaryCardRow({ cards }: SummaryCardRowProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'arrow-up';
      case 'down':
        return 'arrow-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return colors.green;
      case 'down':
        return colors.error;
      default:
        return colors.textTertiary;
    }
  };

  return (
    <View style={styles.container}>
      {cards.map((card, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.label}>{card.label}</Text>
          <View style={styles.valueRow}>
            <Text style={styles.value}>
              {card.value}
              {card.unit && <Text style={styles.unit}> {card.unit}</Text>}
            </Text>
          </View>
          <View style={styles.comparisonRow}>
            <Ionicons
              name={getTrendIcon(card.comparison.trend)}
              size={14}
              color={getTrendColor(card.comparison.trend)}
            />
            <Text style={[styles.comparisonText, { color: getTrendColor(card.comparison.trend) }]}>
              {card.comparison.value > 0 ? '+' : ''}{card.comparison.value}
            </Text>
            <Text style={styles.comparisonLabel}> vs last week</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.title,
    fontSize: 28,
  },
  unit: {
    ...typography.callout,
    color: colors.textSecondary,
    fontSize: 14,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonText: {
    ...typography.caption,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  comparisonLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
} as const);
