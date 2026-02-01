import React from 'react';
import { useTheme } from '../contexts';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { typography, spacing, borderRadius, getCategoryColor } from '../constants/theme';
import { ExerciseFrequency } from '../services/types';

interface ExerciseFrequencyListProps {
  exercises: ExerciseFrequency[];
  onExercisePress: (exerciseId: string) => void;
  title?: string;
}

const ExerciseFrequencyList: React.FC<ExerciseFrequencyListProps> = ({
  exercises,
  onExercisePress,
  title,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const renderItem = ({ item, index }: { item: ExerciseFrequency; index: number }) => {
    const categoryColor = getCategoryColor(
      item.category.charAt(0).toUpperCase() + item.category.slice(1)
    );

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => onExercisePress(item.exercise_id)}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          <View style={styles.leftContent}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <View style={styles.info}>
              <Text style={styles.exerciseName}>{item.exercise_name}</Text>
              <View style={styles.row}>
                <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                  <Text style={styles.categoryText}>
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </Text>
                </View>
                <Text style={styles.count}>{item.count} times</Text>
              </View>
            </View>
          </View>

          <View style={styles.chevron}>
            <Text style={styles.chevronText}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (exercises.length === 0) {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No exercises found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <FlatList
        data={exercises}
        renderItem={renderItem}
        keyExtractor={(item) => item.exercise_id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  item: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rank: {
    ...typography.headline,
    fontSize: 20,
    color: colors.purpleLight,
    marginRight: spacing.md,
    minWidth: 32,
  },
  info: {
    flex: 1,
  },
  exerciseName: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  categoryText: {
    ...typography.caption2,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 10,
  },
  count: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  chevronText: {
    fontSize: 24,
    color: colors.textMuted,
  },
  separator: {
    height: spacing.sm,
  },
  emptyContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
});

export default ExerciseFrequencyList;
