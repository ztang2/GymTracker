import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../constants/theme';
import ProgressBar from './ProgressBar';

export interface Goal {
  title: string;
  current: number;
  target: number;
  color: string | readonly [string, string, ...string[]];
  unit?: string;
}

interface GoalProgressCardProps {
  goals: Goal[];
  title?: string;
}

export default function GoalProgressCard({
  goals,
  title = 'Monthly Goals',
}: GoalProgressCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.goalsContainer}>
        {goals.map((goal, index) => (
          <ProgressBar
            key={index}
            label={goal.title}
            current={goal.current}
            target={goal.target}
            color={goal.color}
            unit={goal.unit}
            showPercentage={false}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  title: {
    ...typography.title2,
    marginBottom: spacing.lg,
  },
  goalsContainer: {
    gap: spacing.md,
  },
});
