import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { typography, spacing } from '../constants/theme';
import { useTheme } from '../contexts';

interface LoadingStateProps {
  message?: string;
  color?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading your stats...',
  color
}) => {
  const { colors } = useTheme();
  const spinnerColor = color || colors.purpleLight;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={spinnerColor} />
      {message && <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  message: {
    ...typography.callout,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});

export default LoadingState;
