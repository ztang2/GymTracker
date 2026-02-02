import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts';
import { typography, spacing, borderRadius, shadows } from '../constants/theme';
import { colorGlow } from '../utils';
import { PER_EXERCISE_REST_TIMER_OPTIONS } from '../services';

interface RestTimerOptionsModalProps {
  visible: boolean;
  exerciseName: string;
  currentDuration: number;
  onClose: () => void;
  onSelectDuration: (seconds: number) => void;
}

const formatOptionLabel = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins}min`;
  return `${mins}m ${secs}s`;
};

export const RestTimerOptionsModal: React.FC<RestTimerOptionsModalProps> = ({
  visible,
  exerciseName,
  currentDuration,
  onClose,
  onSelectDuration,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const handleSelect = (seconds: number) => {
    onSelectDuration(seconds);
    setShowCustomInput(false);
    setCustomValue('');
    onClose();
  };

  const handleCustomSubmit = () => {
    const parsed = parseInt(customValue, 10);
    if (parsed > 0 && parsed <= 600) {
      handleSelect(parsed);
    }
  };

  const handleClose = () => {
    setShowCustomInput(false);
    setCustomValue('');
    onClose();
  };

  const presetOptions = PER_EXERCISE_REST_TIMER_OPTIONS;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <Pressable style={styles.container} onPress={() => {}}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons name="timer-outline" size={24} color={colors.orange} />
              </View>
              <Text style={styles.title}>Rest Timer</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {exerciseName}
              </Text>
            </View>

            {/* Preset Options */}
            <View style={styles.optionsGrid}>
              {presetOptions.map((seconds) => {
                const isActive = currentDuration === seconds;
                return (
                  <TouchableOpacity
                    key={seconds}
                    style={[
                      styles.optionButton,
                      isActive && styles.optionButtonActive,
                    ]}
                    onPress={() => handleSelect(seconds)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isActive && styles.optionTextActive,
                      ]}
                    >
                      {formatOptionLabel(seconds)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Input */}
            {showCustomInput ? (
              <View style={styles.customInputContainer}>
                <TextInput
                  style={styles.customInput}
                  value={customValue}
                  onChangeText={setCustomValue}
                  keyboardType="numeric"
                  placeholder="Seconds (1-600)"
                  placeholderTextColor={colors.textTertiary}
                  autoFocus
                  maxLength={3}
                  onSubmitEditing={handleCustomSubmit}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[
                    styles.customSubmitButton,
                    (!customValue || parseInt(customValue, 10) <= 0) &&
                      styles.customSubmitButtonDisabled,
                  ]}
                  onPress={handleCustomSubmit}
                  disabled={!customValue || parseInt(customValue, 10) <= 0}
                >
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.customButton}
                onPress={() => setShowCustomInput(true)}
              >
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={styles.customButtonText}>Custom</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'flex-end',
    },
    keyboardView: {
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: colors.cardBackground,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxxl,
      ...shadows.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(249, 115, 22, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    title: {
      ...typography.title2,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.callout,
      color: colors.textSecondary,
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    optionButton: {
      backgroundColor: colors.backgroundElevated,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 90,
      alignItems: 'center',
    },
    optionButtonActive: {
      backgroundColor: colors.orange,
      borderColor: colors.orange,
      ...colorGlow(colors.orange, 'sm'),
    },
    optionText: {
      ...typography.headline,
      color: colors.textSecondary,
    },
    optionTextActive: {
      color: colors.textPrimary,
    },
    customButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      gap: spacing.xs,
    },
    customButtonText: {
      ...typography.callout,
      color: colors.textSecondary,
    },
    customInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    customInput: {
      flex: 1,
      backgroundColor: colors.backgroundElevated,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      ...typography.body,
      color: colors.textPrimary,
      textAlign: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    customSubmitButton: {
      backgroundColor: colors.orange,
      width: 40,
      height: 40,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    customSubmitButtonDisabled: {
      opacity: 0.4,
    },
  });
