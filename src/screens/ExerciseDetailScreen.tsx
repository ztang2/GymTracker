import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts';
import { useState, useEffect } from 'react';
import type { ExerciseDetailScreenProps } from '../navigation/types';
import { getExerciseById, type Exercise } from '../services';

export default function ExerciseDetailScreen({ route }: ExerciseDetailScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { exerciseId } = route.params;
  const [exercise, setExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    loadExercise();
  }, [exerciseId]);

  const loadExercise = async () => {
    try {
      const data = await getExerciseById(exerciseId);
      setExercise(data);
    } catch (error) {
      console.error('Failed to load exercise:', error);
    }
  };

  if (!exercise) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{exercise.name}</Text>
      <Text style={styles.category}>{exercise.category.toUpperCase()}</Text>
      {exercise.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionText}>{exercise.description}</Text>
        </View>
      )}
      {exercise.instructions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.sectionText}>{exercise.instructions}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: colors.textPrimary },
  category: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: colors.textPrimary },
  sectionText: { fontSize: 16, lineHeight: 24, color: colors.textSecondary },
});
