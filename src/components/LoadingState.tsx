import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../constants/theme';

interface LoadingStateProps {
  message?: string;
  color?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading your stats...',
  color = colors.purpleLight
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xxl,
  },
  message: {
    ...typography.callout,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});

export default LoadingState;
