import React from 'react';
import { View, Text, StyleSheet, FlatList, SectionList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts';
import { useAuth } from '../contexts/AuthContext';
import type { ExerciseListScreenProps } from '../navigation/types';
import {
  SearchBar,
  CategoryFilterChips,
  ExerciseListItem,
  LoadingState,
  EmptyState,
} from '../components';
import { useExerciseSearch } from '../hooks';
import { typography, spacing ,  type ThemeColors } from '../constants/theme';
import type { Exercise } from '../services/types';

export default function ExerciseListScreen({ navigation }: ExerciseListScreenProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

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

  const handleExercisePress = (exerciseId: string) => {
    navigation.navigate('ExerciseDetailScreen', { exerciseId });
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
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.textPrimary }]} accessibilityRole="header">Exercise Library</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Browse and discover exercises
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.purple }]}
              onPress={() => navigation.navigate('CreateExerciseScreen')}
              accessibilityRole="button"
              accessibilityLabel="Create custom exercise"
            >
              <Ionicons name="add" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchSection}>
          <SearchBar value={searchText} onChangeText={setSearchText} />
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
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Exercise Library</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Browse and discover exercises
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.purple }]}
            onPress={() => navigation.navigate('CreateExerciseScreen')}
            accessibilityRole="button"
            accessibilityLabel="Create custom exercise"
          >
            <Ionicons name="add" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchSection}>
        <SearchBar value={searchText} onChangeText={setSearchText} />
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
            onPress={() => handleExercisePress(item.id)}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            showFavoriteButton
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]} accessibilityRole="header">{title}</Text>
          </View>
        )}
        removeClippedSubviews={true}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    ...typography.largeTitle,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
