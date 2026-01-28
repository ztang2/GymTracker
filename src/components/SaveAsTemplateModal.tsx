import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { COMMON_TEMPLATES } from '../services/templateService';

interface SaveAsTemplateModalProps {
  visible: boolean;
  onSave: (name: string, description: string | null) => void;
  onClose: () => void;
  loading?: boolean;
}

// Cross-platform alert helper
const showAlert = (
  title: string,
  message: string,
  buttons: Array<{ text: string; onPress?: () => void }>
) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    buttons[0].onPress?.();
  } else {
    Alert.alert(title, message, buttons);
  }
};

export default function SaveAsTemplateModal({
  visible,
  onSave,
  onClose,
  loading = false,
}: SaveAsTemplateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      showAlert('Name Required', 'Please enter a name for your template.', [
        { text: 'OK' },
      ]);
      return;
    }
    onSave(name.trim(), description.trim() || null);
  };

  const handleQuickSelect = (template: typeof COMMON_TEMPLATES[number]) => {
    setName(template.name);
    setDescription(template.description);
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Save as Template</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Template Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Push Day"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g., Chest, shoulders, and triceps"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={2}
            />

            {/* Quick Select */}
            <Text style={styles.label}>Quick Select</Text>
            <View style={styles.quickSelectGrid}>
              {COMMON_TEMPLATES.slice(0, 6).map((template) => (
                <TouchableOpacity
                  key={template.name}
                  style={[
                    styles.quickSelectButton,
                    name === template.name && styles.quickSelectButtonActive,
                  ]}
                  onPress={() => handleQuickSelect(template)}
                >
                  <Text
                    style={[
                      styles.quickSelectText,
                      name === template.name && styles.quickSelectTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {template.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <LinearGradient
                colors={colors.gradientTealGreen}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveGradient}
              >
                <Ionicons name="bookmark" size={18} color={colors.textPrimary} />
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Template'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.title2,
  },
  form: {
    padding: spacing.xl,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  quickSelectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickSelectButton: {
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickSelectButtonActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  quickSelectText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  quickSelectTextActive: {
    color: colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.backgroundElevated,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.headline,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 2,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  saveButtonText: {
    ...typography.headline,
    color: colors.textPrimary,
  },
});
