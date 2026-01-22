import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';

// Main bottom tab navigator params
export type MainTabParamList = {
  HomeTab: undefined;
  WorkoutTab: undefined;
  ExercisesTab: undefined;
};

// Home stack params
export type HomeStackParamList = {
  HomeScreen: undefined;
  WorkoutDetailScreen: { workoutId: string };
};

// Workout stack params
export type WorkoutStackParamList = {
  WorkoutScreen: undefined;
  ExerciseSelectionScreen: { workoutId: string };
};

// Exercises stack params
export type ExercisesStackParamList = {
  ExerciseListScreen: undefined;
  ExerciseDetailScreen: { exerciseId: string };
};

// Navigation prop types for each screen
export type HomeScreenProps = CompositeScreenProps<
  StackScreenProps<HomeStackParamList, 'HomeScreen'>,
  BottomTabScreenProps<MainTabParamList>
>;

export type WorkoutDetailScreenProps = StackScreenProps<
  HomeStackParamList,
  'WorkoutDetailScreen'
>;

export type WorkoutScreenProps = CompositeScreenProps<
  StackScreenProps<WorkoutStackParamList, 'WorkoutScreen'>,
  BottomTabScreenProps<MainTabParamList>
>;

export type ExerciseSelectionScreenProps = StackScreenProps<
  WorkoutStackParamList,
  'ExerciseSelectionScreen'
>;

export type ExerciseListScreenProps = CompositeScreenProps<
  StackScreenProps<ExercisesStackParamList, 'ExerciseListScreen'>,
  BottomTabScreenProps<MainTabParamList>
>;

export type ExerciseDetailScreenProps = StackScreenProps<
  ExercisesStackParamList,
  'ExerciseDetailScreen'
>;

// Declare global navigation types for TypeScript
declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainTabParamList {}
  }
}
