import { supabase } from './supabase';
import type { CreateExerciseInput } from './types';

/**
 * Comprehensive exercise library with 48 exercises across 7 muscle group categories
 * Each exercise includes name, category, description, and instructions
 */
export const SEED_EXERCISES: CreateExerciseInput[] = [
  // CHEST EXERCISES (8 exercises)
  {
    name: 'Bench Press',
    category: 'chest',
    description: 'Classic compound chest exercise using a barbell on a flat bench',
    instructions: 'Lie flat on bench, grip bar slightly wider than shoulders, lower to chest, press up until arms fully extended'
  },
  {
    name: 'Incline Bench Press',
    category: 'chest',
    description: 'Targets upper chest using an inclined bench with barbell',
    instructions: 'Set bench to 30-45 degree incline, lie back, lower bar to upper chest, press up to starting position'
  },
  {
    name: 'Decline Bench Press',
    category: 'chest',
    description: 'Emphasizes lower chest with declined bench angle',
    instructions: 'Secure feet at top of decline bench, lower bar to lower chest, press up maintaining control'
  },
  {
    name: 'Dumbbell Chest Press',
    category: 'chest',
    description: 'Allows greater range of motion than barbell, works stabilizer muscles',
    instructions: 'Lie on bench with dumbbells at chest level, press up until arms extended, lower with control'
  },
  {
    name: 'Incline Dumbbell Press',
    category: 'chest',
    description: 'Upper chest focus with dumbbells on inclined bench',
    instructions: 'Set bench to 30-45 degrees, press dumbbells from shoulder level to overhead, squeeze at top'
  },
  {
    name: 'Push-ups',
    category: 'chest',
    description: 'Bodyweight exercise targeting chest, shoulders, and triceps',
    instructions: 'Start in plank position, lower body until chest nearly touches floor, push back up maintaining straight body line'
  },
  {
    name: 'Dips',
    category: 'chest',
    description: 'Compound bodyweight exercise for lower chest and triceps',
    instructions: 'Grip parallel bars, lean slightly forward, lower body until shoulders below elbows, press back up'
  },
  {
    name: 'Chest Fly',
    category: 'chest',
    description: 'Isolation exercise stretching and contracting chest muscles',
    instructions: 'Lie on bench with dumbbells extended above chest, lower in arc motion with slight elbow bend, bring back together'
  },

  // BACK EXERCISES (7 exercises)
  {
    name: 'Deadlift',
    category: 'back',
    description: 'Fundamental compound exercise working entire posterior chain',
    instructions: 'Stand with feet hip-width, grip bar outside knees, keep back straight, drive through heels to stand fully upright'
  },
  {
    name: 'Pull-ups',
    category: 'back',
    description: 'Bodyweight exercise targeting lats and upper back',
    instructions: 'Hang from bar with overhand grip, pull body up until chin over bar, lower with control'
  },
  {
    name: 'Chin-ups',
    category: 'back',
    description: 'Similar to pull-ups but with underhand grip, more bicep involvement',
    instructions: 'Grip bar with palms facing you, pull up until chin clears bar, focus on squeezing shoulder blades'
  },
  {
    name: 'Barbell Row',
    category: 'back',
    description: 'Compound rowing movement for thickness in mid-back',
    instructions: 'Hinge at hips with slight knee bend, pull bar to lower chest, squeeze shoulder blades together at top'
  },
  {
    name: 'Dumbbell Row',
    category: 'back',
    description: 'Unilateral rowing exercise for balanced back development',
    instructions: 'Place one knee on bench, pull dumbbell to hip keeping elbow close to body, squeeze lat at top'
  },
  {
    name: 'Lat Pulldown',
    category: 'back',
    description: 'Machine exercise mimicking pull-up motion, adjustable resistance',
    instructions: 'Sit at lat pulldown machine, pull bar down to upper chest, squeeze lats, return with control'
  },
  {
    name: 'Seated Cable Row',
    category: 'back',
    description: 'Cable exercise for mid-back thickness and strength',
    instructions: 'Sit at cable row machine, pull handle to abdomen, keep back straight, squeeze shoulder blades together'
  },

  // LEGS EXERCISES (8 exercises)
  {
    name: 'Squat',
    category: 'legs',
    description: 'King of leg exercises, works entire lower body',
    instructions: 'Bar on upper back, feet shoulder-width, lower until thighs parallel to ground, drive through heels to stand'
  },
  {
    name: 'Front Squat',
    category: 'legs',
    description: 'Squat variation with bar on front shoulders, more quad emphasis',
    instructions: 'Rest bar on front shoulders, elbows high, squat keeping torso upright, drive up through heels'
  },
  {
    name: 'Goblet Squat',
    category: 'legs',
    description: 'Squat holding dumbbell or kettlebell at chest, great for form',
    instructions: 'Hold weight at chest, squat keeping elbows inside knees, chest up, drive through full foot'
  },
  {
    name: 'Leg Press',
    category: 'legs',
    description: 'Machine-based leg exercise allowing heavy loading safely',
    instructions: 'Sit in leg press, feet shoulder-width on platform, lower until 90-degree knee bend, press back up'
  },
  {
    name: 'Lunges',
    category: 'legs',
    description: 'Unilateral leg exercise for balance and strength',
    instructions: 'Step forward, lower back knee toward ground, front knee stays over ankle, push back to starting position'
  },
  {
    name: 'Bulgarian Split Squat',
    category: 'legs',
    description: 'Advanced single-leg exercise with rear foot elevated',
    instructions: 'Place rear foot on bench, lower front leg into lunge position, drive through front heel to stand'
  },
  {
    name: 'Leg Curl',
    category: 'legs',
    description: 'Isolation exercise targeting hamstrings',
    instructions: 'Lie face down on leg curl machine, curl heels toward glutes, lower with control'
  },
  {
    name: 'Leg Extension',
    category: 'legs',
    description: 'Isolation exercise for quadriceps development',
    instructions: 'Sit in leg extension machine, extend legs until fully straight, lower with control, keep hips in seat'
  },

  // SHOULDERS EXERCISES (7 exercises)
  {
    name: 'Overhead Press',
    category: 'shoulders',
    description: 'Primary compound movement for shoulder development',
    instructions: 'Stand with barbell at shoulder height, press overhead until arms fully extended, lower with control'
  },
  {
    name: 'Dumbbell Shoulder Press',
    category: 'shoulders',
    description: 'Allows natural arm path and balanced shoulder development',
    instructions: 'Sit or stand with dumbbells at shoulder level, press up until arms extended, lower to shoulder height'
  },
  {
    name: 'Lateral Raise',
    category: 'shoulders',
    description: 'Isolation exercise for side deltoids, creates shoulder width',
    instructions: 'Hold dumbbells at sides, raise arms to parallel with floor keeping slight elbow bend, lower slowly'
  },
  {
    name: 'Front Raise',
    category: 'shoulders',
    description: 'Isolation movement targeting front deltoids',
    instructions: 'Hold dumbbell or barbell in front of thighs, raise to shoulder height, lower with control'
  },
  {
    name: 'Rear Delt Fly',
    category: 'shoulders',
    description: 'Targets often-neglected posterior deltoids',
    instructions: 'Bend at hips, slight knee bend, raise dumbbells out to sides in arc motion, squeeze rear delts'
  },
  {
    name: 'Face Pull',
    category: 'shoulders',
    description: 'Cable exercise for rear delts and upper back health',
    instructions: 'Pull rope attachment to face level, separate hands at end, squeeze shoulder blades, return with control'
  },
  {
    name: 'Arnold Press',
    category: 'shoulders',
    description: 'Rotating press movement for complete shoulder development',
    instructions: 'Start with palms facing you, press while rotating palms forward, reverse motion on way down'
  },

  // ARMS EXERCISES (7 exercises)
  {
    name: 'Barbell Curl',
    category: 'arms',
    description: 'Classic bicep mass builder using barbell',
    instructions: 'Stand holding barbell with underhand grip, curl to shoulders keeping elbows stationary, lower with control'
  },
  {
    name: 'Dumbbell Curl',
    category: 'arms',
    description: 'Allows independent arm training and natural wrist rotation',
    instructions: 'Hold dumbbbells at sides, curl up while rotating palms to face shoulders, squeeze at top, lower slowly'
  },
  {
    name: 'Hammer Curl',
    category: 'arms',
    description: 'Targets brachialis and forearms with neutral grip',
    instructions: 'Hold dumbbells with palms facing each other, curl up maintaining neutral grip, lower with control'
  },
  {
    name: 'Tricep Dip',
    category: 'arms',
    description: 'Bodyweight exercise for tricep mass and strength',
    instructions: 'Grip parallel bars or bench, lower body by bending elbows to 90 degrees, press back up to full extension'
  },
  {
    name: 'Tricep Extension',
    category: 'arms',
    description: 'Isolation exercise targeting all three tricep heads',
    instructions: 'Hold dumbbell overhead with both hands, lower behind head by bending elbows, extend back to starting position'
  },
  {
    name: 'Skull Crusher',
    category: 'arms',
    description: 'Lying tricep extension with barbell or EZ bar',
    instructions: 'Lie on bench holding bar above chest, lower to forehead by bending elbows, extend back up'
  },
  {
    name: 'Cable Curl',
    category: 'arms',
    description: 'Constant tension bicep exercise using cable machine',
    instructions: 'Stand facing cable machine, curl handle to shoulders maintaining tension throughout, lower slowly'
  },

  // CORE EXERCISES (6 exercises)
  {
    name: 'Plank',
    category: 'core',
    description: 'Isometric exercise building core stability and endurance',
    instructions: 'Hold push-up position on forearms, keep body straight from head to heels, engage core throughout'
  },
  {
    name: 'Side Plank',
    category: 'core',
    description: 'Targets obliques and lateral core stability',
    instructions: 'Lie on side supported by forearm, stack feet, lift hips to create straight line, hold position'
  },
  {
    name: 'Crunches',
    category: 'core',
    description: 'Classic abdominal exercise targeting rectus abdominis',
    instructions: 'Lie on back, knees bent, hands behind head, curl shoulders off ground, squeeze abs, lower with control'
  },
  {
    name: 'Russian Twist',
    category: 'core',
    description: 'Rotational core exercise for obliques and stability',
    instructions: 'Sit with knees bent, lean back slightly, rotate torso side to side touching floor beside hips'
  },
  {
    name: 'Leg Raise',
    category: 'core',
    description: 'Lower abdominal exercise, can be done hanging or lying',
    instructions: 'Lie flat or hang from bar, raise legs to 90 degrees keeping them straight, lower with control'
  },
  {
    name: 'Cable Crunch',
    category: 'core',
    description: 'Weighted crunch using cable machine for progressive overload',
    instructions: 'Kneel facing cable machine holding rope attachment, crunch down bringing elbows to knees, squeeze abs'
  },

  // CARDIO EXERCISES (6 exercises)
  {
    name: 'Running',
    category: 'cardio',
    description: 'High-impact cardiovascular exercise, outdoor or treadmill',
    instructions: 'Maintain steady pace, land midfoot, keep shoulders relaxed, breathe rhythmically'
  },
  {
    name: 'Cycling',
    category: 'cardio',
    description: 'Low-impact cardio on stationary bike or outdoor cycling',
    instructions: 'Maintain consistent cadence, adjust resistance for intensity, keep core engaged'
  },
  {
    name: 'Rowing',
    category: 'cardio',
    description: 'Full-body cardio working legs, back, and arms',
    instructions: 'Drive with legs first, lean back, pull handle to chest, reverse motion smoothly'
  },
  {
    name: 'Jump Rope',
    category: 'cardio',
    description: 'High-intensity cardio improving coordination and conditioning',
    instructions: 'Keep elbows close to body, rotate rope with wrists, jump just high enough to clear rope'
  },
  {
    name: 'Burpees',
    category: 'cardio',
    description: 'Full-body conditioning exercise combining squat, plank, and jump',
    instructions: 'Drop to plank, do push-up, jump feet to hands, explode into jump, repeat continuously'
  },
  {
    name: 'Mountain Climbers',
    category: 'cardio',
    description: 'Dynamic core and cardio exercise in plank position',
    instructions: 'Start in plank, rapidly alternate driving knees toward chest, keep hips level, maintain pace'
  }
];

/**
 * Seeds the exercises table with the comprehensive exercise library
 * This function is idempotent - safe to run multiple times without creating duplicates
 *
 * @throws Error if Supabase operation fails
 * @returns Promise that resolves when seeding is complete
 */
export async function seedExercises(): Promise<void> {
  try {
    console.log('Checking if exercises already exist...');

    // Check if exercises table already has data
    const { count, error: countError } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking exercise count:', countError);
      throw new Error(`Failed to check exercises: ${countError.message}`);
    }

    // If exercises already exist, skip seeding
    if (count && count > 0) {
      console.log(`✓ Exercises already seeded (${count} exercises found)`);
      return;
    }

    console.log('No exercises found. Seeding exercise library...');

    // Insert all seed exercises
    const { data, error: insertError } = await supabase
      .from('exercises')
      .insert(SEED_EXERCISES)
      .select();

    if (insertError) {
      console.error('Error inserting exercises:', insertError);
      throw new Error(`Failed to seed exercises: ${insertError.message}`);
    }

    console.log(`✓ Successfully seeded ${data?.length || SEED_EXERCISES.length} exercises`);
    console.log('Categories:', ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio']);
  } catch (error) {
    console.error('Seed operation failed:', error);
    throw error;
  }
}
