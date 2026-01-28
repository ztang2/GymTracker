// Import Supabase directly to avoid React Native dependencies
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const USER_ID = 'test-user-123';

async function clearAndSeedWorkouts() {
  try {
    console.log('🧹 Clearing existing workout data...\n');

    // Delete in correct order due to foreign key constraints
    console.log('Deleting exercise sets...');
    const { error: setsError } = await supabase
      .from('exercise_sets')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (setsError) console.error('Error deleting sets:', setsError);

    console.log('Deleting workout exercises...');
    const { error: weError } = await supabase
      .from('workout_exercises')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (weError) console.error('Error deleting workout exercises:', weError);

    console.log('Deleting workout sessions...');
    const { error: workoutsError } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('user_id', USER_ID);

    if (workoutsError) console.error('Error deleting workouts:', workoutsError);
    console.log('✓ Cleared existing data\n');

    // Now seed fresh data
    console.log('🌱 Creating new workout data...\n');

    // Get exercises
    const { data: exercises } = await supabase
      .from('exercises')
      .select('*');

    if (!exercises || exercises.length === 0) {
      throw new Error('No exercises found in database');
    }
    console.log(`✓ Found ${exercises.length} exercises`);

    // Create workout sessions over the past 30 days
    const today = new Date();
    const workoutDates: string[] = [];

    // Create 20 workouts over the past 30 days (varied schedule with some clusters)
    const workoutPattern = [1, 2, 4, 5, 7, 9, 11, 12, 14, 16, 18, 19, 21, 23, 25, 26, 27, 28, 29, 30];

    for (const daysAgo of workoutPattern) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      workoutDates.push(date.toISOString().split('T')[0]);
    }

    const workoutSessions = [];

    for (const date of workoutDates) {
      const startTime = new Date(date);
      startTime.setHours(Math.floor(Math.random() * 4) + 8, Math.floor(Math.random() * 60));
      const duration = Math.floor(Math.random() * 30) + 45; // 45-75 minutes
      const endTime = new Date(startTime.getTime() + duration * 60000);

      workoutSessions.push({
        user_id: USER_ID,
        date: date,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: duration,
        notes: null,
      });
    }

    const { data: createdWorkouts, error: createError } = await supabase
      .from('workout_sessions')
      .insert(workoutSessions)
      .select();

    if (createError || !createdWorkouts) {
      throw new Error(`Failed to create workouts: ${createError?.message}`);
    }
    console.log(`✓ Created ${createdWorkouts.length} workout sessions`);

    // Add exercises to each workout
    console.log('Adding exercises to workouts...');
    let totalExercisesAdded = 0;
    let totalSetsAdded = 0;

    for (const workout of createdWorkouts) {
      const numExercises = Math.floor(Math.random() * 3) + 4; // 4-6 exercises
      const selectedExercises = exercises
        .sort(() => Math.random() - 0.5)
        .slice(0, numExercises);

      for (let i = 0; i < selectedExercises.length; i++) {
        const exercise = selectedExercises[i];

        const { data: workoutExercise, error: weError } = await supabase
          .from('workout_exercises')
          .insert({
            workout_session_id: workout.id,
            exercise_id: exercise.id,
            order_index: i,
            notes: null,
          })
          .select()
          .single();

        if (weError || !workoutExercise) continue;

        totalExercisesAdded++;

        const numSets = Math.floor(Math.random() * 2) + 3; // 3-4 sets
        const sets = [];

        for (let setNum = 1; setNum <= numSets; setNum++) {
          const weight = Math.floor(Math.random() * 50) + 20; // 20-70 kg
          const reps = Math.floor(Math.random() * 5) + 8; // 8-12 reps

          sets.push({
            workout_exercise_id: workoutExercise.id,
            set_number: setNum,
            weight_kg: weight,
            reps: reps,
            completed: true,
            notes: null,
          });
        }

        await supabase.from('exercise_sets').insert(sets);
        totalSetsAdded += sets.length;
      }
    }

    console.log(`✓ Added ${totalExercisesAdded} exercises`);
    console.log(`✓ Added ${totalSetsAdded} sets\n`);

    console.log('✅ Seeding complete!\n');
    console.log('📊 Summary:');
    console.log(`   • ${createdWorkouts.length} workout sessions`);
    console.log(`   • ${totalExercisesAdded} exercises performed`);
    console.log(`   • ${totalSetsAdded} sets completed`);
    console.log('\n🎉 FitTrack is populated with data!');
    console.log('   Refresh your browser to see the calendar filled with workouts.');

  } catch (error) {
    console.error('\n❌ Failed:', error);
    throw error;
  }
}

clearAndSeedWorkouts()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
