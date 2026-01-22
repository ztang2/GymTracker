import { View, Text, StyleSheet, Button } from 'react-native';
import { useState } from 'react';
import type { WorkoutScreenProps } from '../navigation/types';
import { createWorkoutSession } from '../services';

export default function WorkoutScreen({ navigation }: WorkoutScreenProps) {
  const [workoutId, setWorkoutId] = useState<string | null>(null);

  const startWorkout = async () => {
    try {
      const session = await createWorkoutSession('test-user-123', {
        date: new Date().toISOString().split('T')[0],
        start_time: new Date().toISOString(),
        end_time: null,
        duration_minutes: null,
        notes: null,
      });
      setWorkoutId(session.id);
    } catch (error) {
      console.error('Failed to start workout:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Workout</Text>
      {!workoutId ? (
        <View>
          <Text style={styles.subtitle}>No active workout</Text>
          <Button title="Start Workout" onPress={startWorkout} />
        </View>
      ) : (
        <View>
          <Text style={styles.subtitle}>Workout in progress</Text>
          <Button
            title="Add Exercise"
            onPress={() => navigation.navigate('ExerciseSelectionScreen', { workoutId })}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 16, marginBottom: 20, color: '#666' },
});
