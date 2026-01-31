import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import type { ActiveWorkoutScreenProps } from '../navigation/types';
import {
  requestNotificationPermissions,
  getLastPerformance,
  getRestTimerSeconds,
  setRestTimerSeconds,
  isHapticFeedbackEnabled,
  awardXP,
  calculateWorkoutXP,
  checkAndAwardBadges,
  getCurrentStreak,
  type LastPerformance,
  type Exercise,
} from '../services';
import {
  saveWorkout,
  type ActiveWorkoutState,
} from '../services/workoutLogger';
import { useAuth } from '../contexts';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import {
  WorkoutSummaryModal,
  WorkoutHeader,
  RestTimerToast,
  ExerciseCard,
  ExerciseSelectionModal,
} from '../components';
import type { WorkoutSummary } from '../services/types';
import { useWorkoutTimer, useRestTimer, useWorkoutState } from '../hooks';

// Cross-platform alert helper
const showAlert = (
  title: string,
  message: string,
  buttons: Array<{
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
  }>
) => {
  if (Platform.OS === 'web') {
    // On web, use window.confirm for simple yes/no dialogs
    const confirmButton = buttons.find((b) => b.style !== 'cancel');
    const cancelButton = buttons.find((b) => b.style === 'cancel');

    if (confirmButton && cancelButton) {
      if (window.confirm(`${title}\n\n${message}`)) {
        confirmButton.onPress?.();
      }
    } else if (buttons.length === 1) {
      window.alert(`${title}\n\n${message}`);
      buttons[0].onPress?.();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

export default function ActiveWorkoutScreen({ navigation }: ActiveWorkoutScreenProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Workout state
  const [startTime] = useState(new Date());
  const {
    exercises,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    toggleSetComplete,
  } = useWorkoutState();

  // Timer hooks
  const elapsedSeconds = useWorkoutTimer(startTime);
  
  // Load rest timer duration from settings
  const [initialRestDuration, setInitialRestDuration] = useState(90);
  useEffect(() => {
    const loadRestDuration = async () => {
      const duration = await getRestTimerSeconds();
      setInitialRestDuration(duration);
    };
    loadRestDuration();
  }, []);

  const {
    restTimerVisible,
    restSeconds,
    restTimerDuration,
    startRestTimer,
    skipRestTimer,
    setRestTimerDuration,
  } = useRestTimer(initialRestDuration);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);

  // Rest timer options modal
  const [showRestTimerOptions, setShowRestTimerOptions] = useState(false);

  // Last performance data (previous weights)
  const [lastPerformanceData, setLastPerformanceData] = useState<
    Map<string, LastPerformance>
  >(new Map());

  // Settings
  const [hapticEnabled, setHapticEnabled] = useState(true);

  // Saving state
  const [saving, setSaving] = useState(false);

  // Workout summary modal state
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary | null>(null);

  // Hide tab bar when this screen is active
  useLayoutEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: { display: 'none' },
      });
    }

    return () => {
      // Restore tab bar when leaving
      if (parent) {
        parent.setOptions({
          tabBarStyle: {
            display: 'flex',
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        });
      }
    };
  }, [navigation]);

  // Request notification permissions and load settings on mount
  useEffect(() => {
    requestNotificationPermissions();
    loadSettings();
  }, []);

  // Load user settings from AsyncStorage
  const loadSettings = async () => {
    try {
      const haptic = await isHapticFeedbackEnabled();
      setHapticEnabled(haptic);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  // Fetch last performance data when an exercise is added
  const fetchLastPerformance = useCallback(async (exerciseId: string) => {
    if (!user) return;
    try {
      const perf = await getLastPerformance(user.id, exerciseId);
      if (perf) {
        setLastPerformanceData((prev) => {
          const newMap = new Map(prev);
          newMap.set(exerciseId, perf);
          return newMap;
        });
      }
    } catch (error) {
      console.error('Failed to fetch last performance:', error);
    }
  }, []);

  // Handle adding exercise
  const handleAddExercise = (exercise: Exercise) => {
    addExercise(exercise);
    setModalVisible(false);

    // Fetch last performance data for this exercise
    fetchLastPerformance(exercise.id);
  };

  // Handle removing exercise with confirmation
  const handleRemoveExercise = (exerciseLocalId: string) => {
    showAlert('Remove Exercise', 'Are you sure you want to remove this exercise?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeExercise(exerciseLocalId),
      },
    ]);
  };

  // Handle set completion with haptic feedback
  const handleToggleSetComplete = async (exerciseLocalId: string, setId: string) => {
    const justCompleted = toggleSetComplete(exerciseLocalId, setId);

    // Start rest timer and trigger haptic when a set is marked as complete
    if (justCompleted) {
      // Haptic feedback for satisfying set completion
      if (hapticEnabled && Platform.OS !== 'web') {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          console.log('Haptics not available');
        }
      }
      startRestTimer();
    }
  };

  // Handle rest timer duration change
  const handleRestTimerDurationChange = async (seconds: number) => {
    setRestTimerDuration(seconds);
    setShowRestTimerOptions(false);

    // Save to AsyncStorage
    await setRestTimerSeconds(seconds);
  };

  // Handle finish workout
  const handleFinishWorkout = async () => {
    // Check if there are any completed sets
    const hasCompletedSets = exercises.some((ex) =>
      ex.sets.some((set) => set.completed && set.reps > 0)
    );

    if (!hasCompletedSets) {
      showAlert(
        'No Completed Sets',
        'Please complete at least one set before finishing the workout.',
        [{ text: 'OK' }]
      );
      return;
    }

    showAlert('Finish Workout', 'Are you sure you want to finish this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        onPress: async () => {
          setSaving(true);
          try {
            const workoutState: ActiveWorkoutState = {
              exercises,
              startTime,
              notes: '',
            };

            await saveWorkout('test-user-123', workoutState);

            // Calculate workout summary
            const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
            let setCount = 0;
            let totalVolume = 0;
            let totalReps = 0;

            exercises.forEach((ex) => {
              ex.sets.forEach((set) => {
                if (set.completed && set.reps > 0) {
                  setCount++;
                  totalReps += set.reps;
                  totalVolume += set.reps * set.weight;
                }
              });
            });

            // Get current streak and calculate XP
            const currentStreak = await getCurrentStreak('test-user-123');
            const xpEarned = calculateWorkoutXP(setCount, currentStreak);

            // Award XP to user
            await awardXP('test-user-123', xpEarned);

            // Check and award any new badges
            const newBadges = await checkAndAwardBadges('test-user-123');

            const summary: WorkoutSummary = {
              duration,
              exerciseCount: exercises.filter((e) =>
                e.sets.some((s) => s.completed)
              ).length,
              setCount,
              totalVolume,
              totalReps,
              xpEarned,
              newPRs: [],
              newBadges: newBadges,
            };

            setWorkoutSummary(summary);
            setShowSummaryModal(true);
          } catch (error) {
            console.error('Failed to save workout:', error);
            showAlert(
              'Error',
              error instanceof Error
                ? error.message
                : 'Failed to save workout. Please try again.',
              [{ text: 'OK' }]
            );
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  // Handle summary modal close
  const handleSummaryClose = () => {
    setShowSummaryModal(false);
    navigation.goBack();
  };

  // Handle cancel workout
  const handleCancelWorkout = () => {
    showAlert(
      'Discard Workout',
      'Are you sure you want to discard this workout? All progress will be lost.',
      [
        { text: 'Keep Working', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Header with Timer */}
      <WorkoutHeader elapsedSeconds={elapsedSeconds} onCancel={handleCancelWorkout} />

      {/* Exercise List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={64} color={colors.textTertiary} />
            <Typography style={styles.emptyTitle}>No Exercises Added</Typography>
            <Typography style={styles.emptyMessage}>
              Tap the button below to add your first exercise
            </Typography>
          </View>
        ) : (
          exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              lastPerformance={lastPerformanceData.get(exercise.exerciseId)}
              onRemove={() => handleRemoveExercise(exercise.id)}
              onAddSet={() => addSet(exercise.id)}
              onRemoveSet={(setId) => removeSet(exercise.id, setId)}
              onUpdateSet={(setId, field, value) =>
                updateSet(exercise.id, setId, field, value)
              }
              onToggleComplete={(setId) => handleToggleSetComplete(exercise.id, setId)}
            />
          ))
        )}
        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Footer Buttons */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={colors.textPrimary} />
          <Typography style={styles.addExerciseText}>Add Exercise</Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.finishButton, saving && styles.finishButtonDisabled]}
          onPress={handleFinishWorkout}
          disabled={saving}
        >
          <LinearGradient
            colors={colors.gradientTealGreen}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.finishGradient}
          >
            <Typography style={styles.finishButtonText}>
              {saving ? 'Saving...' : 'Finish Workout'}
            </Typography>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Rest Timer Toast */}
      <RestTimerToast
        visible={restTimerVisible}
        restSeconds={restSeconds}
        restTimerDuration={restTimerDuration}
        bottomOffset={180 + insets.bottom}
        onSkip={skipRestTimer}
        onLongPress={() => setShowRestTimerOptions(true)}
        showOptions={showRestTimerOptions}
        onCloseOptions={() => setShowRestTimerOptions(false)}
        onSelectDuration={handleRestTimerDurationChange}
      />

      {/* Workout Summary Modal */}
      <WorkoutSummaryModal
        visible={showSummaryModal}
        summary={workoutSummary}
        onClose={handleSummaryClose}
      />

      {/* Add Exercise Modal */}
      <ExerciseSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectExercise={handleAddExercise}
        topInset={insets.top}
      />
    </View>
  );
}

// Quick Typography wrapper to avoid Text duplication
const Typography: React.FC<{ style?: any; children: React.ReactNode }> = ({
  style,
  children,
}) => {
  const { Text } = require('react-native');
  return <Text style={style}>{children}</Text>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    ...typography.title2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.bodySecondary,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  addExerciseText: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  finishButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  finishButtonDisabled: {
    opacity: 0.6,
  },
  finishGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  finishButtonText: {
    ...typography.headline,
    color: colors.textPrimary,
  },
});
