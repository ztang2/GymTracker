import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import type { HomeScreenProps } from '../navigation/types';
import { getRecentWorkouts, type WorkoutSession } from '../services';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const recent = await getRecentWorkouts('test-user-123', 10);
      setWorkouts(recent);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Workouts</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : workouts.length === 0 ? (
        <Text>No workouts yet. Start your first workout!</Text>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.workoutCard}
              onPress={() => navigation.navigate('WorkoutDetailScreen', { workoutId: item.id })}
            >
              <Text style={styles.workoutDate}>{item.date}</Text>
              <Text style={styles.workoutTime}>
                {new Date(item.start_time).toLocaleTimeString()}
              </Text>
              {item.notes && <Text style={styles.workoutNotes}>{item.notes}</Text>}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  workoutCard: { padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 10 },
  workoutDate: { fontSize: 18, fontWeight: '600' },
  workoutTime: { fontSize: 14, color: '#666', marginTop: 4 },
  workoutNotes: { fontSize: 12, color: '#999', marginTop: 4 },
});
