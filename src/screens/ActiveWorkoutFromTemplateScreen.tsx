import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import type { ActiveWorkoutFromTemplateScreenProps } from '../navigation/types';
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
  getTemplate,
  type LastPerformance,
  type Exercise,
} from '../services';
import {
  saveWorkout,
  generateLocalId,
  type ActiveWorkoutState,
  type LocalExercise,
  type LocalSet,
} from '../services/workoutLogger';
import { useAuth, useTheme } from '../contexts';
import { spacing, borderRadius, typography } from '../constants/theme';
import {
  WorkoutSummaryModal,
  WorkoutHeader,
  RestTimerToast,
  ExerciseCard,
  ExerciseSelectionModal,
  LoadingState,
} from '../components';
import type { WorkoutSummary } from '../services/types';
import { useWorkoutTimer, useRestTimer } from '../hooks';
import { showAlert } from '../utils/alert';
import { supabase } from '../services/supabase';

export default function ActiveWorkoutFromTemplateScreen({
  route,
  navigation,
}: ActiveWorkoutFromTemplateScreenProps) {
  const { templateId } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Loading state for template
  const [templateLoading, setTemplateLoading] = useState(true);

  // Workout state
  const [startTime] = useState(new Date());
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [workoutNotesExpanded, setWorkoutNotesExpanded] = useState(false);
  const [exercises, setExercises] = useState<LocalExercise[]>([]);

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
    adjustRestTime,
  } = useRestTimer(initialRestDuration);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);

  // Rest timer options modal
  const [showRestTimerOptions, setShowRestTimerOptions] = useState(false);

  // Last performance data
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
  }, [navigation]);

  // Load template and pre-fill exercises
  useEffect(() => {
    loadTemplate();
    requestNotificationPermissions();
    loadSettings();
  }, []);

  const loadTemplate = async () => {
    if (!user) return;
    try {
      const template = await getTemplate(templateId, user.id);
      if (!template || !template.exercises) {
        showAlert('Error', 'Template not found');
        navigation.goBack();
        return;
      }

      // Convert template exercises to local workout exercises
      const localExercises: LocalExercise[] = template.exercises.map((te) => {
        const sets: LocalSet[] = [];
        const numSets = te.target_sets || 3;
        for (let i = 0; i < numSets; i++) {
          sets.push({
            id: generateLocalId(),
            weight: te.target_weight || 0,
            reps: te.target_reps || 0,
            completed: false,
          });
        }

        return {
          id: generateLocalId(),
          exerciseId: te.exercise_id,
          exerciseName: te.exercise?.name || 'Exercise',
          category: te.exercise?.category || 'chest',
          sets,
          notes: te.notes || '',
        };
      });

      setExercises(localExercises);

      // Fetch last performance for all template exercises
      for (const te of template.exercises) {
        fetchLastPerformance(te.exercise_id);
      }

      // Update last_used_at on the template
      await supabase
        .from('workout_templates')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', templateId);
    } catch (error) {
      console.error('Failed to load template:', error);
      showAlert('Error', 'Failed to load template');
      navigation.goBack();
    } finally {
      setTemplateLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const haptic = await isHapticFeedbackEnabled();
      setHapticEnabled(haptic);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

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
  }, [user]);

  // Exercise management functions
  const addExercise = (exercise: Exercise) => {
    const newExercise: LocalExercise = {
      id: generateLocalId(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      sets: [{ id: generateLocalId(), weight: 0, reps: 0, completed: false }],
      notes: '',
    };
    setExercises((prev) => [...prev, newExercise]);
    setModalVisible(false);
    fetchLastPerformance(exercise.id);
  };

  const removeExercise = (exerciseLocalId: string) => {
    showAlert('Remove Exercise', 'Are you sure you want to remove this exercise?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setExercises((prev) => prev.filter((ex) => ex.id !== exerciseLocalId)),
      },
    ]);
  };

  const addSet = (exerciseLocalId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseLocalId) {
          return {
            ...ex,
            sets: [
              ...ex.sets,
              { id: generateLocalId(), weight: 0, reps: 0, completed: false },
            ],
          };
        }
        return ex;
      })
    );
  };

  const removeSet = (exerciseLocalId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseLocalId && ex.sets.length > 1) {
          return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
        }
        return ex;
      })
    );
  };

  const updateSet = (
    exerciseLocalId: string,
    setId: string,
    field: 'weight' | 'reps',
    value: string
  ) => {
    const numValue = parseInt(value, 10) || 0;
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseLocalId) {
          return {
            ...ex,
            sets: ex.sets.map((s) => {
              if (s.id === setId) return { ...s, [field]: numValue };
              return s;
            }),
          };
        }
        return ex;
      })
    );
  };

  const toggleSetComplete = (exerciseLocalId: string, setId: string): boolean => {
    let justCompleted = false;
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseLocalId) {
          return {
            ...ex,
            sets: ex.sets.map((s) => {
              if (s.id === setId) {
                justCompleted = !s.completed;
                return { ...s, completed: !s.completed };
              }
              return s;
            }),
          };
        }
        return ex;
      })
    );
    return justCompleted;
  };

  const updateExerciseNotes = (exerciseLocalId: string, notes: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseLocalId) return { ...ex, notes };
        return ex;
      })
    );
  };

  // Handle set completion with haptic
  const handleToggleSetComplete = async (exerciseLocalId: string, setId: string) => {
    const completed = toggleSetComplete(exerciseLocalId, setId);
    if (completed) {
      if (hapticEnabled && Platform.OS !== 'web') {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch { /* Haptics not available */ }
      }
      startRestTimer();
    }
  };

  const handleRestTimerDurationChange = async (seconds: number) => {
    setRestTimerDuration(seconds);
    setShowRestTimerOptions(false);
    await setRestTimerSeconds(seconds);
  };

  const handleFinishWorkout = async () => {
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

            const currentStreak = await getCurrentStreak(user!.id);
            const xpEarned = calculateWorkoutXP(setCount, currentStreak);
            await awardXP(user!.id, xpEarned);
            const newBadges = await checkAndAwardBadges(user!.id);

            const summary: WorkoutSummary = {
              duration,
              exerciseCount: exercises.filter((e) => e.sets.some((s) => s.completed)).length,
              setCount,
              totalVolume,
              totalReps,
              xpEarned,
              newPRs: [],
              newBadges,
            };

            setWorkoutSummary(summary);
            setShowSummaryModal(true);
          } catch (error) {
            console.error('Failed to save workout:', error);
            showAlert(
              'Error',
              error instanceof Error ? error.message : 'Failed to save workout. Please try again.',
              [{ text: 'OK' }]
            );
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const handleSummaryClose = () => {
    setShowSummaryModal(false);
    navigation.goBack();
  };

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

  if (templateLoading) {
    return <LoadingState />;
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Header with Timer */}
      <WorkoutHeader elapsedSeconds={elapsedSeconds} onCancel={handleCancelWorkout} />

      {/* Exercise List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Workout Notes */}
        <View style={styles.workoutNotesContainer}>
          <TouchableOpacity
            style={styles.workoutNotesHeader}
            onPress={() => setWorkoutNotesExpanded(!workoutNotesExpanded)}
            accessibilityRole="button"
            accessibilityLabel={`${workoutNotesExpanded ? 'Collapse' : 'Expand'} workout notes`}
          >
            <View style={styles.notesHeaderLeft}>
              <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.workoutNotesTitle, { color: colors.textSecondary }]}>
                Workout Notes {workoutNotes ? `(${workoutNotes.length})` : ''}
              </Text>
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
            <Text style={styles.emptyTitle}>No Exercises</Text>
            <Text style={styles.emptyMessage}>
              Tap the button below to add an exercise
            </Text>
          </View>
        ) : (
          exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              lastPerformance={lastPerformanceData.get(exercise.exerciseId)}
              onRemove={() => removeExercise(exercise.id)}
              onAddSet={() => addSet(exercise.id)}
              onRemoveSet={(setId) => removeSet(exercise.id, setId)}
              onUpdateSet={(setId, field, value) => updateSet(exercise.id, setId, field, value)}
              onToggleComplete={(setId) => handleToggleSetComplete(exercise.id, setId)}
              onUpdateNotes={(notes) => updateExerciseNotes(exercise.id, notes)}
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
          accessibilityRole="button"
          accessibilityLabel="Add exercise"
        >
          <Ionicons name="add" size={24} color={colors.textPrimary} />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.finishButton, saving && styles.finishButtonDisabled]}
          onPress={handleFinishWorkout}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Finish workout"
        >
          <LinearGradient
            colors={colors.gradientTealGreen}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.finishGradient}
          >
            <Text style={styles.finishButtonText}>
              {saving ? 'Saving...' : 'Finish Workout'}
            </Text>
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
      />

      {/* Add Exercise Modal */}
      <ExerciseSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectExercise={addExercise}
        topInset={insets.top}
      />
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
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
      color: colors.textPrimary,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    emptyMessage: {
      ...typography.bodySecondary,
      color: colors.textSecondary,
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
