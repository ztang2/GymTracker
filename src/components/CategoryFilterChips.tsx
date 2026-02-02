import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts';
import { spacing, borderRadius, typography } from '../constants/theme';
import type { ExerciseCategory } from '../services/types';

interface CategoryFilterChipsProps {
  selectedCategory: ExerciseCategory | 'all';
  onSelectCategory: (category: ExerciseCategory | 'all') => void;
}

const CATEGORIES: Array<{ value: ExerciseCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'legs', label: 'Legs' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'arms', label: 'Arms' },
  { value: 'core', label: 'Core' },
  { value: 'cardio', label: 'Cardio' },
];

export default function CategoryFilterChips({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterChipsProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((category) => {
        const isSelected = category.value === selectedCategory;
        return (
          <TouchableOpacity
            key={category.value}
            style={[
              styles.chip,
              isSelected && styles.chipSelected,
              { borderColor: isSelected ? colors.purple : colors.border },
            ]}
            onPress={() => onSelectCategory(category.value)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${category.label} category`}
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              style={[
                styles.chipText,
                { color: isSelected ? colors.purple : colors.textSecondary },
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: colors.purple + '15', // 15% opacity
  },
  chipText: {
    ...typography.callout,
    fontWeight: '600',
  },
});
