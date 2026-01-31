import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';

// Auth stack params
export type AuthStackParamList = {
  LoginScreen: undefined;
  SignUpScreen: undefined;
};

// Main bottom tab navigator params (FitTrack UI: Home, Calendar, Progress, Profile)
export type MainTabParamList = {
  HomeTab: undefined;
  CalendarTab: undefined;
  ProgressTab: undefined;
  ProfileTab: undefined;
};

// Home stack params (includes workout and exercise screens)
export type HomeStackParamList = {
  HomeScreen: undefined;
  WorkoutDetailScreen: { workoutId: string };
  WorkoutScreen: undefined;
  ActiveWorkoutScreen: undefined;
  ActiveWorkoutFromTemplateScreen: { templateId: string };
  ExerciseSelectionScreen: { workoutId: string };
  ExerciseListScreen: undefined;
  ExerciseDetailScreen: { exerciseId: string };
  GoalSettingScreen: undefined;
  TemplateListScreen: undefined;
  AchievementsScreen: undefined;
};

// Calendar stack params
export type CalendarStackParamList = {
  CalendarScreen: undefined;
};

// Progress stack params (renamed from Stats)
export type ProgressStackParamList = {
  ProgressScreen: undefined;
  ExerciseProgressScreen: { exerciseId: string; exerciseName?: string };
};

// Profile stack params
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  AchievementsScreen: undefined;
};

// Navigation prop types for each screen

// Home Stack Screens
export type HomeScreenProps = CompositeScreenProps<
  StackScreenProps<HomeStackParamList, 'HomeScreen'>,
  BottomTabScreenProps<MainTabParamList>
>;

export type WorkoutDetailScreenProps = StackScreenProps<
  HomeStackParamList,
  'WorkoutDetailScreen'
>;

export type WorkoutScreenProps = StackScreenProps<
  HomeStackParamList,
  'WorkoutScreen'
>;

export type ExerciseSelectionScreenProps = StackScreenProps<
  HomeStackParamList,
  'ExerciseSelectionScreen'
>;

export type ExerciseListScreenProps = StackScreenProps<
  HomeStackParamList,
  'ExerciseListScreen'
>;

export type ExerciseDetailScreenProps = StackScreenProps<
  HomeStackParamList,
  'ExerciseDetailScreen'
>;

export type ActiveWorkoutScreenProps = StackScreenProps<
  HomeStackParamList,
  'ActiveWorkoutScreen'
>;

export type ActiveWorkoutFromTemplateScreenProps = StackScreenProps<
  HomeStackParamList,
  'ActiveWorkoutFromTemplateScreen'
>;

export type GoalSettingScreenProps = StackScreenProps<
  HomeStackParamList,
  'GoalSettingScreen'
>;

export type TemplateListScreenProps = StackScreenProps<
  HomeStackParamList,
  'TemplateListScreen'
>;

export type AchievementsScreenProps = StackScreenProps<
  HomeStackParamList,
  'AchievementsScreen'
>;

// Calendar Stack Screens
export type CalendarScreenProps = CompositeScreenProps<
  StackScreenProps<CalendarStackParamList, 'CalendarScreen'>,
  BottomTabScreenProps<MainTabParamList>
>;

// Progress Stack Screens (renamed from Stats)
export type ProgressScreenProps = CompositeScreenProps<
  StackScreenProps<ProgressStackParamList, 'ProgressScreen'>,
  BottomTabScreenProps<MainTabParamList>
>;

export type ExerciseProgressScreenProps = StackScreenProps<
  ProgressStackParamList,
  'ExerciseProgressScreen'
>;

// Profile Stack Screens
export type ProfileScreenProps = CompositeScreenProps<
  StackScreenProps<ProfileStackParamList, 'ProfileScreen'>,
  BottomTabScreenProps<MainTabParamList>
>;

// Declare global navigation types for TypeScript
declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainTabParamList {}
  }
}
