import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllExercises, type Exercise, type ExerciseCategory } from '../services';
import { typography, spacing, borderRadius ,  type ThemeColors } from '../constants/theme';

interface ExerciseSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
  topInset: number;
}

const CATEGORIES: ExerciseCategory[] = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
  'core',
  'cardio',
];

const getCategoryDisplayName = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

// Cross-platform alert helper
const showAlert = (
  title: string,
  message: string,
  buttons: Array<{ text: string; onPress?: () => void }>
) => {
  if (typeof window !== 'undefined' && window.alert) {
    window.alert(`${title}\n\n${message}`);
    buttons[0]?.onPress?.();
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message, buttons);
  }
};

export const ExerciseSelectionModal: React.FC<ExerciseSelectionModalProps> = ({
  visible,
  onClose,
  onSelectExercise,
  topInset,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
  const [loadingExercises, setLoadingExercises] = useState(false);

  // Load exercises when modal opens
  useEffect(() => {
    if (visible && allExercises.length === 0) {
      loadExercises();
    }
  }, [visible]);

  // Filter exercises based on search and category
  useEffect(() => {
    let filtered = allExercises;

    if (selectedCategory) {
      filtered = filtered.filter((ex) => ex.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((ex) => ex.name.toLowerCase().includes(query));
    }

    setFilteredExercises(filtered);
  }, [allExercises, searchQuery, selectedCategory]);

  const loadExercises = async () => {
    setLoadingExercises(true);
    try {
      const data = await getAllExercises();
      setAllExercises(data);
      setFilteredExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
      showAlert('Error', 'Failed to load exercises. Please try again.', [
        { text: 'OK' },
      ]);
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleSelectExercise = (exercise: Exercise) => {
    onSelectExercise(exercise);
    // Reset state when closing
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const handleClose = () => {
    onClose();
    // Reset state when closing
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseListItem}
      onPress={() => handleSelectExercise(item)}
      accessibilityRole="button"
      accessibilityLabel={`Add ${item.name}, ${getCategoryDisplayName(item.category)} exercise`}
    >
      <View>
        <Text style={styles.exerciseListName}>{item.name}</Text>
        <Text style={styles.exerciseListCategory}>
          {getCategoryDisplayName(item.category)}
        </Text>
      </View>
      <Ionicons name="add-circle" size={24} color={colors.teal} />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.modalContainer, { paddingTop: topInset }]}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle} accessibilityRole="header">Add Exercise</Text>
          <View style={{ width: 60 }} accessible={false} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textTertiary} accessible={false} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search exercises"
            accessibilityHint="Enter exercise name to search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !selectedCategory && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(null)}
            accessibilityRole="button"
            accessibilityLabel="All categories"
            accessibilityState={{ selected: !selectedCategory }}
          >
            <Text
              style={[
                styles.categoryChipText,
                !selectedCategory && styles.categoryChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() =>
                setSelectedCategory(selectedCategory === category ? null : category)
              }
              accessibilityRole="button"
              accessibilityLabel={`${getCategoryDisplayName(category)} category`}
              accessibilityState={{ selected: selectedCategory === category }}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {getCategoryDisplayName(category)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Exercise List */}
        {loadingExercises ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading exercises...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            renderItem={renderExerciseItem}
            contentContainerStyle={styles.exerciseList}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No exercises found</Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: {
    ...typography.body,
    color: colors.teal,
  },
  modalTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  categoryScroll: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    flexGrow: 0,
    flexShrink: 0,
  },
  categoryContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 36,
  },
  categoryChipActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  categoryChipText: {
    ...typography.callout,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  categoryChipTextActive: {
    color: colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
  },
  exerciseList: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  exerciseListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  exerciseListName: {
    ...typography.body,
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
  exerciseListCategory: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  noResultsText: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
  },
});
