import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ActiveWorkoutScreenProps } from '../navigation/types';
import { useTheme } from '../contexts';
import { spacing, borderRadius, typography ,  type ThemeColors } from '../constants/theme';
import {
  WorkoutSummaryModal,
  WorkoutHeader,
  RestTimerToast,
  ExerciseCard,
  ExerciseSelectionModal,
  RestTimerOptionsModal,
  SaveAsTemplateModal,
} from '../components';
import { useActiveWorkout } from '../hooks';

export default function ActiveWorkoutScreen({ navigation }: ActiveWorkoutScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const w = useActiveWorkout({ navigation, colors });

  return (
    <View style={styles.container}>
      {/* Header with Timer */}
      <WorkoutHeader elapsedSeconds={w.elapsedSeconds} onCancel={w.handleCancelWorkout} />

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
              onPress={() => w.setWorkoutNotesExpanded(!w.workoutNotesExpanded)}
              accessibilityRole="button"
              accessibilityLabel={`${w.workoutNotesExpanded ? 'Collapse' : 'Expand'} workout notes`}
            >
              <View style={styles.notesHeaderLeft}>
                <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.workoutNotesTitle, { color: colors.textSecondary }]}>
                  Workout Notes {w.workoutNotes ? `(${w.workoutNotes.length})` : ''}
                </Text>
              </View>
              <Ionicons
                name={w.workoutNotesExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            {w.workoutNotesExpanded && (
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
                value={w.workoutNotes}
                onChangeText={w.setWorkoutNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            )}
          </View>

          {w.exercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="barbell-outline" size={64} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Exercises Added</Text>
              <Text style={styles.emptyMessage}>
                Tap the button below to add your first exercise
              </Text>
            </View>
          ) : (
            w.exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                lastPerformance={w.lastPerformanceData.get(exercise.exerciseId)}
                restDuration={w.getExerciseRestDuration(
                  exercise.exerciseId,
                  exercise.exerciseName
                )}
                isFirst={index === 0}
                isLast={index === w.exercises.length - 1}
                onRemove={() => w.handleRemoveExercise(exercise.id)}
                onAddSet={() => w.addSet(exercise.id)}
                onRemoveSet={(setId) => w.removeSet(exercise.id, setId)}
                onUpdateSet={(setId, field, value) =>
                  w.updateSet(exercise.id, setId, field, value)
                }
                onToggleComplete={(setId) => w.handleToggleSetComplete(exercise.id, setId)}
                onUpdateNotes={(notes) => w.updateExerciseNotes(exercise.id, notes)}
                onConfigureRestTimer={() =>
                  w.handleConfigureExerciseRestTimer(
                    exercise.exerciseId,
                    exercise.exerciseName
                  )
                }
                onMoveUp={() => w.moveExercise(exercise.id, 'up')}
                onMoveDown={() => w.moveExercise(exercise.id, 'down')}
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
          onPress={() => w.setModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Add exercise"
          accessibilityHint="Add an exercise to your workout"
        >
          <Ionicons name="add" size={24} color={colors.textPrimary} />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.finishButton, w.saving && styles.finishButtonDisabled]}
          onPress={w.handleFinishWorkout}
          disabled={w.saving}
          accessibilityRole="button"
          accessibilityLabel="Finish workout"
          accessibilityHint="Complete and save your workout"
          accessibilityState={{ disabled: w.saving }}
        >
          <LinearGradient
            colors={colors.gradientTealGreen}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.finishGradient}
          >
            <Text style={styles.finishButtonText}>
              {w.saving ? 'Saving...' : 'Finish Workout'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Rest Timer Toast */}
      <RestTimerToast
        visible={w.restTimerVisible}
        restSeconds={w.restSeconds}
        restTimerDuration={w.restTimerDuration}
        bottomOffset={150 + Math.max(insets.bottom, spacing.lg)}
        onSkip={w.skipRestTimer}
        onLongPress={() => w.setShowRestTimerOptions(true)}
        onAdjustTime={w.adjustRestTime}
        showOptions={w.showRestTimerOptions}
        onCloseOptions={() => w.setShowRestTimerOptions(false)}
        onSelectDuration={w.handleRestTimerDurationChange}
      />

      {/* Workout Summary Modal */}
      <WorkoutSummaryModal
        visible={w.showSummaryModal}
        summary={w.workoutSummary}
        onClose={w.handleSummaryClose}
        onSaveAsTemplate={w.handleSaveAsTemplate}
      />

      {/* Save As Template Modal */}
      <SaveAsTemplateModal
        visible={w.showSaveTemplateModal}
        onClose={() => {
          w.setShowSaveTemplateModal(false);
          navigation.goBack();
        }}
        onSave={w.handleTemplateSave}
        loading={w.savingTemplate}
      />

      {/* Add Exercise Modal */}
      <ExerciseSelectionModal
        visible={w.modalVisible}
        onClose={() => w.setModalVisible(false)}
        onSelectExercise={w.handleAddExercise}
        topInset={insets.top}
      />

      {/* Per-Exercise Rest Timer Options Modal */}
      <RestTimerOptionsModal
        visible={w.exerciseTimerModal.visible}
        exerciseName={w.exerciseTimerModal.exerciseName}
        currentDuration={
          w.exerciseTimerModal.exerciseId
            ? w.getExerciseRestDuration(
                w.exerciseTimerModal.exerciseId,
                w.exerciseTimerModal.exerciseName
              )
            : 60
        }
        onClose={w.closeExerciseTimerModal}
        onSelectDuration={w.handleExerciseRestTimerSelect}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
      position: 'absolute',
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
