import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts';
import type { ThemeColors } from '../../constants/theme';
import type { Exercise } from '../../services';

interface ExercisePickerModalProps {
  visible: boolean;
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({
  visible,
  exercises,
  onSelect,
  onClose,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.exerciseList}>
            {exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                onPress={() => onSelect(exercise)}
                style={styles.exerciseListItem}
              >
                <Text style={styles.exerciseListItemName}>{exercise.name}</Text>
                <Text style={styles.exerciseListItemCategory}>{exercise.category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    exerciseList: {
      padding: 20,
    },
    exerciseListItem: {
      padding: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    exerciseListItemName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    exerciseListItemCategory: {
      fontSize: 14,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
  });
