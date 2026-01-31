import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, spacing, borderRadius } from '../constants/theme';
import { useTheme } from '../contexts';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  icon,
}) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}

      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.8}>
          <LinearGradient
            colors={colors.gradientPurplePink}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  iconContainer: {
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.title2,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...typography.callout,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: spacing.xxl,
  },
  button: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  buttonText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
});

export default EmptyState;
