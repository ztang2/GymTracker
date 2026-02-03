import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import type { ThemeColors } from '../constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { WorkoutDetailScreenProps } from '../navigation/types';
import { SaveAsTemplateModal } from '../components';
import { useTheme } from '../contexts';
import {
  useWorkoutDetail,
  WorkoutDetailHeader,
  WorkoutInfoCards,
  ExerciseListSection,
  ExercisePickerModal,
} from '../components/workout-detail';

export default function WorkoutDetailScreen({ route, navigation }: WorkoutDetailScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { workoutId } = route.params;

  const {
    workout,
    editedWorkout,
    loading,
    isEditMode,
    isSaving,
    availableExercises,
    showExercisePicker,
    setShowExercisePicker,
    showDatePicker,
    setShowDatePicker,
    errors,
    showSaveTemplateModal,
    setShowSaveTemplateModal,
    savingTemplate,
    handleEnterEditMode,
    handleCancelEdit,
    handleSaveEdit,
    handleUpdateSet,
    handleAddSet,
    handleRemoveSet,
    handleAddExercise,
    handleRemoveExercise,
    handleUpdateNotes,
    handleUpdateDate,
    handleShareWorkout,
    handleSaveAsTemplate,
  } = useWorkoutDetail(workoutId);

  // Render loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Render not found state
  if (!workout || !editedWorkout) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Workout not found</Text>
        </View>
      </View>
    );
  }

  const displayWorkout = isEditMode ? editedWorkout : workout;

  return (
    <View style={styles.container}>
      <WorkoutDetailHeader
        isEditMode={isEditMode}
        isSaving={isSaving}
        onEdit={handleEnterEditMode}
        onCancel={handleCancelEdit}
        onSave={handleSaveEdit}
        onShare={handleShareWorkout}
        onSaveTemplate={() => setShowSaveTemplateModal(true)}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <WorkoutInfoCards
          displayWorkout={displayWorkout}
          isEditMode={isEditMode}
          onUpdateNotes={handleUpdateNotes}
          onOpenDatePicker={() => setShowDatePicker(true)}
        />

        <ExerciseListSection
          displayWorkout={displayWorkout}
          isEditMode={isEditMode}
          errors={errors}
          onRemoveExercise={handleRemoveExercise}
          onUpdateSet={handleUpdateSet}
          onAddSet={handleAddSet}
          onRemoveSet={handleRemoveSet}
          onOpenExercisePicker={() => setShowExercisePicker(true)}
          onNavigateToExercise={(exerciseId, exerciseName) => {
            // @ts-ignore - Cross-tab navigation
            navigation.navigate('ProgressTab', {
              screen: 'ExerciseProgressScreen',
              params: { exerciseId, exerciseName },
            });
          }}
        />
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={new Date(displayWorkout.date)}
          mode="date"
          display="default"
          onChange={(event: { type: string }, date?: Date) => {
            if (event.type === 'set' && date) {
              handleUpdateDate(date);
            } else {
              setShowDatePicker(false);
            }
          }}
        />
      )}

      {/* Exercise Picker Modal */}
      <ExercisePickerModal
        visible={showExercisePicker}
        exercises={availableExercises}
        onSelect={handleAddExercise}
        onClose={() => setShowExercisePicker(false)}
      />

      {/* Save As Template Modal */}
      <SaveAsTemplateModal
        visible={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        onSave={handleSaveAsTemplate}
        loading={savingTemplate}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
  });
