import { supabase } from './supabase';
import { TABLES } from '../constants/tables';
import type { CreateExerciseInput } from './types';

/**
 * Comprehensive exercise library with 125 exercises across 7 muscle group categories
 * Each exercise includes name, category, description, and instructions
 * Distribution: Chest (15), Back (19), Legs (21), Shoulders (15), Arms (23), Core (16), Cardio (16)
 */
export const SEED_EXERCISES: CreateExerciseInput[] = [
  // CHEST EXERCISES (12 exercises)
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
  {
    name: 'Cable Crossover',
    category: 'chest',
    description: 'Cable exercise providing constant tension throughout the movement',
    instructions: 'Stand between cable towers, bring handles together in front of chest, squeeze pecs at peak contraction'
  },
  {
    name: 'Incline Cable Fly',
    category: 'chest',
    description: 'Upper chest isolation using cables on incline bench',
    instructions: 'Set bench to 30-45 degrees, pull cables together above chest, maintain slight elbow bend throughout'
  },
  {
    name: 'Decline Dumbbell Press',
    category: 'chest',
    description: 'Lower chest emphasis with dumbbells on decline bench',
    instructions: 'Secure feet on decline bench, lower dumbbells to lower chest, press up powerfully'
  },
  {
    name: 'Pec Deck Machine',
    category: 'chest',
    description: 'Machine fly isolating the chest muscles',
    instructions: 'Sit with back against pad, bring handles together in front of chest, squeeze and return slowly'
  },
  {
    name: 'Svend Press',
    category: 'chest',
    description: 'Plate squeeze exercise for inner chest',
    instructions: 'Hold plate between palms at chest, press forward squeezing plate, return to chest'
  },
  {
    name: 'Landmine Press',
    category: 'chest',
    description: 'Single-arm or double-arm press using landmine setup',
    instructions: 'Hold barbell end at chest, press up and forward, control descent'
  },
  {
    name: 'Wide Grip Push-ups',
    category: 'chest',
    description: 'Push-up variation with wider hand placement',
    instructions: 'Hands wider than shoulder-width, lower chest to floor, press back up'
  },

  // BACK EXERCISES (14 exercises)
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
  {
    name: 'Romanian Deadlift',
    category: 'back',
    description: 'Deadlift variation emphasizing hamstrings and lower back',
    instructions: 'Hold bar at hip level, hinge at hips keeping legs mostly straight, lower bar along shins, return to standing'
  },
  {
    name: 'T-Bar Row',
    category: 'back',
    description: 'Compound rowing movement with T-bar setup',
    instructions: 'Straddle bar, grip handle, pull to chest while maintaining flat back, squeeze shoulder blades'
  },
  {
    name: 'Wide Grip Lat Pulldown',
    category: 'back',
    description: 'Lat pulldown with wide grip emphasizing lat width',
    instructions: 'Grip bar wider than shoulders, pull to upper chest, focus on elbow drive and lat contraction'
  },
  {
    name: 'Neutral Grip Pulldown',
    category: 'back',
    description: 'Lat pulldown with parallel grip for balanced back development',
    instructions: 'Use neutral grip attachment, pull to chest, squeeze lats at bottom of movement'
  },
  {
    name: 'Single Arm Cable Row',
    category: 'back',
    description: 'Unilateral cable row for isolated back work',
    instructions: 'Stand at cable station, pull handle to hip with one arm, rotate torso slightly, control the return'
  },
  {
    name: 'Inverted Row',
    category: 'back',
    description: 'Bodyweight rowing exercise using bar or rings',
    instructions: 'Hang under bar with body straight, pull chest to bar, keep core tight throughout'
  },
  {
    name: 'Machine Row',
    category: 'back',
    description: 'Machine-based rowing for controlled back development',
    instructions: 'Sit in machine, pull handles to sides of torso, squeeze shoulder blades together'
  },
  {
    name: 'Pendlay Row',
    category: 'back',
    description: 'Explosive barbell row from dead stop on floor',
    instructions: 'Bar on floor each rep, explosively pull to lower chest, reset between reps'
  },
  {
    name: 'Chest Supported Row',
    category: 'back',
    description: 'Row variation eliminating lower back stress',
    instructions: 'Lie chest down on incline bench, row dumbbells to hips'
  },
  {
    name: 'Renegade Row',
    category: 'back',
    description: 'Plank position dumbbell row for core and back',
    instructions: 'Plank on dumbbells, row one dumbbell up while stabilizing, alternate sides'
  },
  {
    name: 'Rack Pull',
    category: 'back',
    description: 'Partial deadlift from elevated position',
    instructions: 'Set bar on rack at knee height, pull to lockout focusing on upper back'
  },
  {
    name: 'Straight Arm Pulldown',
    category: 'back',
    description: 'Lat isolation with straight arms using cable',
    instructions: 'Stand at cable machine, pull bar down with straight arms, squeeze lats'
  },

  // LEGS EXERCISES (15 exercises)
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
  {
    name: 'Walking Lunges',
    category: 'legs',
    description: 'Dynamic lunge variation moving forward',
    instructions: 'Step forward into lunge, push off back foot to step into next lunge, alternate legs continuously'
  },
  {
    name: 'Reverse Lunges',
    category: 'legs',
    description: 'Lunge stepping backward, easier on knees',
    instructions: 'Step backward into lunge position, push through front heel to return to standing'
  },
  {
    name: 'Hack Squat',
    category: 'legs',
    description: 'Machine squat emphasizing quads',
    instructions: 'Position shoulders under pads, feet on platform, squat down keeping back against pad, press up'
  },
  {
    name: 'Calf Raises',
    category: 'legs',
    description: 'Isolation exercise for calf development',
    instructions: 'Stand on edge of platform, raise heels as high as possible, squeeze calves at top, lower below platform level'
  },
  {
    name: 'Seated Calf Raise',
    category: 'legs',
    description: 'Seated calf exercise targeting soleus muscle',
    instructions: 'Sit with weight on knees, raise heels by pushing through balls of feet, squeeze at top'
  },
  {
    name: 'Hip Thrust',
    category: 'legs',
    description: 'Glute-focused exercise with shoulders elevated',
    instructions: 'Upper back on bench, bar over hips, drive hips up by squeezing glutes, hold at top'
  },
  {
    name: 'Sumo Deadlift',
    category: 'legs',
    description: 'Wide-stance deadlift emphasizing inner thighs and glutes',
    instructions: 'Wide stance, toes out, grip bar inside legs, drive through heels keeping chest up'
  },
  {
    name: 'Box Squat',
    category: 'legs',
    description: 'Squat to box for depth consistency',
    instructions: 'Squat back to box, pause briefly, explode up'
  },
  {
    name: 'Step-ups',
    category: 'legs',
    description: 'Unilateral leg exercise stepping onto platform',
    instructions: 'Step onto box with one leg, drive through heel, return to floor, alternate'
  },
  {
    name: 'Glute Bridge',
    category: 'legs',
    description: 'Floor-based glute exercise',
    instructions: 'Lie on back, knees bent, drive hips up by squeezing glutes, hold at top'
  },
  {
    name: 'Single Leg Romanian Deadlift',
    category: 'legs',
    description: 'Balance-challenging hamstring and glute exercise',
    instructions: 'Balance on one leg, hinge at hip lowering weight, maintain straight back'
  },
  {
    name: 'Sissy Squat',
    category: 'legs',
    description: 'Advanced quad isolation exercise',
    instructions: 'Lean back while bending knees, lower body keeping torso straight, return up'
  },
  {
    name: 'Good Morning',
    category: 'legs',
    description: 'Hip hinge exercise for hamstrings and lower back',
    instructions: 'Bar on upper back, hinge at hips keeping legs mostly straight, return to standing'
  },

  // SHOULDERS EXERCISES (12 exercises)
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
  {
    name: 'Cable Lateral Raise',
    category: 'shoulders',
    description: 'Cable variation providing constant tension on side delts',
    instructions: 'Stand beside cable machine, pull handle across body and up to shoulder height, control return'
  },
  {
    name: 'Upright Row',
    category: 'shoulders',
    description: 'Compound movement for shoulders and upper traps',
    instructions: 'Hold bar at thighs, pull straight up to chin keeping elbows high, lower with control'
  },
  {
    name: 'Machine Shoulder Press',
    category: 'shoulders',
    description: 'Guided press movement for shoulder development',
    instructions: 'Sit in machine, press handles overhead, lower to shoulder level with control'
  },
  {
    name: 'Seated Dumbbell Press',
    category: 'shoulders',
    description: 'Seated variation for stricter form and core stability',
    instructions: 'Sit with back support, press dumbbells from shoulders to overhead, control descent'
  },
  {
    name: 'Pike Push-ups',
    category: 'shoulders',
    description: 'Bodyweight shoulder exercise in inverted position',
    instructions: 'Start in downward dog position, lower head toward ground, press back up'
  },
  {
    name: 'Reverse Pec Deck',
    category: 'shoulders',
    description: 'Machine exercise for rear delts',
    instructions: 'Sit facing pec deck, pull handles back squeezing rear delts'
  },
  {
    name: 'Y-Raise',
    category: 'shoulders',
    description: 'Isolation for upper back and rear delts',
    instructions: 'Bend at hips, raise dumbbells in Y formation overhead'
  },
  {
    name: 'Landmine Shoulder Press',
    category: 'shoulders',
    description: 'Single-arm press using landmine',
    instructions: 'Hold landmine barbell at shoulder, press up and slightly forward'
  },

  // ARMS EXERCISES (18 exercises - Biceps & Triceps)
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
    instructions: 'Hold dumbbells at sides, curl up while rotating palms to face shoulders, squeeze at top, lower slowly'
  },
  {
    name: 'Hammer Curl',
    category: 'arms',
    description: 'Targets brachialis and forearms with neutral grip',
    instructions: 'Hold dumbbells with palms facing each other, curl up maintaining neutral grip, lower with control'
  },
  {
    name: 'Preacher Curl',
    category: 'arms',
    description: 'Isolated bicep curl using preacher bench',
    instructions: 'Rest upper arms on preacher pad, curl bar or dumbbells up, squeeze at top, lower slowly'
  },
  {
    name: 'Concentration Curl',
    category: 'arms',
    description: 'Strict bicep isolation curl seated',
    instructions: 'Sit, brace elbow against inner thigh, curl dumbbell up focusing on bicep contraction'
  },
  {
    name: 'Cable Curl',
    category: 'arms',
    description: 'Constant tension bicep exercise using cable machine',
    instructions: 'Stand facing cable machine, curl handle to shoulders maintaining tension throughout, lower slowly'
  },
  {
    name: 'EZ Bar Curl',
    category: 'arms',
    description: 'Bicep curl with angled bar reducing wrist strain',
    instructions: 'Hold EZ bar with underhand grip, curl to shoulders, squeeze biceps at top'
  },
  {
    name: 'Incline Dumbbell Curl',
    category: 'arms',
    description: 'Bicep curl on incline bench for full stretch',
    instructions: 'Lie back on incline bench, let arms hang, curl dumbbells up emphasizing stretch at bottom'
  },
  {
    name: 'Spider Curl',
    category: 'arms',
    description: 'Bicep curl leaning over incline bench',
    instructions: 'Lean chest against incline bench, arms hanging, curl weight up keeping upper arms stationary'
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
    name: 'Tricep Pushdown',
    category: 'arms',
    description: 'Cable tricep isolation exercise',
    instructions: 'Stand at cable machine, push bar or rope down until arms fully extended, control return'
  },
  {
    name: 'Rope Tricep Extension',
    category: 'arms',
    description: 'Cable extension with rope for tricep development',
    instructions: 'Use rope attachment on cable, push down and apart at bottom, squeeze triceps'
  },
  {
    name: 'Close Grip Bench Press',
    category: 'arms',
    description: 'Compound press emphasizing triceps',
    instructions: 'Lie on bench, grip bar shoulder-width or narrower, lower to chest, press up focusing on triceps'
  },
  {
    name: 'Overhead Cable Extension',
    category: 'arms',
    description: 'Cable tricep extension from overhead position',
    instructions: 'Face away from cable, hold rope overhead, extend arms forward and down'
  },
  {
    name: 'Diamond Push-ups',
    category: 'arms',
    description: 'Bodyweight push-up variation targeting triceps',
    instructions: 'Form diamond shape with hands, lower chest to hands, press up emphasizing triceps'
  },
  {
    name: 'Bench Dips',
    category: 'arms',
    description: 'Tricep dips using bench or elevated surface',
    instructions: 'Hands on bench behind you, lower body by bending elbows, press back up'
  },
  {
    name: 'Zottman Curl',
    category: 'arms',
    description: 'Bicep curl with pronated descent',
    instructions: 'Curl dumbbells with supinated grip, rotate to pronated at top, lower slowly'
  },
  {
    name: '21s Curl',
    category: 'arms',
    description: 'Partial rep bicep training method',
    instructions: 'Perform 7 bottom-half reps, 7 top-half reps, 7 full reps continuously'
  },
  {
    name: 'Reverse Curl',
    category: 'arms',
    description: 'Forearm and bicep exercise with overhand grip',
    instructions: 'Hold bar with overhand grip, curl to shoulders, lower with control'
  },
  {
    name: 'Kickback',
    category: 'arms',
    description: 'Tricep isolation with dumbbell',
    instructions: 'Bend at hips, extend arm back until straight, squeeze tricep at top'
  },
  {
    name: 'Drag Curl',
    category: 'arms',
    description: 'Bicep curl variation dragging bar up body',
    instructions: 'Curl bar up close to body, elbows stay back, drag bar along torso'
  },

  // CORE EXERCISES (12 exercises)
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
  {
    name: 'Hanging Knee Raise',
    category: 'core',
    description: 'Hanging ab exercise targeting lower abs',
    instructions: 'Hang from pull-up bar, bring knees to chest, control the descent'
  },
  {
    name: 'Ab Wheel Rollout',
    category: 'core',
    description: 'Advanced core exercise using ab wheel',
    instructions: 'Kneel holding ab wheel, roll forward extending body, pull back using core strength'
  },
  {
    name: 'Bicycle Crunches',
    category: 'core',
    description: 'Dynamic crunch with rotation targeting obliques',
    instructions: 'Lie on back, alternate bringing opposite elbow to knee in cycling motion'
  },
  {
    name: 'Dead Bug',
    category: 'core',
    description: 'Core stability exercise coordinating opposite limbs',
    instructions: 'Lie on back, extend opposite arm and leg while keeping lower back pressed to floor'
  },
  {
    name: 'Pallof Press',
    category: 'core',
    description: 'Anti-rotation core exercise using cable',
    instructions: 'Stand sideways to cable, press handle straight out resisting rotation, return to chest'
  },
  {
    name: 'V-Ups',
    category: 'core',
    description: 'Advanced ab exercise reaching hands to feet',
    instructions: 'Lie flat, simultaneously raise legs and torso to form V shape, touch hands to feet'
  },
  {
    name: 'Flutter Kicks',
    category: 'core',
    description: 'Lower ab exercise with alternating leg movements',
    instructions: 'Lie flat, raise legs slightly, alternate small kicks up and down'
  },
  {
    name: 'Hollow Body Hold',
    category: 'core',
    description: 'Isometric core exercise',
    instructions: 'Lie flat, lift shoulders and legs off ground, hold hollow position'
  },
  {
    name: 'Medicine Ball Slam',
    category: 'core',
    description: 'Explosive core and conditioning exercise',
    instructions: 'Raise medicine ball overhead, slam down forcefully engaging entire core'
  },
  {
    name: 'Woodchopper',
    category: 'core',
    description: 'Rotational core exercise using cable',
    instructions: 'Pull cable from high to low across body in chopping motion, rotate torso'
  },

  // CARDIO EXERCISES (10 exercises)
  {
    name: 'Running',
    category: 'cardio',
    description: 'High-impact cardiovascular exercise, outdoor or treadmill',
    instructions: 'Maintain steady pace, land midfoot, keep shoulders relaxed, breathe rhythmically'
  },
  {
    name: 'Treadmill',
    category: 'cardio',
    description: 'Indoor running or walking on treadmill',
    instructions: 'Set desired speed and incline, maintain steady pace, use safety clip if available'
  },
  {
    name: 'Cycling',
    category: 'cardio',
    description: 'Low-impact cardio on stationary bike or outdoor cycling',
    instructions: 'Maintain consistent cadence, adjust resistance for intensity, keep core engaged'
  },
  {
    name: 'Rowing Machine',
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
  },
  {
    name: 'Stair Climber',
    category: 'cardio',
    description: 'Continuous stair climbing machine for lower body cardio',
    instructions: 'Step continuously at controlled pace, avoid leaning heavily on rails, maintain upright posture'
  },
  {
    name: 'Elliptical',
    category: 'cardio',
    description: 'Low-impact cardio machine with arm and leg movement',
    instructions: 'Maintain smooth stride, engage arms, adjust resistance for desired intensity'
  },
  {
    name: 'Battle Ropes',
    category: 'cardio',
    description: 'High-intensity cardio and conditioning using heavy ropes',
    instructions: 'Hold rope ends, create waves by alternating or moving arms together, maintain intensity'
  },
  {
    name: 'Box Jumps',
    category: 'cardio',
    description: 'Plyometric exercise for power and conditioning',
    instructions: 'Jump explosively onto box, land softly, step down, repeat'
  },
  {
    name: 'High Knees',
    category: 'cardio',
    description: 'Running in place bringing knees high',
    instructions: 'Run in place driving knees to chest height, pump arms, maintain rapid pace'
  },
  {
    name: 'Jumping Jacks',
    category: 'cardio',
    description: 'Classic full-body cardio exercise',
    instructions: 'Jump feet wide while raising arms overhead, return to start, repeat continuously'
  },
  {
    name: 'Assault Bike',
    category: 'cardio',
    description: 'Full-body cardio using air resistance bike',
    instructions: 'Pedal and push-pull handles simultaneously, adjust intensity with effort'
  },
  {
    name: 'Swimming',
    category: 'cardio',
    description: 'Low-impact full-body cardio in water',
    instructions: 'Maintain consistent stroke technique, control breathing, sustain pace'
  },
  {
    name: 'Ski Erg',
    category: 'cardio',
    description: 'Upper body cardio machine simulating skiing',
    instructions: 'Pull handles down and back mimicking ski poles, engage core throughout'
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

    // Check if exercises table already has data
    const { count, error: countError } = await supabase
      .from(TABLES.EXERCISES)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking exercise count:', countError);
      throw new Error(`Failed to check exercises: ${countError.message}`);
    }

    // If all exercises already exist, skip seeding
    if (count && count >= SEED_EXERCISES.length) {
      return;
    }


    // Upsert all seed exercises (insert new ones, skip existing)
    const { data, error: insertError } = await supabase
      .from(TABLES.EXERCISES)
      .upsert(SEED_EXERCISES, { onConflict: 'name' })
      .select();

    if (insertError) {
      console.error('Error inserting exercises:', insertError);
      throw new Error(`Failed to seed exercises: ${insertError.message}`);
    }

  } catch (error) {
    console.error('Seed operation failed:', error);
    throw error;
  }
}
