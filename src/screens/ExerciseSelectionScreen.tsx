import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts';
import { useState, useEffect } from 'react';
import type { ExerciseSelectionScreenProps } from '../navigation/types';
import { getAllExercises, addExerciseToWorkout, type Exercise } from '../services';

export default function ExerciseSelectionScreen({ route, navigation }: ExerciseSelectionScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { workoutId } = route.params;
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const data = await getAllExercises();
      setExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const selectExercise = async (exerciseId: string) => {
    try {
      await addExerciseToWorkout(workoutId, exerciseId, 0);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to add exercise:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Exercise</Text>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.exerciseCard} onPress={() => selectExercise(item.id)}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text style={styles.exerciseCategory}>{item.category}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  exerciseCard: { padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 10 },
  exerciseName: { fontSize: 16, fontWeight: '500' },
  exerciseCategory: { fontSize: 12, color: '#666', marginTop: 4, textTransform: 'capitalize' },
});
