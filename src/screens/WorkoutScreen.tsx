import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { WorkoutScreenProps } from '../navigation/types';
import { createWorkoutSession } from '../services';
import { EmptyState } from '../components';
import { useAuth, useTheme } from '../contexts';
import { typography, spacing, borderRadius ,  type ThemeColors } from '../constants/theme';
import { showAlert } from '../utils/alert';

export default function WorkoutScreen({ navigation }: WorkoutScreenProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [workoutId, setWorkoutId] = useState<string | null>(null);

  const startWorkout = async () => {
    try {
      const session = await createWorkoutSession(user!.id, {
        date: new Date().toISOString().split('T')[0],
        start_time: new Date().toISOString(),
        end_time: null,
        duration_minutes: null,
        notes: null,
      });
      setWorkoutId(session.id);
      navigation.navigate('ActiveWorkoutScreen');
    } catch (error) {
      console.error('Failed to start workout:', error);
      showAlert('Error', 'Failed to start workout. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.purple }]} accessibilityRole="header">
          Workouts
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your workout history
        </Text>
      </View>

      {/* Empty State */}
      <EmptyState
        title="No Workouts Yet"
        message="Your workout history will appear here"
        actionLabel="Start First Workout"
        onAction={startWorkout}
        icon={
          <View style={styles.emptyIcon}>
            <Ionicons name="barbell" size={64} color={colors.purple} />
          </View>
        }
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.largeTitle,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
