import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts';
import type { ThemeColors } from '../../constants/theme';

interface WorkoutDetailHeaderProps {
  isEditMode: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onShare: () => void;
  onSaveTemplate: () => void;
}

export const WorkoutDetailHeader: React.FC<WorkoutDetailHeaderProps> = ({
  isEditMode,
  isSaving,
  onEdit,
  onCancel,
  onSave,
  onShare,
  onSaveTemplate,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.header}>
      <Text style={styles.title} accessibilityRole="header">Workout Details</Text>
      <View style={styles.headerButtons}>
        {!isEditMode ? (
          <>
            <TouchableOpacity
              onPress={onShare}
              style={styles.editButton}
              accessibilityRole="button"
              accessibilityLabel="Share workout"
            >
              <Ionicons name="share-social-outline" size={24} color={colors.green} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSaveTemplate}
              style={styles.editButton}
              accessibilityRole="button"
              accessibilityLabel="Save as template"
            >
              <Ionicons name="bookmark-outline" size={24} color={colors.teal} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onEdit}
              style={styles.editButton}
              accessibilityRole="button"
              accessibilityLabel="Edit workout"
            >
              <Ionicons name="pencil" size={24} color={colors.purple} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={onCancel}
              style={styles.cancelButton}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSave}
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Save changes"
              accessibilityState={{ disabled: isSaving }}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    headerButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    editButton: {
      padding: 8,
    },
    cancelButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    saveButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.purple,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      fontSize: 16,
      color: '#ffffff',
      fontWeight: '600',
    },
  });
