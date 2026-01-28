import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Vibration,
  Platform,
  AppState,
  AppStateStatus,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';

// Cross-platform alert helper
const showAlert = (
  title: string,
  message: string,
  buttons: Array<{ text: string; style?: string; onPress?: () => void }>
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
    // On native, use React Native Alert
    const { Alert } = require('react-native');
    Alert.alert(title, message, buttons);
  }
};
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ActiveWorkoutScreenProps } from '../navigation/types';
import {
  getAllExercises,
  requestNotificationPermissions,
  scheduleRestTimerNotification,
  cancelNotification,
  cancelAllNotifications,
  getLastPerformance,
  getRestTimerSeconds,
  setRestTimerSeconds,
  isHapticFeedbackEnabled,
  REST_TIMER_OPTIONS,
  awardXP,
  calculateWorkoutXP,
  checkAndAwardBadges,
  getCurrentStreak,
  type Exercise,
  type ExerciseCategory,
  type LastPerformance,
} from '../services';
import {
  createLocalExercise,
  createEmptySet,
  saveWorkout,
  formatDuration,
  type LocalExercise,
  type LocalSet,
  type ActiveWorkoutState,
} from '../services/workoutLogger';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { WorkoutSummaryModal } from '../components';
import type { WorkoutSummary } from '../services/types';

