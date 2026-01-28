// Import Supabase directly to avoid React Native dependencies
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Seed exercises data (copied from seedData.ts to avoid imports)
const SEED_EXERCISES = [
  { name: 'Bench Press', category: 'Chest', description: 'Classic compound chest exercise', instructions: 'Lie flat on bench, grip bar slightly wider than shoulders' },
  { name: 'Squat', category: 'Legs', description: 'Compound leg exercise', instructions: 'Stand with feet shoulder-width apart' },
  { name: 'Deadlift', category: 'Back', description: 'Full body compound movement', instructions: 'Grip bar, lift with legs and back' },
  { name: 'Shoulder Press', category: 'Shoulders', description: 'Overhead pressing movement', instructions: 'Press dumbbells or barbell overhead' },
  { name: 'Pull-ups', category: 'Back', description: 'Bodyweight back exercise', instructions: 'Hang from bar, pull up until chin over bar' },
  { name: 'Dumbbell Curl', category: 'Arms', description: 'Bicep isolation', instructions: 'Curl dumbbells up, keep elbows stable' },
  { name: 'Tricep Dips', category: 'Arms', description: 'Tricep bodyweight exercise', instructions: 'Lower body, press back up' },
  { name: 'Plank', category: 'Core', description: 'Core stability exercise', instructions: 'Hold plank position' },
  { name: 'Lunges', category: 'Legs', description: 'Single leg movement', instructions: 'Step forward, lower back knee' },
  { name: 'Lat Pulldown', category: 'Back', description: 'Upper back exercise', instructions: 'Pull bar down to chest' },
];

async function seedExercises() {
  const { count } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true });

  if (count && count > 0) {
    console.log(`✓ Exercises already seeded (${count} exercises found)`);
    return;
  }

  const { data } = await supabase
    .from('exercises')
    .insert(SEED_EXERCISES)
    .select();

  console.log(`✓ Successfully seeded ${data?.length || SEED_EXERCISES.length} exercises`);
}

const USER_ID = 'test-user-123';

/**
 * Generate random workout sessions over the past 30 days
 */
async function seedWorkouts() {
  try {
    console.log('🌱 Starting workout data seeding...\n');

    // Step 1: Seed exercises first
    console.log('Step 1: Seeding exercises...');
    await seedExercises();

    // Step 2: Get exercises from database
    console.log('\nStep 2: Fetching exercises...');
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*');

    if (exercisesError || !exercises || exercises.length === 0) {
      throw new Error('Failed to fetch exercises or no exercises found');
    }
    console.log(`✓ Found ${exercises.length} exercises`);

    // Step 3: Check if workouts already exist
    console.log('\nStep 3: Checking existing workouts...');
    const { count } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', USER_ID);

    if (count && count > 0) {
      console.log(`✓ Found ${count} existing workouts. Skipping seed.`);
      console.log('\n💡 To reseed, delete existing workouts first.');
      return;
    }

    // Step 4: Create workout sessions over the past 30 days
    console.log('\nStep 4: Creating workout sessions...');
    const today = new Date();
    const workoutDates: string[] = [];

    // Create 20 workouts over the past 30 days (varied schedule)
    const workoutPattern = [1, 2, 4, 5, 7, 9, 11, 12, 14, 16, 18, 19, 21, 23, 25, 26, 27, 28, 29, 30];

    for (const daysAgo of workoutPattern) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      workoutDates.push(date.toISOString().split('T')[0]);
    }

    const workoutSessions = [];

    for (const date of workoutDates) {
      const startTime = new Date(date);
      startTime.setHours(Math.floor(Math.random() * 4) + 8, Math.floor(Math.random() * 60)); // Random time 8-12am
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

    const { data: createdWorkouts, error: workoutsError } = await supabase
      .from('workout_sessions')
      .insert(workoutSessions)
      .select();

    if (workoutsError || !createdWorkouts) {
      throw new Error(`Failed to create workouts: ${workoutsError?.message}`);
    }
    console.log(`✓ Created ${createdWorkouts.length} workout sessions`);

    // Step 5: Add exercises to each workout
    console.log('\nStep 5: Adding exercises to workouts...');
    let totalExercisesAdded = 0;
    let totalSetsAdded = 0;

    for (const workout of createdWorkouts) {
      // Each workout has 4-6 exercises
      const numExercises = Math.floor(Math.random() * 3) + 4;
      const selectedExercises = exercises
        .sort(() => Math.random() - 0.5)
        .slice(0, numExercises);

      for (let i = 0; i < selectedExercises.length; i++) {
        const exercise = selectedExercises[i];

        // Add workout exercise
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

        if (weError || !workoutExercise) {
          console.error(`Failed to add exercise to workout: ${weError?.message}`);
          continue;
        }

        totalExercisesAdded++;

        // Add 3-4 sets for each exercise
        const numSets = Math.floor(Math.random() * 2) + 3;
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

        const { error: setsError } = await supabase
          .from('exercise_sets')
          .insert(sets);

        if (setsError) {
          console.error(`Failed to add sets: ${setsError.message}`);
        } else {
          totalSetsAdded += sets.length;
        }
      }
    }

    console.log(`✓ Added ${totalExercisesAdded} exercises across all workouts`);
    console.log(`✓ Added ${totalSetsAdded} total sets`);

    console.log('\n✅ Seeding complete!');
    console.log('\n📊 Summary:');
    console.log(`   • ${exercises.length} exercises in library`);
    console.log(`   • ${createdWorkouts.length} workout sessions`);
    console.log(`   • ${totalExercisesAdded} exercises performed`);
    console.log(`   • ${totalSetsAdded} sets completed`);
    console.log('\n🎉 Your FitTrack app is now populated with data!');
    console.log('   Refresh your browser to see the calendar, stats, and workouts.');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

// Run the seed function
seedWorkouts()
  .then(() => {
    console.log('\n👋 Seeding script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding script failed:', error);
    process.exit(1);
  });
