import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts';
import { spacing, borderRadius, typography, getCategoryColor ,  type ThemeColors } from '../constants/theme';
import type { Exercise } from '../services/types';

interface ExerciseListItemProps {
  exercise: Exercise;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  showFavoriteButton?: boolean;
}

function ExerciseListItemInner({
  exercise,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  showFavoriteButton = false,
}: ExerciseListItemProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const categoryColor = getCategoryColor(exercise.category);

  const handleFavoritePress = (e: { stopPropagation: () => void }) => {
    e.stopPropagation(); // Prevent triggering the card press
    onToggleFavorite?.();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${exercise.name}, ${exercise.category} exercise`}
      accessibilityHint="View exercise details"
    >
      {/* Left: Category indicator */}
      <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />

      {/* Middle: Exercise info */}
      <View style={styles.content}>
        <Text style={styles.exerciseName} numberOfLines={1}>
          {exercise.name}
        </Text>
        <Text style={styles.categoryText}>
          {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}
        </Text>
      </View>

      {/* Right: Favorite button (optional) */}
      {showFavoriteButton && (
        <TouchableOpacity
          onPress={handleFavoritePress}
          style={styles.favoriteButton}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          accessibilityState={{ selected: isFavorite }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? colors.pink : colors.textTertiary}
          />
        </TouchableOpacity>
      )}

      {/* Right: Chevron (when no favorite button) */}
      {!showFavoriteButton && (
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

const ExerciseListItem = React.memo(ExerciseListItemInner);
export default ExerciseListItem;

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  exerciseName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  categoryText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  favoriteButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});
