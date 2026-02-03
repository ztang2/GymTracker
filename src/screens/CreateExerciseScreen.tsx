import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts';
import { useAuth } from '../contexts/AuthContext';
import type { CreateExerciseScreenProps } from '../navigation/types';
import { createCustomExercise } from '../services/exerciseService';
import type { ExerciseCategory } from '../services/types';
import { spacing, borderRadius, typography ,  type ThemeColors } from '../constants/theme';
import { showAlert } from '../utils/alert';

const MUSCLE_GROUPS: Array<{ value: ExerciseCategory; label: string }> = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'legs', label: 'Legs' },
  { value: 'arms', label: 'Arms' },
  { value: 'core', label: 'Core' },
  { value: 'cardio', label: 'Cardio' },
];

const EQUIPMENT_TYPES = [
  'Barbell',
  'Dumbbell',
  'Machine',
  'Cable',
  'Bodyweight',
  'Other',
];

export default function CreateExerciseScreen({ navigation }: CreateExerciseScreenProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const styles = createStyles(colors);

  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validate
    if (!name.trim()) {
      showAlert('Validation Error', 'Please enter an exercise name', [{ text: 'OK' }]);
      return;
    }

    if (name.trim().length > 100) {
      showAlert('Validation Error', 'Exercise name must be 100 characters or less', [{ text: 'OK' }]);
      return;
    }

    if (description.trim().length > 500) {
      showAlert('Validation Error', 'Description must be 500 characters or less', [{ text: 'OK' }]);
      return;
    }

    if (!selectedCategory) {
      showAlert('Validation Error', 'Please select a muscle group', [{ text: 'OK' }]);
      return;
    }

    if (!user) {
      showAlert('Error', 'You must be logged in to create a custom exercise', [{ text: 'OK' }]);
      return;
    }

    setLoading(true);
    try {
      await createCustomExercise(
        {
          name: name.trim(),
          category: selectedCategory,
          equipment_type: selectedEquipment || undefined,
          description: description.trim() || undefined,
        },
        user.id
      );

      showAlert('Success', 'Custom exercise created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Failed to create exercise:', error);
      showAlert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create exercise',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Create Custom Exercise
          </Text>
        </View>

        {/* Exercise Name */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            Exercise Name <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.cardBackground,
                color: colors.textPrimary,
                borderColor: colors.border,
              },
            ]}
            placeholder="e.g., Cable Chest Fly"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Muscle Group */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            Muscle Group <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <View style={styles.chipContainer}>
            {MUSCLE_GROUPS.map((group) => (
              <TouchableOpacity
                key={group.value}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      selectedCategory === group.value
                        ? colors.purple
                        : colors.cardBackground,
                    borderColor:
                      selectedCategory === group.value ? colors.purple : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(group.value)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${group.label}`}
                accessibilityState={{ selected: selectedCategory === group.value }}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        selectedCategory === group.value
                          ? colors.textPrimary
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {group.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Equipment Type */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            Equipment Type (Optional)
          </Text>
          <View style={styles.chipContainer}>
            {EQUIPMENT_TYPES.map((equipment) => (
              <TouchableOpacity
                key={equipment}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      selectedEquipment === equipment
                        ? colors.purple
                        : colors.cardBackground,
                    borderColor:
                      selectedEquipment === equipment ? colors.purple : colors.border,
                  },
                ]}
                onPress={() =>
                  setSelectedEquipment(
                    selectedEquipment === equipment ? null : equipment
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`Select ${equipment}`}
                accessibilityState={{ selected: selectedEquipment === equipment }}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        selectedEquipment === equipment
                          ? colors.textPrimary
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {equipment}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            Description (Optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.cardBackground,
                color: colors.textPrimary,
                borderColor: colors.border,
              },
            ]}
            placeholder="Brief description of the exercise..."
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: colors.purple },
            loading && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Save exercise"
          accessibilityState={{ disabled: loading }}
        >
          {loading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={[styles.saveButtonText, { color: colors.textPrimary }]}>
              Create Exercise
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    backButton: {
      marginRight: spacing.md,
      padding: spacing.xs,
    },
    title: {
      ...typography.largeTitle,
      flex: 1,
    },
    section: {
      marginBottom: spacing.xl,
    },
    label: {
      ...typography.headline,
      fontWeight: '600',
      marginBottom: spacing.sm,
    },
    input: {
      ...typography.body,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
    },
    textArea: {
      minHeight: 100,
      paddingTop: spacing.md,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
    },
    chipText: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    saveButton: {
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      ...typography.headline,
      color: colors.textPrimary,
      fontWeight: '600',
    },
  });
