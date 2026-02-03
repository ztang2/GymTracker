import { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import type { ThemeColors } from '../constants/theme';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

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
  detectPRsFromWorkout,
  XP_REWARDS,
  type LastPerformance,
  type Exercise,
} from '../services';
import {
  saveWorkout,
  type ActiveWorkoutState,
  type LocalExercise,
} from '../services/workoutLogger';
import { useAuth } from '../contexts';
import type { WorkoutSummary } from '../services/types';
import { useWorkoutTimer } from './useWorkoutTimer';
import { useRestTimer } from './useRestTimer';
import { useWorkoutState } from './useWorkoutState';
import { showAlert } from '../utils/alert';

interface UseActiveWorkoutOptions {
  /** Initial exercises to pre-fill (e.g. from a template) */
  initialExercises?: LocalExercise[];
  /** Navigation object — must have goBack() and getParent() */
  navigation: {
    goBack: () => void;
    getParent: () => { setOptions: (opts: Record<string, unknown>) => void } | undefined;
  };
  /** Theme colors for restoring tab bar */
  colors: ThemeColors;
}

export interface UseActiveWorkoutReturn {
  // State
  startTime: Date;
  elapsedSeconds: number;
  exercises: LocalExercise[];
  workoutNotes: string;
  setWorkoutNotes: (notes: string) => void;
  workoutNotesExpanded: boolean;
  setWorkoutNotesExpanded: (expanded: boolean) => void;
  saving: boolean;

  // Exercise management
  handleAddExercise: (exercise: Exercise) => void;
  handleRemoveExercise: (exerciseLocalId: string) => void;
  addSet: (exerciseLocalId: string) => void;
  removeSet: (exerciseLocalId: string, setId: string) => void;
  updateSet: (exerciseLocalId: string, setId: string, field: 'weight' | 'reps', value: string) => void;
  handleToggleSetComplete: (exerciseLocalId: string, setId: string) => Promise<void>;
  updateExerciseNotes: (exerciseLocalId: string, notes: string) => void;
  moveExercise: (exerciseLocalId: string, direction: 'up' | 'down') => void;

  // Last performance
  lastPerformanceData: Map<string, LastPerformance>;
  fetchLastPerformance: (exerciseId: string) => Promise<void>;

  // Rest timer
  restTimerVisible: boolean;
  restSeconds: number;
  restTimerDuration: number;
  skipRestTimer: () => Promise<void>;
  adjustRestTime: (deltaSeconds: number) => void;
  getExerciseRestDuration: (exerciseId: string, exerciseName: string) => number;
  setExerciseRestDuration: (exerciseId: string, seconds: number) => Promise<void>;
  handleRestTimerDurationChange: (seconds: number) => Promise<void>;

  // Rest timer options modal
  showRestTimerOptions: boolean;
  setShowRestTimerOptions: (show: boolean) => void;

  // Per-exercise rest timer modal
  exerciseTimerModal: { visible: boolean; exerciseId: string; exerciseName: string };
  handleConfigureExerciseRestTimer: (exerciseId: string, exerciseName: string) => void;
  handleExerciseRestTimerSelect: (seconds: number) => Promise<void>;
  closeExerciseTimerModal: () => void;

  // Exercise selection modal
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;

  // Workout flow
  handleFinishWorkout: () => Promise<void>;
  handleCancelWorkout: () => void;

  // Summary modal
  showSummaryModal: boolean;
  workoutSummary: WorkoutSummary | null;
  handleSummaryClose: () => void;
  handleSaveAsTemplate: () => void;

  // Save as template modal
  showSaveTemplateModal: boolean;
  setShowSaveTemplateModal: (show: boolean) => void;
  handleTemplateSave: (name: string, description: string | null) => Promise<void>;
  savingTemplate: boolean;
}

/**
 * Shared hook for active workout logic used by both
 * ActiveWorkoutScreen and ActiveWorkoutFromTemplateScreen.
 */
