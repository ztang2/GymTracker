import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, TextInput } from 'react-native';
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
  createTemplateFromWorkout,
  type LastPerformance,
  type Exercise,
} from '../services';
import {
  saveWorkout,
  type ActiveWorkoutState,
} from '../services/workoutLogger';
import { useAuth , useTheme } from '../contexts';
import { spacing, borderRadius, typography } from '../constants/theme';
import {
  WorkoutSummaryModal,
  WorkoutHeader,
  RestTimerToast,
  ExerciseCard,
  ExerciseSelectionModal,
  RestTimerOptionsModal,
  SaveAsTemplateModal,
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
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Workout state
  const [startTime] = useState(new Date());
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [workoutNotesExpanded, setWorkoutNotesExpanded] = useState(false);
  const {
    exercises,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    toggleSetComplete,
    updateExerciseNotes,
    moveExercise,
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
    exerciseRestTimers,
    startRestTimer,
    skipRestTimer,
    setRestTimerDuration,
    adjustRestTime,
    getExerciseRestDuration,
    setExerciseRestDuration,
  } = useRestTimer(initialRestDuration);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);

  // Rest timer options modal (global)
  const [showRestTimerOptions, setShowRestTimerOptions] = useState(false);

  // Per-exercise rest timer modal state
  const [exerciseTimerModal, setExerciseTimerModal] = useState<{
    visible: boolean;
    exerciseId: string;
    exerciseName: string;
  }>({ visible: false, exerciseId: '', exerciseName: '' });

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

  // Save as template modal state
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

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
      const perf = await getLastPerformance(user!.id, exerciseId);
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

      // Find the exercise to pass its ID and name for per-exercise rest timer
      const exercise = exercises.find((ex) => ex.id === exerciseLocalId);
      if (exercise) {
        startRestTimer(exercise.exerciseId, exercise.exerciseName);
      } else {
        startRestTimer();
      }
    }
  };

  // Handle per-exercise rest timer configuration
  const handleConfigureExerciseRestTimer = (exerciseId: string, exerciseName: string) => {
    setExerciseTimerModal({ visible: true, exerciseId, exerciseName });
  };

  const handleExerciseRestTimerSelect = async (seconds: number) => {
    await setExerciseRestDuration(exerciseTimerModal.exerciseId, seconds);
    setExerciseTimerModal({ visible: false, exerciseId: '', exerciseName: '' });
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
              notes: workoutNotes,
            };

            await saveWorkout(user!.id, workoutState);

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
            const currentStreak = await getCurrentStreak(user!.id);
            const xpEarned = calculateWorkoutXP(setCount, currentStreak);

            // Award XP to user
            await awardXP(user!.id, xpEarned);

            // Check and award any new badges
            const newBadges = await checkAndAwardBadges(user!.id);

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

  // Handle save as template from summary
  const handleSaveAsTemplate = () => {
    setShowSummaryModal(false);
    setShowSaveTemplateModal(true);
  };

  // Handle template save
  const handleTemplateSave = async (name: string, description: string | null) => {
    if (!user) return;
    setSavingTemplate(true);
    try {
      const workoutExercises = exercises
        .filter((ex) => ex.sets.some((s) => s.completed && s.reps > 0))
        .map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets
            .filter((s) => s.completed && s.reps > 0)
            .map((s) => ({ weight: s.weight, reps: s.reps })),
        }));

      const durationMinutes = Math.floor(
        (Date.now() - startTime.getTime()) / 60000
      );

      await createTemplateFromWorkout(
        user.id,
        name,
        workoutExercises,
        durationMinutes
      );

      setShowSaveTemplateModal(false);
      showAlert('Template Saved', `"${name}" has been saved as a template.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Failed to save template:', error);
      showAlert('Error', 'Failed to save template. Please try again.', [
        { text: 'OK' },
      ]);
    } finally {
      setSavingTemplate(false);
    }
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
    <View style={styles.container}>
      {/* Header with Timer */}
      <WorkoutHeader elapsedSeconds={elapsedSeconds} onCancel={handleCancelWorkout} />

      {/* Exercise List */}
      <View style={styles.scrollContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
        {/* Workout Notes */}
        <View style={styles.workoutNotesContainer}>
          <TouchableOpacity
            style={styles.workoutNotesHeader}
            onPress={() => setWorkoutNotesExpanded(!workoutNotesExpanded)}
            accessibilityRole="button"
            accessibilityLabel={`${workoutNotesExpanded ? 'Collapse' : 'Expand'} workout notes`}
          >
            <View style={styles.notesHeaderLeft}>
              <Ionicons
                name="create-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Typography style={[styles.workoutNotesTitle, { color: colors.textSecondary }]}>
                Workout Notes {workoutNotes ? `(${workoutNotes.length})` : ''}
              </Typography>
            </View>
            <Ionicons
              name={workoutNotesExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {workoutNotesExpanded && (
            <TextInput
              style={[
                styles.workoutNotesInput,
                {
                  backgroundColor: colors.cardBackground,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Add notes about this workout..."
              placeholderTextColor={colors.textTertiary}
              value={workoutNotes}
              onChangeText={setWorkoutNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          )}
        </View>

        {exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={64} color={colors.textTertiary} />
            <Typography style={styles.emptyTitle}>No Exercises Added</Typography>
            <Typography style={styles.emptyMessage}>
              Tap the button below to add your first exercise
            </Typography>
          </View>
        ) : (
          exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              lastPerformance={lastPerformanceData.get(exercise.exerciseId)}
              restDuration={getExerciseRestDuration(
                exercise.exerciseId,
                exercise.exerciseName
              )}
              isFirst={index === 0}
              isLast={index === exercises.length - 1}
              onRemove={() => handleRemoveExercise(exercise.id)}
              onAddSet={() => addSet(exercise.id)}
              onRemoveSet={(setId) => removeSet(exercise.id, setId)}
              onUpdateSet={(setId, field, value) =>
                updateSet(exercise.id, setId, field, value)
              }
              onToggleComplete={(setId) => handleToggleSetComplete(exercise.id, setId)}
              onUpdateNotes={(notes) => updateExerciseNotes(exercise.id, notes)}
              onConfigureRestTimer={() =>
                handleConfigureExerciseRestTimer(
                  exercise.exerciseId,
                  exercise.exerciseName
                )
              }
              onMoveUp={() => moveExercise(exercise.id, 'up')}
              onMoveDown={() => moveExercise(exercise.id, 'down')}
            />
          ))
        )}
        </ScrollView>
      </View>

      {/* Footer fade gradient + Buttons */}
      <LinearGradient
        colors={['transparent', colors.background]}
        style={styles.footerFade}
        pointerEvents="none"
      />
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => setModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Add exercise"
          accessibilityHint="Add an exercise to your workout"
        >
          <Ionicons name="add" size={24} color={colors.textPrimary} />
          <Typography style={styles.addExerciseText}>Add Exercise</Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.finishButton, saving && styles.finishButtonDisabled]}
          onPress={handleFinishWorkout}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Finish workout"
          accessibilityHint="Complete and save your workout"
          accessibilityState={{ disabled: saving }}
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
        bottomOffset={150 + Math.max(insets.bottom, spacing.lg)}
        onSkip={skipRestTimer}
        onLongPress={() => setShowRestTimerOptions(true)}
        onAdjustTime={adjustRestTime}
        showOptions={showRestTimerOptions}
        onCloseOptions={() => setShowRestTimerOptions(false)}
        onSelectDuration={handleRestTimerDurationChange}
      />

      {/* Workout Summary Modal */}
      <WorkoutSummaryModal
        visible={showSummaryModal}
        summary={workoutSummary}
        onClose={handleSummaryClose}
        onSaveAsTemplate={handleSaveAsTemplate}
      />

      {/* Save As Template Modal */}
      <SaveAsTemplateModal
        visible={showSaveTemplateModal}
        onClose={() => {
          setShowSaveTemplateModal(false);
          navigation.goBack();
        }}
        onSave={handleTemplateSave}
        loading={savingTemplate}
      />

      {/* Add Exercise Modal */}
      <ExerciseSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectExercise={handleAddExercise}
        topInset={insets.top}
      />

      {/* Per-Exercise Rest Timer Options Modal */}
      <RestTimerOptionsModal
        visible={exerciseTimerModal.visible}
        exerciseName={exerciseTimerModal.exerciseName}
        currentDuration={
          exerciseTimerModal.exerciseId
            ? getExerciseRestDuration(
                exerciseTimerModal.exerciseId,
                exerciseTimerModal.exerciseName
              )
            : 60
        }
        onClose={() =>
          setExerciseTimerModal({ visible: false, exerciseId: '', exerciseName: '' })
        }
        onSelectDuration={handleExerciseRestTimerSelect}
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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    ...(Platform.OS === 'web' ? {
      position: 'absolute' as any,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    } : {
      flex: 1,
    }),
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    ...typography.title2,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footerFade: {
    height: 24,
    marginTop: -24,
  },
  footer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
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
  workoutNotesContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  workoutNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  workoutNotesTitle: {
    ...typography.headline,
    fontWeight: '600',
  },
  workoutNotesInput: {
    ...typography.body,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.md,
    minHeight: 100,
  },
});
