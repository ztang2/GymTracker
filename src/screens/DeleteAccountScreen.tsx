import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { showAlert } from '../utils/alert';
import type { StackScreenProps } from '@react-navigation/stack';
import type { ProfileStackParamList } from '../navigation/types';
import { deleteUserAccount } from '../services';
import { typography, spacing, borderRadius } from '../constants/theme';
import { useAuth, useTheme } from '../contexts';

type DeleteAccountScreenProps = StackScreenProps<ProfileStackParamList, 'DeleteAccountScreen'>;

export default function DeleteAccountScreen({ navigation }: DeleteAccountScreenProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmValid = confirmText.trim() === 'DELETE';

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);

    const { error } = await deleteUserAccount(user.id);

    setIsDeleting(false);

    if (error) {
      showAlert('Error', 'Failed to delete account. Please try again or contact support.');
    }
    // On success, user will be signed out and redirected to auth screen automatically
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={handleGoBack} 
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Delete Account</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Warning Icon */}
        <View style={[styles.warningIconContainer, { backgroundColor: '#FF3B3020' }]}>
          <Ionicons name="warning" size={60} color="#FF3B30" />
        </View>

        {/* Warning Title */}
        <Text style={[styles.warningTitle, { color: '#FF3B30' }]}>
          This action cannot be undone
        </Text>

        {/* Warning Message */}
        <Text style={[styles.warningMessage, { color: colors.textSecondary }]}>
          Deleting your account will permanently remove:
        </Text>

        {/* What will be deleted list */}
        <View style={[styles.deleteList, { backgroundColor: colors.cardBackground }]}>
          <DeleteItem text="All workout history and exercise logs" colors={colors} />
          <DeleteItem text="Personal records and achievements" colors={colors} />
          <DeleteItem text="Goals and progress tracking data" colors={colors} />
          <DeleteItem text="Workout templates" colors={colors} />
          <DeleteItem text="User profile and settings" colors={colors} />
        </View>

        {/* Confirmation Input */}
        <View style={styles.confirmSection}>
          <Text style={[styles.confirmLabel, { color: colors.textPrimary }]}>
            Type <Text style={styles.deleteText}>DELETE</Text> to confirm:
          </Text>
          <TextInput
            style={[
              styles.confirmInput,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder="DELETE"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!isDeleting}
          />
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={[
            styles.deleteButton,
            {
              backgroundColor: isConfirmValid && !isDeleting ? '#FF3B30' : colors.border,
              opacity: isConfirmValid && !isDeleting ? 1 : 0.5,
            },
          ]}
          onPress={handleDelete}
          disabled={!isConfirmValid || isDeleting}
          accessibilityRole="button"
          accessibilityLabel="Delete account permanently"
        >
          {isDeleting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete My Account</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.cardBackground }]}
          onPress={handleGoBack}
          disabled={isDeleting}
          accessibilityRole="button"
          accessibilityLabel="Cancel and go back"
        >
          <Text style={[styles.cancelButtonText, { color: colors.textPrimary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

interface DeleteItemProps {
  text: string;
  colors: any;
}

function DeleteItem({ text, colors }: DeleteItemProps) {
  return (
    <View style={styles.deleteItem}>
      <Ionicons name="close-circle" size={20} color="#FF3B30" />
      <Text style={[styles.deleteItemText, { color: colors.textPrimary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: spacing.xxl,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...typography.title2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  warningIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  warningTitle: {
    ...typography.largeTitle,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  warningMessage: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  deleteList: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  deleteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  deleteItemText: {
    ...typography.body,
    flex: 1,
  },
  confirmSection: {
    marginBottom: spacing.xxl,
  },
  confirmLabel: {
    ...typography.body,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  deleteText: {
    ...typography.headline,
    color: '#FF3B30',
  },
  confirmInput: {
    ...typography.body,
    borderWidth: 2,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    textAlign: 'center',
  },
  deleteButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  deleteButtonText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.headline,
  },
});
