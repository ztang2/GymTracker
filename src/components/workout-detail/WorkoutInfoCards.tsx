import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts';
import type { ThemeColors } from '../../constants/theme';
import type { WorkoutSessionWithExercises } from '../../services';

interface WorkoutInfoCardsProps {
  displayWorkout: WorkoutSessionWithExercises;
  isEditMode: boolean;
  onUpdateNotes: (notes: string) => void;
  onOpenDatePicker: () => void;
}

export const WorkoutInfoCards: React.FC<WorkoutInfoCardsProps> = ({
  displayWorkout,
  isEditMode,
  onUpdateNotes,
  onOpenDatePicker,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <>
      {/* Edit mode indicator */}
      {isEditMode && (
        <View style={styles.editModeIndicator}>
          <Ionicons name="create-outline" size={16} color={colors.purple} />
          <Text style={styles.editModeText}>Edit Mode</Text>
        </View>
      )}

      {/* Date */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Date</Text>
        {isEditMode ? (
          <TouchableOpacity onPress={onOpenDatePicker} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>{displayWorkout.date}</Text>
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : (
          <Text style={styles.infoValue}>{displayWorkout.date}</Text>
        )}
      </View>

      {/* Duration */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Duration</Text>
        <Text style={styles.infoValue}>
          {displayWorkout.duration_minutes ? `${displayWorkout.duration_minutes} min` : 'In progress'}
        </Text>
      </View>

      {/* Notes */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Notes</Text>
        {isEditMode ? (
          <TextInput
            style={styles.notesInput}
            value={displayWorkout.notes || ''}
            onChangeText={onUpdateNotes}
            placeholder="Add workout notes..."
            placeholderTextColor={colors.textTertiary}
            multiline
          />
        ) : (
          <Text style={styles.infoValue}>
            {displayWorkout.notes || 'No notes'}
          </Text>
        )}
      </View>
    </>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    editModeIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      backgroundColor: `${colors.purple}20`,
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.purple,
    },
    editModeText: {
      fontSize: 14,
      color: colors.purple,
      fontWeight: '600',
    },
    infoCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    infoValue: {
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    dateButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateButtonText: {
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    notesInput: {
      fontSize: 16,
      color: colors.textPrimary,
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 80,
      textAlignVertical: 'top',
    },
  });