export function useActiveWorkout({
  initialExercises,
  navigation,
  colors,
}: UseActiveWorkoutOptions): UseActiveWorkoutReturn {
  const { user } = useAuth();

  // Workout state from existing hook (pass initial exercises for template mode)
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
  } = useWorkoutState(initialExercises);

  // Timer
  const [startTime] = useState(new Date());
  const elapsedSeconds = useWorkoutTimer(startTime);

  // Notes
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [workoutNotesExpanded, setWorkoutNotesExpanded] = useState(false);

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
    adjustRestTime,
    getExerciseRestDuration,
    setExerciseRestDuration,
  } = useRestTimer(initialRestDuration);

  // Modals
  const [modalVisible, setModalVisible] = useState(false);
  const [showRestTimerOptions, setShowRestTimerOptions] = useState(false);
  const [exerciseTimerModal, setExerciseTimerModal] = useState<{
    visible: boolean;
    exerciseId: string;
    exerciseName: string;
  }>({ visible: false, exerciseId: '', exerciseName: '' });

  // Last performance data
  const [lastPerformanceData, setLastPerformanceData] = useState<Map<string, LastPerformance>>(
    new Map()
  );

  // Settings
  const [hapticEnabled, setHapticEnabled] = useState(true);

  // Saving state
  const [saving, setSaving] = useState(false);

  // Summary modal
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary | null>(null);

  // Save as template modal
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Hide tab bar
  useLayoutEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({ tabBarStyle: { display: 'none' } });
    }
    return () => {
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
  }, [navigation, colors.background, colors.border]);

  // Init on mount
  useEffect(() => {
    requestNotificationPermissions();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const haptic = await isHapticFeedbackEnabled();
      setHapticEnabled(haptic);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  // Fetch last performance
  const fetchLastPerformance = useCallback(
    async (exerciseId: string) => {
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
    },
    [user]
  );

  // Handle adding exercise
  const handleAddExercise = useCallback(
    (exercise: Exercise) => {
      addExercise(exercise);
      setModalVisible(false);
      fetchLastPerformance(exercise.id);
    },
    [addExercise, fetchLastPerformance]
  );

  // Handle removing exercise with confirmation
  const handleRemoveExercise = useCallback(
    (exerciseLocalId: string) => {
      showAlert('Remove Exercise', 'Are you sure you want to remove this exercise?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeExercise(exerciseLocalId),
        },
      ]);
    },
    [removeExercise]
  );

  // Handle set completion with haptic + rest timer
  const handleToggleSetComplete = useCallback(
    async (exerciseLocalId: string, setId: string) => {
      const justCompleted = toggleSetComplete(exerciseLocalId, setId);

      if (justCompleted) {
        if (hapticEnabled && Platform.OS !== 'web') {
          try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {
            // Haptics not available
          }
        }

        const exercise = exercises.find((ex) => ex.id === exerciseLocalId);
        if (exercise) {
          startRestTimer(exercise.exerciseId, exercise.exerciseName);
        } else {
          startRestTimer();
        }
      }
    },
    [toggleSetComplete, hapticEnabled, exercises, startRestTimer]
  );

  // Per-exercise rest timer configuration
  const handleConfigureExerciseRestTimer = useCallback(
    (exerciseId: string, exerciseName: string) => {
      setExerciseTimerModal({ visible: true, exerciseId, exerciseName });
    },
    []
  );

  const handleExerciseRestTimerSelect = useCallback(
    async (seconds: number) => {
      await setExerciseRestDuration(exerciseTimerModal.exerciseId, seconds);
      setExerciseTimerModal({ visible: false, exerciseId: '', exerciseName: '' });
    },
    [exerciseTimerModal.exerciseId, setExerciseRestDuration]
  );

  const closeExerciseTimerModal = useCallback(() => {
    setExerciseTimerModal({ visible: false, exerciseId: '', exerciseName: '' });
  }, []);

  // Rest timer duration change
  const handleRestTimerDurationChange = useCallback(
    async (seconds: number) => {
      setRestTimerDuration(seconds);
      setShowRestTimerOptions(false);
      await setRestTimerSeconds(seconds);
    },
    [setRestTimerDuration]
  );

  // Finish workout
  const handleFinishWorkout = useCallback(async () => {
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
          if (!user) {
            showAlert('Error', 'You must be logged in to save a workout.', [{ text: 'OK' }]);
            return;
          }

          setSaving(true);
          try {
            const workoutState: ActiveWorkoutState = {
              exercises,
              startTime,
              notes: workoutNotes,
            };

            const savedSession = await saveWorkout(user.id, workoutState);

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

            // Detect personal records
            const exerciseSetsForPR = exercises
              .filter((ex) => ex.sets.some((s) => s.completed && s.reps > 0))
              .map((ex) => ({
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                sets: ex.sets.filter((s) => s.completed && s.reps > 0),
              }));

            const newPRs = await detectPRsFromWorkout(user.id, savedSession.id, exerciseSetsForPR);

            // Get current streak and calculate XP
            const currentStreak = await getCurrentStreak(user.id);
            let xpEarned = calculateWorkoutXP(setCount, currentStreak);
            xpEarned += newPRs.length * XP_REWARDS.personalRecord;

            // Award XP to user
            await awardXP(user.id, xpEarned);

            // Check and award any new badges
            const newBadges = await checkAndAwardBadges(user.id);

            const summary: WorkoutSummary = {
              duration,
              exerciseCount: exercises.filter((e) => e.sets.some((s) => s.completed)).length,
              setCount,
              totalVolume,
              totalReps,
              xpEarned,
              newPRs,
              newBadges,
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
  }, [exercises, user, startTime, workoutNotes]);

  // Summary modal close
  const handleSummaryClose = useCallback(() => {
    setShowSummaryModal(false);
    navigation.goBack();
  }, [navigation]);

  // Save as template from summary
  const handleSaveAsTemplate = useCallback(() => {
    setShowSummaryModal(false);
    setShowSaveTemplateModal(true);
  }, []);

  // Template save
  const handleTemplateSave = useCallback(
    async (name: string, description: string | null) => {
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

        const durationMinutes = Math.floor((Date.now() - startTime.getTime()) / 60000);

        await createTemplateFromWorkout(user.id, name, workoutExercises, durationMinutes);

        setShowSaveTemplateModal(false);
        showAlert('Template Saved', `"${name}" has been saved as a template.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch (error) {
        console.error('Failed to save template:', error);
        showAlert('Error', 'Failed to save template. Please try again.', [{ text: 'OK' }]);
      } finally {
        setSavingTemplate(false);
      }
    },
    [user, exercises, startTime, navigation]
  );

  // Cancel workout
  const handleCancelWorkout = useCallback(() => {
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
  }, [navigation]);

  return {
    startTime,
    elapsedSeconds,
    exercises,
    workoutNotes,
    setWorkoutNotes,
    workoutNotesExpanded,
    setWorkoutNotesExpanded,
    saving,

    handleAddExercise,
    handleRemoveExercise,
    addSet,
    removeSet,
    updateSet,
    handleToggleSetComplete,
    updateExerciseNotes,
    moveExercise,

    lastPerformanceData,
    fetchLastPerformance,

    restTimerVisible,
    restSeconds,
    restTimerDuration,
    skipRestTimer,
    adjustRestTime,
    getExerciseRestDuration,
    setExerciseRestDuration,
    handleRestTimerDurationChange,

    showRestTimerOptions,
    setShowRestTimerOptions,

    exerciseTimerModal,
    handleConfigureExerciseRestTimer,
    handleExerciseRestTimerSelect,
    closeExerciseTimerModal,

    modalVisible,
    setModalVisible,

    handleFinishWorkout,
    handleCancelWorkout,

    showSummaryModal,
    workoutSummary,
    handleSummaryClose,
    handleSaveAsTemplate,

    showSaveTemplateModal,
    setShowSaveTemplateModal,
    handleTemplateSave,
    savingTemplate,
  };
}
