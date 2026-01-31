import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../contexts';
import { useState, useEffect } from 'react';
import type { ExerciseListScreenProps } from '../navigation/types';
import { getAllExercises, searchExercises, type Exercise } from '../services';

export default function ExerciseListScreen({ navigation }: ExerciseListScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleSearch = async (text: string) => {
    setSearchTerm(text);
    try {
      const data = await searchExercises(text);
      setExercises(data);
    } catch (error) {
      console.error('Failed to search exercises:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercise Library</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search exercises..."
        value={searchTerm}
        onChangeText={handleSearch}
      />
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.exerciseCard}
            onPress={() => navigation.navigate('ExerciseDetailScreen', { exerciseId: item.id })}
          >
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
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  exerciseCard: { padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 10 },
  exerciseName: { fontSize: 16, fontWeight: '500' },
  exerciseCategory: { fontSize: 12, color: '#666', marginTop: 4, textTransform: 'capitalize' },
});
