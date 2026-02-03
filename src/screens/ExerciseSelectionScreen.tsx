import React from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';
import { useTheme } from '../contexts';
import { useAuth } from '../contexts/AuthContext';
import type { ExerciseSelectionScreenProps } from '../navigation/types';
import {
  SearchBar,
  CategoryFilterChips,
  ExerciseListItem,
  LoadingState,
  EmptyState,
} from '../components';
import { useExerciseSearch } from '../hooks';
import { addExerciseToWorkout } from '../services';
import { typography, spacing ,  type ThemeColors } from '../constants/theme';
import type { Exercise } from '../services/types';

export default function ExerciseSelectionScreen({
  route,
  navigation,
}: ExerciseSelectionScreenProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { workoutId } = route.params;

  const {
    searchText,
    selectedCategory,
    exercises,
    recentExercises,
    favoriteExercises,
    loading,
    setSearchText,
    setSelectedCategory,
    toggleFavorite,
    isFavorite,
  } = useExerciseSearch({ userId: user?.id });

  const selectExercise = async (exerciseId: string) => {
    try {
      // Get the current order index (last position)
      const orderIndex = 0; // Will be handled by the service if needed
      await addExerciseToWorkout(workoutId, exerciseId, orderIndex);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to add exercise:', error);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  // Build sections for the list
  const sections: Array<{ title: string; data: Exercise[] }> = [];

  // Show favorites section if there are favorites and no search/filter applied
  if (favoriteExercises.length > 0 && !searchText && selectedCategory === 'all') {
    sections.push({ title: 'Favorites', data: favoriteExercises });
  }

  // Show recent section if there are recent exercises and no search/filter applied
  if (recentExercises.length > 0 && !searchText && selectedCategory === 'all') {
    sections.push({ title: 'Recently Used', data: recentExercises });
  }

  // Show all exercises section
  if (exercises.length > 0) {
    const sectionTitle =
      searchText || selectedCategory !== 'all' ? 'Results' : 'All Exercises';
    sections.push({ title: sectionTitle, data: exercises });
  }

  // Empty state
  if (sections.length === 0 || exercises.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Add Exercise</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select an exercise to add to your workout
          </Text>
        </View>

        <View style={styles.searchSection}>
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search exercises..."
          />
        </View>

        <View style={styles.filterSection}>
          <CategoryFilterChips
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>

        <EmptyState
          title="No exercises found"
          message={
            searchText
              ? `No exercises match "${searchText}"`
              : 'Try adjusting your filters'
          }
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchText('');
            setSelectedCategory('all');
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Add Exercise</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Select an exercise to add to your workout
        </Text>
      </View>

      <View style={styles.searchSection}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search exercises..."
        />
      </View>

      <View style={styles.filterSection}>
        <CategoryFilterChips
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExerciseListItem
            exercise={item}
            onPress={() => selectExercise(item.id)}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            showFavoriteButton
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.largeTitle,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
  },
  searchSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  filterSection: {
    paddingLeft: spacing.xl,
    marginBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.headline,
    fontWeight: '700',
  },
});