const CATEGORIES: ExerciseCategory[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'];
const DEFAULT_REST_SECONDS = 90;

// Format date for display (e.g., "Jan 15")
const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function ActiveWorkoutScreen({ navigation }: ActiveWorkoutScreenProps) {
  const insets = useSafeAreaInsets();

  // Workout state
  const [exercises, setExercises] = useState<LocalExercise[]>([]);
  const [startTime] = useState(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
  const [loadingExercises, setLoadingExercises] = useState(false);

  // Rest timer state - uses end timestamp for accuracy
  const [restTimerVisible, setRestTimerVisible] = useState(false);
  const [restEndTime, setRestEndTime] = useState<number | null>(null);
  const [restSeconds, setRestSeconds] = useState(DEFAULT_REST_SECONDS);
  const [restTimerDuration, setRestTimerDuration] = useState(DEFAULT_REST_SECONDS);
  const [showRestTimerOptions, setShowRestTimerOptions] = useState(false);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIdRef = useRef<string | null>(null);

  // Last performance data (previous weights)
  const [lastPerformanceData, setLastPerformanceData] = useState<Map<string, LastPerformance>>(new Map());

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
      // Restore tab bar when leaving - setting to undefined lets screenOptions take over
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
      const [restDuration, haptic] = await Promise.all([
        getRestTimerSeconds(),
        isHapticFeedbackEnabled(),
      ]);
      setRestTimerDuration(restDuration);
      setHapticEnabled(haptic);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  // Fetch last performance data when an exercise is added
  const fetchLastPerformance = useCallback(async (exerciseId: string) => {
    try {
      const perf = await getLastPerformance('test-user-123', exerciseId);
      if (perf) {
        setLastPerformanceData(prev => {
          const newMap = new Map(prev);
          newMap.set(exerciseId, perf);
          return newMap;
        });
      }
    } catch (error) {
      console.error('Failed to fetch last performance:', error);
    }
  }, []);

  // Duration timer - uses timestamp difference for accuracy
  useEffect(() => {
    const updateElapsedTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);
    };

    // Update immediately
    updateElapsedTime();

    // Set up interval for UI updates
    const timer = setInterval(updateElapsedTime, 1000);

    // Handle app state changes (background/foreground)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Update immediately when app comes to foreground
        updateElapsedTime();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [startTime]);

  // Load exercises when modal opens
  useEffect(() => {
    if (modalVisible && allExercises.length === 0) {
      loadExercises();
    }
  }, [modalVisible]);

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

  // Rest timer update effect - uses timestamp for accuracy
  useEffect(() => {
    if (!restEndTime || !restTimerVisible) {
      return;
    }

    const updateRestTime = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((restEndTime - now) / 1000));
      setRestSeconds(remaining);

      if (remaining <= 0) {
        // Timer finished
        if (restTimerRef.current) {
          clearInterval(restTimerRef.current);
          restTimerRef.current = null;
        }
        // Vibrate when timer ends (in foreground)
        if (Platform.OS !== 'web') {
          Vibration.vibrate([0, 500, 200, 500]);
        }
        setRestTimerVisible(false);
        setRestEndTime(null);
        notificationIdRef.current = null;
      }
    };

    // Update immediately
    updateRestTime();

    // Set up interval for UI updates (100ms for smooth countdown)
    restTimerRef.current = setInterval(updateRestTime, 100);

    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        updateRestTime();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
      subscription.remove();
    };
  }, [restEndTime, restTimerVisible]);

  // Cleanup notifications on unmount
  useEffect(() => {
    return () => {
      if (notificationIdRef.current) {
        cancelNotification(notificationIdRef.current);
      }
      cancelAllNotifications();
    };
  }, []);

  const loadExercises = async () => {
    setLoadingExercises(true);
    try {
      const data = await getAllExercises();
      setAllExercises(data);
      setFilteredExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
      showAlert('Error', 'Failed to load exercises. Please try again.', [{ text: 'OK' }]);
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    const newExercise = createLocalExercise(
      exercise.id,
      exercise.name,
      exercise.category
    );
    setExercises((prev) => [...prev, newExercise]);
    setModalVisible(false);
    setSearchQuery('');
    setSelectedCategory(null);

    // Fetch last performance data for this exercise
    fetchLastPerformance(exercise.id);
  };

  const handleRemoveExercise = (exerciseLocalId: string) => {
    showAlert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setExercises((prev) => prev.filter((ex) => ex.id !== exerciseLocalId));
          },
        },
      ]
    );
  };

  const handleAddSet = (exerciseLocalId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseLocalId) {
          return { ...ex, sets: [...ex.sets, createEmptySet()] };
        }
        return ex;
      })
    );
  };

  const handleRemoveSet = (exerciseLocalId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseLocalId && ex.sets.length > 1) {
          return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
        }
        return ex;
      })
    );
  };

  const handleUpdateSet = (
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
              if (s.id === setId) {
                return { ...s, [field]: numValue };
              }
              return s;
            }),
          };
        }
        return ex;
      })
    );
  };

  const handleToggleSetComplete = async (exerciseLocalId: string, setId: string) => {
    let wasCompleted = false;

    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseLocalId) {
          return {
            ...ex,
            sets: ex.sets.map((s) => {
              if (s.id === setId) {
                wasCompleted = s.completed;
                return { ...s, completed: !s.completed };
              }
              return s;
            }),
          };
        }
        return ex;
      })
    );

    // Start rest timer and trigger haptic when a set is marked as complete
    if (!wasCompleted) {
      // Haptic feedback for satisfying set completion
      if (hapticEnabled && Platform.OS !== 'web') {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          // Haptics may not be available on all devices
          console.log('Haptics not available');
        }
      }
      startRestTimer();
    }
  };

  const startRestTimer = async () => {
    // Clear any existing timer and notification
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
    if (notificationIdRef.current) {
      await cancelNotification(notificationIdRef.current);
      notificationIdRef.current = null;
    }

    // Calculate end time using user's preferred duration
    const endTime = Date.now() + restTimerDuration * 1000;
    setRestEndTime(endTime);
    setRestSeconds(restTimerDuration);
    setRestTimerVisible(true);

    // Schedule notification for when timer ends (for background alert)
    const notificationId = await scheduleRestTimerNotification(restTimerDuration);
    notificationIdRef.current = notificationId;
  };

  // Handle rest timer duration change
  const handleRestTimerDurationChange = async (seconds: number) => {
    setRestTimerDuration(seconds);
    setShowRestTimerOptions(false);

    // Save to AsyncStorage
    await setRestTimerSeconds(seconds);

    // If timer is currently running, restart with new duration
    if (restTimerVisible && restEndTime) {
      // Calculate remaining time with new duration
      const elapsed = restTimerDuration * 1000 - (restEndTime - Date.now());
      const newEndTime = Date.now() + (seconds * 1000) - elapsed;

      // Cancel existing notification
      if (notificationIdRef.current) {
        await cancelNotification(notificationIdRef.current);
      }

      // Update timer
      setRestEndTime(newEndTime);

      // Schedule new notification
      const remaining = Math.max(0, Math.ceil((newEndTime - Date.now()) / 1000));
      const notificationId = await scheduleRestTimerNotification(remaining);
      notificationIdRef.current = notificationId;
    }
  };

  const skipRestTimer = async () => {
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
    // Cancel the scheduled notification
    if (notificationIdRef.current) {
      await cancelNotification(notificationIdRef.current);
      notificationIdRef.current = null;
    }
    setRestTimerVisible(false);
    setRestEndTime(null);
  };

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

    showAlert(
      'Finish Workout',
      'Are you sure you want to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          onPress: async () => {
            setSaving(true);
            try {
              // Cancel any pending notifications
              if (notificationIdRef.current) {
                await cancelNotification(notificationIdRef.current);
              }
              await cancelAllNotifications();

              // Hide rest timer if visible
              setRestTimerVisible(false);

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

              // Award XP to user (this saves to database)
              const xpResult = await awardXP('test-user-123', xpEarned);
              console.log('XP awarded:', xpResult);

              // Check and award any new badges
              const newBadges = await checkAndAwardBadges('test-user-123');
              console.log('New badges earned:', newBadges.length);

              const summary: WorkoutSummary = {
                duration,
                exerciseCount: exercises.filter(e => e.sets.some(s => s.completed)).length,
                setCount,
                totalVolume,
                totalReps,
                xpEarned,
                newPRs: [], // TODO: Implement PR detection
                newBadges: newBadges,
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
      ]
    );
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
          onPress: async () => {
            // Cancel any pending notifications
            if (notificationIdRef.current) {
              await cancelNotification(notificationIdRef.current);
            }
            await cancelAllNotifications();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getCategoryDisplayName = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const renderExerciseCard = (exercise: LocalExercise) => {
    const lastPerf = lastPerformanceData.get(exercise.exerciseId);

    return (
      <View key={exercise.id} style={styles.exerciseCard}>
        {/* Exercise Header */}
        <View style={styles.exerciseHeader}>
          <View>
            <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
            <Text style={styles.exerciseCategory}>
              {getCategoryDisplayName(exercise.category)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleRemoveExercise(exercise.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* Previous Performance Hint */}
        {lastPerf && (
          <View style={styles.lastPerfContainer}>
            <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.lastPerfText}>
              Last: {lastPerf.lastWeight}kg × {lastPerf.lastReps} ({formatShortDate(lastPerf.lastDate)})
            </Text>
            {lastPerf.maxWeight > (lastPerf.lastWeight || 0) && (
              <Text style={styles.maxPerfText}>
                • Best: {lastPerf.maxWeight}kg
              </Text>
            )}
          </View>
        )}

        {/* Sets Header */}
        <View style={styles.setsHeader}>
          <Text style={[styles.setHeaderText, { flex: 0.5 }]}>SET</Text>
          <Text style={[styles.setHeaderText, { flex: 1 }]}>KG</Text>
          <Text style={[styles.setHeaderText, { flex: 1 }]}>REPS</Text>
          <Text style={[styles.setHeaderText, { flex: 0.5 }]}></Text>
        </View>

      {/* Sets List */}
      {exercise.sets.map((set, index) => (
        <View key={set.id} style={styles.setRow}>
          <Text style={[styles.setNumber, { flex: 0.5 }]}>{index + 1}</Text>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.setInput, set.completed && styles.setInputCompleted]}
              value={set.weight > 0 ? set.weight.toString() : ''}
              onChangeText={(value) => handleUpdateSet(exercise.id, set.id, 'weight', value)}
              keyboardType="numeric"
              placeholder="—"
              placeholderTextColor={colors.textMuted}
              editable={!set.completed}
              selectTextOnFocus
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.setInput, set.completed && styles.setInputCompleted]}
              value={set.reps > 0 ? set.reps.toString() : ''}
              onChangeText={(value) => handleUpdateSet(exercise.id, set.id, 'reps', value)}
              keyboardType="numeric"
              placeholder="—"
              placeholderTextColor={colors.textMuted}
              editable={!set.completed}
              selectTextOnFocus
            />
          </View>
          <View style={styles.setActions}>
            <TouchableOpacity
              style={[styles.checkbox, set.completed && styles.checkboxChecked]}
              onPress={() => handleToggleSetComplete(exercise.id, set.id)}
            >
              {set.completed && (
                <Ionicons name="checkmark" size={16} color={colors.textPrimary} />
              )}
            </TouchableOpacity>
            {exercise.sets.length > 1 && (
              <TouchableOpacity
                onPress={() => handleRemoveSet(exercise.id, set.id)}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <Ionicons name="close" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      {/* Add Set Button */}
      <TouchableOpacity
        style={styles.addSetButton}
        onPress={() => handleAddSet(exercise.id)}
      >
        <Ionicons name="add" size={18} color={colors.teal} />
        <Text style={styles.addSetText}>Add Set</Text>
      </TouchableOpacity>
    </View>
    );
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseListItem}
      onPress={() => handleAddExercise(item)}
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
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Header with Timer */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancelWorkout}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={20} color={colors.teal} />
          <Text style={styles.timerText}>{formatDuration(elapsedSeconds)}</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      {/* Exercise List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Exercises Added</Text>
            <Text style={styles.emptyMessage}>
              Tap the button below to add your first exercise
            </Text>
          </View>
        ) : (
          exercises.map(renderExerciseCard)
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
          <Text style={styles.addExerciseText}>Add Exercise</Text>
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
            <Text style={styles.finishButtonText}>
              {saving ? 'Saving...' : 'Finish Workout'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Rest Timer Toast */}
      {restTimerVisible && (
        <View style={[styles.restTimerToast, { bottom: 180 + insets.bottom }]}>
          <Pressable
            style={styles.restTimerContent}
            onLongPress={() => setShowRestTimerOptions(true)}
            delayLongPress={500}
          >
            <Ionicons name="timer-outline" size={24} color={colors.orange} />
            <View style={styles.restTimerInfo}>
              <Text style={styles.restTimerLabel}>Rest Timer (hold to change)</Text>
              <Text style={styles.restTimerValue}>{formatDuration(restSeconds)}</Text>
            </View>
            <TouchableOpacity onPress={skipRestTimer} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </Pressable>
        </View>
      )}

      {/* Rest Timer Options Modal */}
      <Modal
        visible={showRestTimerOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRestTimerOptions(false)}
      >
        <Pressable
          style={styles.restOptionsOverlay}
          onPress={() => setShowRestTimerOptions(false)}
        >
          <View style={styles.restOptionsContainer}>
            <Text style={styles.restOptionsTitle}>Rest Timer Duration</Text>
            <View style={styles.restOptionsGrid}>
              {REST_TIMER_OPTIONS.map((seconds) => (
                <TouchableOpacity
                  key={seconds}
                  style={[
                    styles.restOptionButton,
                    restTimerDuration === seconds && styles.restOptionButtonActive,
                  ]}
                  onPress={() => handleRestTimerDurationChange(seconds)}
                >
                  <Text
                    style={[
                      styles.restOptionText,
                      restTimerDuration === seconds && styles.restOptionTextActive,
                    ]}
                  >
                    {seconds}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Workout Summary Modal */}
      <WorkoutSummaryModal
        visible={showSummaryModal}
        summary={workoutSummary}
        onClose={handleSummaryClose}
      />

      {/* Add Exercise Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  timerText: {
    ...typography.headline,
    color: colors.teal,
    fontVariant: ['tabular-nums'],
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
  exerciseCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  lastPerfContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  lastPerfText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  maxPerfText: {
    ...typography.caption,
    color: colors.teal,
  },
  exerciseName: {
    ...typography.headline,
    marginBottom: spacing.xs,
  },
  exerciseCategory: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  setHeaderText: {
    ...typography.caption2,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  setNumber: {
    ...typography.callout,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  setInput: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  setInputCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  setActions: {
    flex: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  addSetText: {
    ...typography.callout,
    color: colors.teal,
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
  restTimerToast: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  restTimerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  restTimerInfo: {
    flex: 1,
  },
  restTimerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  restTimerValue: {
    ...typography.title2,
    color: colors.orange,
    fontVariant: ['tabular-nums'],
  },
  skipButton: {
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  skipButtonText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  // Modal styles
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
    maxHeight: 50,
    marginTop: spacing.lg,
  },
  categoryContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  categoryChipText: {
    ...typography.callout,
    color: colors.textSecondary,
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
  },
  // Rest Timer Options Modal
  restOptionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restOptionsContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '80%',
    maxWidth: 300,
  },
  restOptionsTitle: {
    ...typography.headline,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  restOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  restOptionButton: {
    backgroundColor: colors.backgroundElevated,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  restOptionButtonActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  restOptionText: {
    ...typography.headline,
    color: colors.textSecondary,
  },
  restOptionTextActive: {
    color: colors.textPrimary,
  },
});
