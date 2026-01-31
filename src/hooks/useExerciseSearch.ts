import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAllExercises,
  getRecentExercises,
  type Exercise,
  type ExerciseCategory,
} from '../services';

const FAVORITES_KEY = '@fittrack/favorite_exercises';

export interface UseExerciseSearchOptions {
  userId?: string;
  initialCategory?: ExerciseCategory | 'all';
}

export interface UseExerciseSearchResult {
  // State
  searchText: string;
  selectedCategory: ExerciseCategory | 'all';
  exercises: Exercise[];
  recentExercises: Exercise[];
  favoriteExercises: Exercise[];
  loading: boolean;

  // Actions
  setSearchText: (text: string) => void;
  setSelectedCategory: (category: ExerciseCategory | 'all') => void;
  toggleFavorite: (exerciseId: string) => Promise<void>;
  isFavorite: (exerciseId: string) => boolean;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for exercise search and filtering
 * Provides search, category filtering, recent exercises, and favorites
 */
export function useExerciseSearch(
  options: UseExerciseSearchOptions = {}
): UseExerciseSearchResult {
  const { userId, initialCategory = 'all' } = options;

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>(initialCategory);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load favorites from AsyncStorage
  const loadFavorites = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        setFavoriteIds(new Set(ids));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  }, []);

  // Save favorites to AsyncStorage
  const saveFavorites = useCallback(async (ids: Set<string>) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(ids)));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (exerciseId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      saveFavorites(next);
      return next;
    });
  }, [saveFavorites]);

  // Check if exercise is favorite
  const isFavorite = useCallback((exerciseId: string) => {
    return favoriteIds.has(exerciseId);
  }, [favoriteIds]);

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [exercises, recent] = await Promise.all([
        getAllExercises(),
        userId ? getRecentExercises(userId, 10) : Promise.resolve([]),
        loadFavorites(),
      ]);

      setAllExercises(exercises);
      setRecentExercises(recent);
    } catch (error) {
      console.error('Failed to load exercise data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, loadFavorites]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter exercises based on search text and category
  const filteredExercises = allExercises.filter((exercise) => {
    // Category filter
    if (selectedCategory !== 'all' && exercise.category !== selectedCategory) {
      return false;
    }

    // Search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      return exercise.name.toLowerCase().includes(searchLower);
    }

    return true;
  });

  // Get favorite exercises
  const favoriteExercises = allExercises.filter((exercise) =>
    favoriteIds.has(exercise.id)
  );

  return {
    searchText,
    selectedCategory,
    exercises: filteredExercises,
    recentExercises,
    favoriteExercises,
    loading,
    setSearchText,
    setSelectedCategory,
    toggleFavorite,
    isFavorite,
    refresh: loadData,
  };
}
