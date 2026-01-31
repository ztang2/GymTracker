import { View, Text, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import type { WorkoutDetailScreenProps } from '../navigation/types';
import { getWorkoutSession, type WorkoutSessionWithExercises } from '../services';
import { useAuth , useTheme } from '../contexts';

export default function WorkoutDetailScreen({ route }: WorkoutDetailScreenProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const { workoutId } = route.params;
  const [workout, setWorkout] = useState<WorkoutSessionWithExercises | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    try {
      const data = await getWorkoutSession(workoutId, user!.id);
      setWorkout(data);
    } catch (error) {
      console.error('Failed to load workout:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.container}><Text>Loading...</Text></View>;
  if (!workout) return <View style={styles.container}><Text>Workout not found</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Details</Text>
      <Text>Date: {workout.date}</Text>
      <Text>Duration: {workout.duration_minutes || 'In progress'} minutes</Text>
      <Text style={styles.exercisesTitle}>Exercises ({workout.exercises.length})</Text>
      {workout.exercises.map((we) => (
        <View key={we.id} style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{we.exercise.name}</Text>
          <Text>{we.sets.length} sets</Text>
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  exercisesTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  exerciseCard: { padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 8 },
  exerciseName: { fontSize: 16, fontWeight: '500' },
});
